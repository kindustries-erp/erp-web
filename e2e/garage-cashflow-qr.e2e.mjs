// E2E thông tin thanh toán và mã QR của phiếu thu chi garage (`/garage-cashflow?tab=vouchers`, KINDU-2096).
// Luồng: phiếu chi tạo qua API -> mở drawer ở chế độ xem (ô QR bị khóa) -> Chỉnh sửa -> chọn ngân hàng,
// nhập số TK, tên, nội dung -> Lưu -> API trả và lưu DB -> mở lại thấy giá trị đã lưu -> In phiếu có QR.
// Chỉ chạy trên staging/dev. Env: E2E_PASSWORD (bắt buộc), E2E_ADMIN_EMAIL (mặc định ai-test-admin), E2E_WEB_URL/E2E_API_URL.
// `finally` xóa phiếu đã tạo.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const WEB = resolveWebUrl();
const API = resolveApiUrl();
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "ai-test-admin@example.com";
const PASSWORD = process.env.E2E_PASSWORD;
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD.");
  process.exit(2);
}
const ART = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(ART, { recursive: true });

const tag = Date.now() % 100000;
const ACC_NO = `9${tag}123`;
const ACC_NAME = "E2E QR NGUOI NHAN";
const CONTENT = `E2E QR ${tag}`;
const LIST_PATH = "/api/v1/greenway/cashflow-vouchers";

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : ` :: ${detail}`}`);
};

const loginRes = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await loginRes.json()).data?.accessToken;
if (!token) {
  console.error(`login API -> ${loginRes.status}`);
  process.exit(1);
}
async function api(method, path, body) {
  const r = await fetch(`${API}${LIST_PATH}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await r.json().catch(() => null);
  return { status: r.status, d: j?.data ?? j };
}

const created = await api("POST", "", {
  voucherType: "PAYMENT",
  // Tab "Phiếu thu chi" chỉ hiện phiếu thực chi (PENDING nằm ở tab dự thu chi).
  paymentStatus: "PAID",
  amount: 1000,
  transDate: new Date().toISOString().slice(0, 10),
  note: `E2E garage-cashflow-qr ${tag}`,
});
const voucherId = created.d?.id;
const code = created.d?.voucherCode;
if (created.status !== 201 || !voucherId) {
  console.error(`Tạo phiếu nền thất bại: ${created.status}`);
  process.exit(1);
}
console.log(`[info] phiếu nền ${code}`);

