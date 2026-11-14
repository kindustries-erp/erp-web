// E2E Loans: tab Dòng Tiền (projection) tự cập nhật sau khi tạo khoản vay và ghi nhận thanh toán, không reload trang.
// Biến môi trường như garage-procurement.e2e.mjs (xem erp-e2e-playwright/SKILL.md): E2E_PASSWORD bắt buộc.
// Chạy: bun run e2e:loans-projection
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

// Nếu shell chưa có E2E_PASSWORD, đọc từ erp/erp-api/.env (quy định erp-e2e-playwright; không in ra log).
const API_ENV = new URL("../../erp-api/.env", import.meta.url).pathname;
const readApiEnv = (key) => {
  if (!existsSync(API_ENV)) return undefined;
  const m = readFileSync(API_ENV, "utf8").match(
    new RegExp(`^${key}=(.*)$`, "m"),
  );
  return m?.[1].trim().replace(/^["']|["']$/g, "");
};

// Mặc định theo repo này: API lấy PORT trong erp/erp-api/.env, web 5174 (vite của repos-dev-02).
const API =
  process.env.E2E_API_URL ?? `http://localhost:${readApiEnv("PORT") ?? 10002}`;
const WEB = process.env.E2E_WEB_URL ?? "http://127.0.0.1:5174";
const PASSWORD = process.env.E2E_PASSWORD ?? readApiEnv("E2E_PASSWORD");
const LOAN_EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error(
    "Thiếu E2E_PASSWORD. Đặt mật khẩu tài khoản test rồi chạy lại.",
  );
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const TAG = `E2E-LOAN-${Date.now()}`;
const TODAY = new Date().toISOString().slice(0, 10);
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 160) : ""}`,
  );
};

async function apiLogin(email) {
  const r = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const b = await r.json().catch(() => ({}));
  return { token: b.accessToken, status: r.status };
}
async function api(s, method, path, body) {
  const r = await fetch(`${API}/api/v2${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${s.token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await r.json();
  } catch {
    /* no body */
  }
  return { status: r.status, data };
}
async function login(page, email) {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );
}
const TAB_PROJECTION = "Dự Báo Dòng Tiền Tương Lai";
const TAB_LIST = "Danh Sách Hợp Đồng";
const BTN_ADD_LOAN = "Thêm khoản vay mới";
const BTN_SAVE = "Lưu";
const LBL_TITLE = "Tên khoản vay";
const LBL_LENDER = "Ngân hàng / Đơn vị cho vay";
const LBL_PRINCIPAL = "Số tiền vay (VNĐ)";
const LBL_RATE = "Lãi suất (% / năm)";
const LBL_TENOR = "Thời hạn (tháng)";
const tab = (page, name) => page.getByRole("tab", { name, exact: true });
const shot = (page, name) =>
  page.screenshot({ path: `${SHOTS}${name}.png` }).catch(() => {});
const poll = async (fn, ok, tries = 20) => {
  let v = null;
  for (let i = 0; i < tries; i++) {
    v = await fn();
    if (ok(v)) return v;
    await new Promise((r) => setTimeout(r, 500));
  }
  return v;
};

const s = await apiLogin(LOAN_EMAIL);
check("L0 đăng nhập API", !!s.token, `status ${s.status}`);
if (!s.token) process.exit(1);

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
page.setDefaultTimeout(20000);
let loanId = null;

