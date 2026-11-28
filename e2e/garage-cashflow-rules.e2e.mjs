// E2E luật phiếu thu chi garage trên UI, hai tab `/garage-cashflow?tab=vouchers|forecast`.
// Kiểm: nội dung theo loại phiếu, "Chuyển khoản khác", chặn lưu khi thiếu field, thứ tự cột Ghi chú,
// cột và bộ lọc quá hạn. Chỉ chạy trên staging/dev.
// Env: E2E_PASSWORD (bắt buộc), E2E_ADMIN_EMAIL (mặc định ai-test-admin), E2E_WEB_URL/E2E_API_URL.
// Phiếu nền tạo qua API, không gắn phiếu dịch vụ; `finally` xóa phiếu đã tạo.
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
const LIST_PATH = "/api/v1/greenway/cashflow-vouchers";

const results = [];
const check = (name, ok, detail = "") => {
  results.push(Boolean(ok));
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

const dueDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date(Date.now() - 100 * 86_400_000));
const created = await api("POST", "", {
  voucherType: "RECEIPT",
  paymentStatus: "EXPECTED",
  amount: 1000,
  transDate: dueDate,
  note: `SMOKE-RULES-E2E ${Date.now() % 100000}`,
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
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
let writes = 0;
page.on("request", (req) => {
  if (req.url().includes(LIST_PATH) && req.method() !== "GET") writes += 1;
});

const headers = async () =>
  (await page.locator("table:visible thead th").allInnerTexts()).map((s) =>
    s.replace(/\s+/g, " ").trim().toLowerCase(),
  );
const indexOfHeader = (list, name) =>
  list.findIndex((h) => h.startsWith(name.toLowerCase()));
// Popover của ô chọn cũng mang role=dialog nên lọc drawer theo tiêu đề.
const TITLE = "Tạo Phiếu Thu Chi Mới";
const drawer = () => page.getByRole("dialog").filter({ hasText: TITLE });

async function openTab(tab) {
  await page.goto(`${WEB}/garage-cashflow?tab=${tab}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.locator("table:visible tbody tr").first().waitFor({
    timeout: 60000,
  });
}

/** Mở ô chọn trong drawer theo chữ đang hiện, trả về danh sách lựa chọn rồi chọn `pick`. */
async function chooseFrom(trigger, pick) {
  await drawer().getByText(trigger, { exact: true }).first().click();
  const listbox = page.getByRole("listbox").last();
  await listbox.waitFor({ timeout: 10000 });
  const options = (await listbox.getByRole("option").allInnerTexts()).map((s) =>
    s.trim(),
  );
  if (pick) {
    await listbox.getByRole("option", { name: pick, exact: true }).click();
  } else {
    // Popover của V2Combobox đóng khi bấm ra ngoài.
    await drawer().getByText("Ngày giao dịch").first().click();
  }
  await listbox.waitFor({ state: "hidden", timeout: 10000 });
  return options;
}

try {
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 60000 },
  );

  // A. Tab Thu chi: form theo loại phiếu.
  await openTab("vouchers");
  const voucherHeaders = await headers();
  check(
    "A1 tab Thu chi không có cột quá hạn",
    indexOfHeader(voucherHeaders, "Quá hạn") === -1,
    voucherHeaders.join("|"),
  );
  await page.getByRole("button", { name: "Tạo phiếu mới" }).first().click();
  await drawer().waitFor({ timeout: 15000 });

  const receiptContents = await chooseFrom("Chọn hoặc nhập nội dung...");
  check(
    "A2 phiếu thu: chỉ nội dung thu",
    receiptContents.includes("3. BH thanh toán") &&
      !receiptContents.includes("4. HHBH"),
    receiptContents.join("|"),
  );
  const methods = await chooseFrom("Chọn phương thức...");
  check(
    "A3 có phương thức Chuyển khoản khác",
    methods.includes("Chuyển khoản khác"),
    methods.join("|"),
  );

  await drawer().getByPlaceholder("0", { exact: true }).first().fill("1000");
  writes = 0;
  await drawer().getByRole("button", { name: "Lưu", exact: true }).click();
  const toast = await page
    .getByText("phải có phương thức thanh toán")
    .first()
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  check("A4 đã thu thiếu phương thức: chặn lưu", toast && writes === 0);

  await chooseFrom("Chọn hoặc nhập nội dung...", "3. BH thanh toán");
  check(
    "A5 nhắc ghi lý do khi thiếu phiếu dịch vụ",
    await drawer().getByText("hoặc ghi lý do vào Ghi chú").isVisible(),
  );
  await chooseFrom("Thu (RECEIPT)", "Chi (PAYMENT)");
  check(
    "A6 đổi sang phiếu chi: bỏ nội dung sai loại",
    (await drawer().getByText("3. BH thanh toán").count()) === 0,
  );
  const paymentContents = await chooseFrom("Chọn hoặc nhập nội dung...");
  check(
    "A7 phiếu chi: chỉ nội dung chi",
    paymentContents.includes("9. Phụ tùng / vật tư") &&
      !paymentContents.includes("3. BH thanh toán"),
    paymentContents.join("|"),
  );
  await page.screenshot({ path: `${ART}garage-cashflow-rules-drawer.png` });

  // B. Tab Dự thu chi: cột và bộ lọc quá hạn.
  await openTab("forecast");
  const forecastHeaders = await headers();
  const overdueAt = indexOfHeader(forecastHeaders, "Quá hạn");
  check(
    "B1 tab Dự thu chi có cột quá hạn sau ngày dự kiến",
    overdueAt > 0 &&
      overdueAt === indexOfHeader(forecastHeaders, "Ngày dự kiến") + 1,
    forecastHeaders.join("|"),
  );
  const noteAt = indexOfHeader(forecastHeaders, "Ghi chú");
  if (noteAt >= 0) {
    check(
      "B2 Ghi chú nằm cạnh Nội dung TT",
      noteAt === indexOfHeader(forecastHeaders, "Nội dung TT") + 1,
      forecastHeaders.join("|"),
    );
  } else {
    console.log("[info] view mặc định ẩn cột Ghi chú, thứ tự do vitest kiểm");
  }
  await page.screenshot({ path: `${ART}garage-cashflow-rules-forecast.png` });

  const filtered = page.waitForRequest(
    (r) =>
      r.url().includes(`${LIST_PATH}?`) &&
      (new URL(r.url()).searchParams.get("column_filters") || "").includes(
        "D90_PLUS",
      ),
    { timeout: 40000 },
  );
  // Tránh promise bị reject ngoài try khi một thao tác phía dưới lỗi.
  filtered.catch(() => null);
  // Nút mở bộ lọc là cả phần tiêu đề cột.
  await page
    .locator("table:visible thead th")
    .nth(overdueAt)
    .locator("[aria-haspopup=dialog]")
    .click();
  await page.getByText("Trên 90 ngày", { exact: true }).last().click();
  const apply = page.getByRole("button", { name: /^(Áp dụng|Lọc)$/ }).last();
  if (await apply.isVisible().catch(() => false)) await apply.click();
  const request = await filtered;
  const response = await request.response();
  const body = await response.json();
  const rows = body?.data?.data ?? body?.data ?? [];
  const limit = dueDate; // phiếu nền quá hạn 100 ngày phải thuộc nhóm trên 90
  check(
    "B3 lọc Trên 90 ngày: API 200, mọi dòng quá hạn trên 90 ngày",
    response.status() === 200 &&
      rows.length > 0 &&
      rows.every(
        (r) =>
          (Date.now() - Date.parse(r.transDate.slice(0, 10))) / 86_400_000 > 90,
      ),
    `status=${response.status()} rows=${rows.length} mốc=${limit}`,
  );
} catch (e) {
  check("Ngoại lệ", false, e?.message);
  await page.screenshot({ path: `${ART}garage-cashflow-rules-fail.png` });
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
