// E2E tab Dự thu chi của phiếu thu chi garage (`/garage-cashflow?tab=forecast`, KINDU-2154).
// Luồng: phiếu chi PENDING tạo qua API -> mở drawer -> Chỉnh sửa -> mở danh sách ngân hàng và cuộn bằng
// con lăn (danh sách nằm trong popover, drawer là Dialog modal) -> chọn ngân hàng, nhập số TK -> Lưu ->
// KHÔNG tải lại trang, mở lại phiếu từ bảng: phải thấy thông tin vừa lưu (bảng dự thu chi được làm mới).
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
const ACC_NO = `8${tag}456`;
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

// Phiếu chi PENDING thuộc tab Dự thu chi.
const created = await api("POST", "", {
  voucherType: "PAYMENT",
  paymentStatus: "PENDING",
  amount: 2000,
  transDate: new Date().toISOString().slice(0, 10),
  note: `E2E garage-cashflow-forecast ${tag}`,
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
const tableRow = () =>
  page.locator("table tbody tr").filter({ hasText: code }).first();

async function openFromTable() {
  await tableRow().waitFor({ timeout: 30000 });
  await tableRow().getByRole("button", { name: "Xem chi tiết" }).first().click();
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

  await page.goto(`${WEB}/garage-cashflow?tab=forecast`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await openFromTable();
  await drawer()
    .getByRole("button", { name: "Chuyển sang chế độ chỉnh sửa" })
    .click();
  await accInput().waitFor();

  // A. Danh sách ngân hàng trong popover cuộn được bằng con lăn khi nằm trong drawer.
  await drawer().getByText("Chọn ngân hàng", { exact: true }).first().click();
  const listbox = page.getByRole("listbox").last();
  await listbox.waitFor({ timeout: 10000 });
  await page.waitForFunction(
    () => {
      const lists = document.querySelectorAll("[role=listbox]");
      const el = lists[lists.length - 1];
      return el && el.scrollHeight > el.clientHeight + 20;
    },
    null,
    { timeout: 15000 },
  );
  const before = await listbox.evaluate((el) => el.scrollTop);
  await listbox.hover();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(400);
  const after = await listbox.evaluate((el) => el.scrollTop);
  check(
    "A1 cuộn danh sách ngân hàng bằng con lăn trong drawer",
    after > before,
    `scrollTop ${before} -> ${after}`,
  );

  // B. Chọn ngân hàng, nhập số TK, lưu.
  await page.keyboard.type("BIDV");
  await page.getByRole("option", { name: /BIDV/ }).first().click();
  await accInput().fill(ACC_NO);
  const [putRes] = await Promise.all([
    page.waitForResponse(
      (r) =>
        r.request().method() === "PUT" &&
        r.url().includes(`${LIST_PATH}/${voucherId}`),
      { timeout: 20000 },
    ),
    drawer().getByRole("button", { name: "Lưu", exact: true }).click(),
  ]);
  check("B1 lưu: PUT 200", putRes.status() === 200, `status=${putRes.status()}`);

  // C. Không tải lại trang: bảng dự thu chi phải tải lại sau khi lưu.
  const refetch = await page
    .waitForResponse(
      (r) =>
        r.request().method() === "GET" &&
        r.url().includes(LIST_PATH) &&
        new URL(r.url()).searchParams.get("tab") === "forecast",
      { timeout: 15000 },
    )
    .catch(() => null);
  check("C1 bảng dự thu chi tải lại sau khi lưu", Boolean(refetch));
  await drawer().waitFor({ state: "hidden", timeout: 15000 });

  await openFromTable();
  const reopened = await accInput().inputValue();
  check("C2 mở lại (không F5): số TK đã lưu", reopened === ACC_NO, reopened);
  check(
    "C3 mở lại (không F5): ngân hàng đã lưu",
    (await drawer().textContent())?.includes("BIDV"),
  );
} catch (e) {
  check("Ngoại lệ", false, e?.message);
  await page.screenshot({ path: `${ART}garage-cashflow-forecast-fail.png` });
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