const browser = await chromium.launch({
  executablePath: process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
// Chặn hộp in thật của trình duyệt; mẫu in vẫn được dựng trong DOM.
await page.addInitScript(() => {
  window.print = () => undefined;
});
// Chỉ lấy đúng phiếu test trong bảng: thêm column_filters theo mã phiếu vào request list.
await page.route(
  (url) =>
    url.pathname === LIST_PATH && !url.searchParams.has("column_filters"),
  (route, req) => {
    if (req.method() !== "GET") return route.continue();
    const u = new URL(req.url());
    u.searchParams.set(
      "column_filters",
      JSON.stringify({ voucherCode: [code] }),
    );
    return route.continue({ url: u.toString() });
  },
);

const drawer = () =>
  page.getByRole("dialog").filter({ hasText: `Phiếu ${code}` });
const accInput = () => drawer().getByPlaceholder("Nhập số tài khoản");
const nameInput = () => drawer().getByPlaceholder("Ví dụ: NGUYEN VAN A");
const contentInput = () =>
  drawer().getByPlaceholder("Nội dung", { exact: true });

async function openDrawer() {
  await page.goto(`${WEB}/garage-cashflow?tab=vouchers`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const row = page.locator("table tbody tr").filter({ hasText: code }).first();
  await row.waitFor({ timeout: 30000 });
  await row.getByRole("button", { name: "Xem chi tiết" }).first().click();
  await drawer().waitFor({ timeout: 15000 });
}

try {
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );

  // A. Chế độ xem: mọi ô thanh toán bị khóa.
  await openDrawer();
  check("A1 xem: ô số TK bị khóa", await accInput().isDisabled());
  check("A2 xem: ô nội dung bị khóa", await contentInput().isDisabled());
  check(
    "A3 xem: không có nút Lưu",
    (await drawer()
      .getByRole("button", { name: "Lưu", exact: true })
      .count()) === 0,
  );

  // B. Chỉnh sửa: mở khóa, nhập và lưu.
  await drawer()
    .getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" })
    .click();
  await accInput().waitFor();
  check("B1 sửa: ô số TK mở khóa", await accInput().isEnabled());
  check(
    "B2 sửa: số tiền QR vẫn khóa",
    await drawer().getByLabel("Số tiền thanh toán (VND)").isDisabled(),
  );
  await drawer().getByText("Chọn ngân hàng", { exact: true }).first().click();
  await page.getByRole("option", { name: /BIDV/ }).first().click();
  await accInput().fill(ACC_NO);
  await nameInput().fill(ACC_NAME);
  await contentInput().fill(CONTENT);
  // Thẻ QR có logo VietQR (cùng alt) phía trên ảnh mã QR: lấy ảnh cuối là mã QR.
  const qrImg = drawer().getByAltText("VietQR").last();
  await qrImg.waitFor({ timeout: 15000 });
  check(
    "B3 sửa: QR xem trước là PNG",
    (await qrImg.getAttribute("src"))?.startsWith("data:image/png"),
  );

  const [putRes] = await Promise.all([
    page.waitForResponse(
      (r) =>
        r.request().method() === "PUT" &&
        r.url().includes(`${LIST_PATH}/${voucherId}`),
      { timeout: 20000 },
    ),
    drawer().getByRole("button", { name: "Lưu", exact: true }).click(),
  ]);
  const putBody = await putRes.json().catch(() => null);
  const saved = putBody?.data ?? putBody;
  check(
    "B4 lưu: PUT 200",
    putRes.status() === 200,
    `status=${putRes.status()}`,
  );
  check(
    "B5 lưu: response có QR",
    saved?.qrAccountNumber === ACC_NO &&
      saved?.qrBankCode === "BIDV" &&
      saved?.qrTransferContent === CONTENT,
    JSON.stringify(saved),
  );

  // C. DB đã lưu (đọc lại qua API list).
  const filters = encodeURIComponent(JSON.stringify({ voucherCode: [code] }));
  const list = await api(
    "GET",
    `?tab=all&pageSize=5&column_filters=${filters}`,
  );
  const dbRow = (Array.isArray(list.d) ? list.d : (list.d?.data ?? [])).find(
    (r) => r.id === voucherId,
  );
  check(
    "C1 DB: thông tin thanh toán đã lưu",
    dbRow?.qrAccountNumber === ACC_NO &&
      dbRow?.qrAccountName === ACC_NAME &&
      /^\d{6}$/.test(dbRow?.qrBankBin ?? ""),
    JSON.stringify(dbRow),
  );

  // D. Mở lại: thấy giá trị đã lưu, vẫn khóa ở chế độ xem.
  await openDrawer();
  check(
    "D1 mở lại: số TK đã lưu",
    (await accInput().inputValue()) === ACC_NO,
    await accInput().inputValue(),
  );
  check(
    "D2 mở lại: nội dung đã lưu",
    (await contentInput().inputValue()) === CONTENT,
  );
  check("D3 mở lại: vẫn khóa", await accInput().isDisabled());

  // E. In phiếu từ footer drawer: mẫu in có QR.
  await drawer().getByRole("button", { name: "In phiếu", exact: true }).click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("img")].some(
        (i) =>
          i.src.startsWith("data:image/png") && !i.closest("[role=dialog]"),
      ),
    null,
    { timeout: 15000 },
  );
  const printText = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter(
        (i) =>
          i.src.startsWith("data:image/png") && !i.closest("[role=dialog]"),
      )
      // Thẻ QR ngang trong mẫu in: số TK nằm ở khối chi tiết cạnh khối QR, lấy chữ của khối thẻ bao ngoài.
      .map((i) => {
        let el = i;
        for (let k = 0; k < 6 && el.parentElement; k += 1) el = el.parentElement;
        return el.textContent ?? "";
      })
      .join(" "),
  );
  check("E1 in: mẫu in có ảnh QR", true);
  check(
    "E2 in: ghi chú ngân hàng đúng tài khoản",
    printText.includes(ACC_NO),
    printText.slice(0, 200),
  );

  // F. Tạo phiếu mới (không lưu): thu -> chi bỏ tài khoản công ty; số TK được chuẩn hóa, sai thì báo lỗi.
  await page.keyboard.press("Escape");
  await page.goto(`${WEB}/garage-cashflow?tab=vouchers`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page
    .getByRole("button", { name: "Tạo phiếu mới", exact: true })
    .click();
  const createDlg = page
    .getByRole("dialog")
    .filter({ hasText: "Tạo Phiếu Thu Chi Mới" });
  await createDlg.waitFor({ timeout: 15000 });
  await createDlg
    .getByText("Tài khoản công ty nhận tiền", { exact: true })
    .waitFor({ timeout: 10000 });
  check("F1 phiếu mới mặc định là phiếu thu có tài khoản công ty", true);
  await createDlg
    .getByText(/Thu \(RECEIPT\)/)
    .first()
    .click();
  await page
    .getByRole("option", { name: /Chi \(PAYMENT\)/ })
    .first()
    .click();
  const newAcc = createDlg.getByPlaceholder("Nhập số tài khoản");
  await newAcc.waitFor({ timeout: 10000 });
  // Bỏ thông tin của loại cũ chạy trong effect sau khi render, chờ ô về rỗng.
  await page
    .waitForFunction(
      () =>
        document.querySelector(
          '[role=dialog] input[placeholder="Nhập số tài khoản"]',
        )?.value === "",
      null,
      { timeout: 5000 },
    )
    .catch(() => undefined);
  check(
    "F2 đổi sang phiếu chi: số TK trống (không giữ TK công ty)",
    (await newAcc.inputValue()) === "",
    await newAcc.inputValue(),
  );
  await newAcc.fill("0987 654-321");
  check(
    "F3 số TK bỏ dấu cách và gạch",
    (await newAcc.inputValue()) === "0987654321",
    await newAcc.inputValue(),
  );
  await newAcc.fill("12/34");
  check(
    "F4 số TK sai hiện lỗi tại ô",
    await createDlg
      .getByText("Số tài khoản chỉ gồm 1-19 ký tự chữ hoặc số")
      .isVisible(),
  );
} catch (e) {
  check("Ngoại lệ", false, e?.message);
  await page.screenshot({ path: `${ART}garage-cashflow-qr-fail.png` });
} finally {
  const del = await api("DELETE", `/${voucherId}`);
  check(
    "Z dọn phiếu E2E",
    del.status === 200 || del.status === 204,
    `status=${del.status}`,
  );
  await browser.close();
}

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