try {
  await login(page, LOAN_EMAIL);
  check("L0b đăng nhập UI", true);

  // Mở tab Dòng Tiền rồi đánh dấu trang: nếu đánh dấu còn sau các thao tác thì không có reload.
  await page.goto(`${WEB}/loans-tool?tab=projection`, {
    waitUntil: "domcontentloaded",
  });
  await tab(page, TAB_PROJECTION).waitFor();
  await page.evaluate(() => {
    window.__e2eNoReload = 1;
  });

  // 1. Tạo khoản vay qua UI ở tab Danh sách (đường đi thật: mutation invalidate ["loans"])
  await tab(page, TAB_LIST).click();
  await page.getByRole("button", { name: BTN_ADD_LOAN, exact: true }).click();
  // DrawerField không gắn htmlFor: lấy input nằm trong khối anh em sau thẻ label.
  // Gõ từng ký tự (ô tiền có định dạng hàng nghìn nên fill() bị nối chuỗi).
  const typeInto = async (label, value) => {
    const input = page
      .locator("label", { hasText: label })
      .first()
      .locator("xpath=../div//input")
      .first();
    await input.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Delete");
    await input.pressSequentially(value);
  };
  await typeInto(LBL_TITLE, TAG);
  await typeInto(LBL_LENDER, "E2E");
  await typeInto(LBL_PRINCIPAL, "120000000");
  await typeInto(LBL_RATE, "10");
  await typeInto(LBL_TENOR, "12");
  await page.getByRole("button", { name: BTN_SAVE, exact: true }).click();
  const drawerClosed = await page
    .getByRole("button", { name: BTN_SAVE, exact: true })
    .waitFor({ state: "detached", timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  check("L1 tạo khoản vay qua UI (drawer đóng sau Lưu)", drawerClosed);

  // Lấy loanId theo tên (loanName trong projection = title đã nhập)
  loanId = await poll(
    async () => {
      const p = await api(
        s,
        "GET",
        "/loans-tool/cashflow/projection?includeAllPeriods=true",
      );
      for (const m of p.data?.monthlyProjections ?? []) {
        const hit = (m.breakdown ?? []).find((b) => b.loanName === TAG);
        if (hit) return hit.loanId;
      }
      return null;
    },
    (v) => !!v,
  );
  const loanName = TAG;
  check("L1b projection API có khoản mới", !!loanId, `loanId ${loanId}`);

  // 2. Chuyển tab list → projection (không reload): khoản mới phải hiện và được bật
  await tab(page, TAB_LIST).click();
  await tab(page, TAB_PROJECTION).click();
  const cb = page.getByRole("checkbox", { name: loanName ?? TAG, exact: true });
  const visible = await cb
    .waitFor({ timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  check("L2 khoản mới hiện trong bộ lọc projection sau chuyển tab", visible);
  // Chụp trạng thái không-reload trước khi chẩn đoán (chẩn đoán có thể reload trang)
  const noReloadAtL2 = await page.evaluate(() => window.__e2eNoReload === 1);
  let reloadedInDiag = false;
  if (!visible) {
    // Chẩn đoán: UI đang hiện những checkbox nào, và sau reload trang có khoản mới không
    const before = await page.evaluate(() =>
      [...document.querySelectorAll('[role="checkbox"]')].map((el) =>
        el.getAttribute("aria-label"),
      ),
    );
    console.log(`DIAG checkbox trước reload: ${JSON.stringify(before)}`);
    await shot(page, "loans-projection-diag-before-reload");
    await page.reload({ waitUntil: "domcontentloaded" });
    reloadedInDiag = true;
    await tab(page, TAB_PROJECTION).waitFor();
    const afterReload = await page
      .getByRole("checkbox", { name: loanName ?? TAG, exact: true })
      .waitFor({ timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    console.log(`DIAG khoản mới hiện sau reload trang: ${afterReload}`);
  }
  if (visible) check("L2b khoản mới được bật mặc định", await cb.isChecked());
  check("L2c không reload trang", noReloadAtL2);
  await shot(page, "loans-projection-after-create");

  // 3. Ghi nhận thanh toán kỳ 1 (API)
  const pay = await api(s, "POST", `/loans-tool/${loanId}/payments`, {
    periodNumber: 1,
    paymentDate: TODAY,
    principalPaid: 10000000,
    interestPaid: 1000000,
    paymentRef: TAG,
  });
  check(
    "L3 ghi nhận thanh toán",
    pay.status === 201 || pay.status === 200,
    `status ${pay.status}`,
  );

  // 4. Dữ liệu projection (API) phải có số đã trả 11.000.000 cho khoản này
  const actual = await poll(
    async () => {
      const p = await api(
        s,
        "GET",
        "/loans-tool/cashflow/projection?includeAllPeriods=true",
      );
      let total = 0;
      for (const m of p.data?.monthlyProjections ?? []) {
        for (const b of m.breakdown ?? []) {
          if (b.loanId === loanId) total += b.actualTotalPaid ?? 0;
        }
      }
      return total;
    },
    (v) => v === 11000000,
  );
  check(
    "L4 projection API có số đã trả của khoản = 11.000.000",
    actual === 11000000,
    `actual ${actual}`,
  );

  // 5. Chuyển tab để projection tải lại: khoản vẫn có trong bộ lọc và vẫn được bật
  // (số đã trả theo khoản nằm trong canvas Chart.js nên không assert bằng DOM; đã kiểm ở L4 qua API)
  await tab(page, TAB_LIST).click();
  await tab(page, TAB_PROJECTION).click();
  const cbAfter = page.getByRole("checkbox", {
    name: loanName ?? TAG,
    exact: true,
  });
  const uiPaid = await cbAfter
    .waitFor({ timeout: 15000 })
    .then(() => cbAfter.isChecked())
    .catch(() => false);
  check("L5 UI sau thanh toán: khoản vẫn hiện và được bật", uiPaid);
  if (reloadedInDiag) {
    console.log(
      "SKIP  L5b không reload trang — đã reload trong bước chẩn đoán L2",
    );
  } else {
    check(
      "L5b không reload trang",
      await page.evaluate(() => window.__e2eNoReload === 1),
    );
  }
  await shot(page, "loans-projection-after-payment");
} catch (e) {
  check("exception", false, e.message);
  await shot(page, "loans-projection-exception");
} finally {
  // Dọn: xóa mềm khoản vay test (không xóa cứng dữ liệu)
  if (loanId) {
    const del = await api(s, "DELETE", `/loans-tool/${loanId}`);
    check(
      "CLEANUP xóa mềm khoản vay test",
      del.status === 200 || del.status === 204,
      `status ${del.status}`,
    );
  }
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(
  `\nKết quả: ${results.length - failed.length}/${results.length} PASS`,
);
process.exit(failed.length ? 1 : 0);
