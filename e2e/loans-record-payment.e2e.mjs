// E2E modal "Ghi nhận thanh toán" mở từ danh sách khoản vay:
// kỳ đã trả bị khóa trong dropdown, gợi ý đúng kỳ chưa trả, và đo màu viền card so với input.
// Biến môi trường như loans-projection.e2e.mjs: E2E_PASSWORD (đọc từ erp-api/.env nếu thiếu).
// Chạy: node e2e/loans-record-payment.e2e.mjs
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const API_ENV = new URL("../../erp-api/.env", import.meta.url).pathname;
const readApiEnv = (key) => {
  if (!existsSync(API_ENV)) return undefined;
  const m = readFileSync(API_ENV, "utf8").match(
    new RegExp(`^${key}=(.*)$`, "m"),
  );
  return m?.[1].trim().replace(/^["']|["']$/g, "");
};

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
const TAG = `E2E-MODAL-${Date.now()}`;
const TODAY = new Date().toISOString().slice(0, 10);
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 200) : ""}`,
  );
};
const shot = (page, name) =>
  page.screenshot({ path: `${SHOTS}${name}.png` }).catch(() => {});

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

const TAB_LIST = "Danh Sách Hợp Đồng";
const TITLE_MODAL = /Ghi Nhận Thanh Toán Khoản Vay/i;
const BTN_RECORD = "Ghi nhận thanh toán";
const BTN_MORE = "Thao tác khác";

const s = await apiLogin(LOAN_EMAIL);
check("L0 đăng nhập API", !!s.token, `status ${s.status}`);
if (!s.token) process.exit(1);

// Dữ liệu test: khoản vay 12 kỳ, đã trả kỳ 1 (tạo qua API để giữ bước này ngắn)
const created = await api(s, "POST", "/loans-tool", {
  title: TAG,
  lenderName: "E2E",
  principalAmount: 120000000,
  annualInterestRate: 10,
  tenorMonths: 12,
  amortizationMethod: "AMORTIZED",
  startDate: TODAY,
  status: "ACTIVE",
});
const loanId = created.data?.id ?? null;
check(
  "S1 tạo khoản vay test",
  created.status === 201 && !!loanId,
  `status ${created.status}`,
);
const pay = await api(s, "POST", `/loans-tool/${loanId}/payments`, {
  periodNumber: 1,
  paymentDate: TODAY,
  principalPaid: 10000000,
  interestPaid: 1000000,
  paymentRef: TAG,
});
check(
  "S2 ghi nhận kỳ 1 (API)",
  pay.status === 201 || pay.status === 200,
  `status ${pay.status}`,
);

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
page.setDefaultTimeout(20000);

try {
  await login(page, LOAN_EMAIL);
  await page.goto(`${WEB}/loans-tool?tab=list`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("tab", { name: TAB_LIST, exact: true }).waitFor();

  // Mở modal từ hàng của khoản vay test (hover hiện nút thao tác)
  const row = page.locator("tr", { hasText: TAG }).first();
  await row.waitFor({ timeout: 20000 });
  await row.hover();
  await row.getByRole("button", { name: BTN_MORE, exact: true }).click();
  await page.getByRole("menuitem", { name: BTN_RECORD, exact: true }).click();
  const dialog = page.getByRole("dialog").filter({ hasText: TITLE_MODAL });
  const opened = await dialog
    .waitFor()
    .then(() => true)
    .catch(() => false);
  check("M1 mở modal từ danh sách", opened);
  if (!opened) throw new Error("modal không mở");

  // Dropdown kỳ: kỳ 1 đã trả phải bị khóa, kỳ 2 chọn được
  await dialog.getByRole("combobox").first().click();
  const opt1 = page.getByRole("option", { name: /Kỳ 1/ }).first();
  const opt2 = page.getByRole("option", { name: /Kỳ 2/ }).first();
  await opt1.waitFor();
  const diagOf = () =>
    page
      .getByRole("option")
      .evaluateAll((els) =>
        els
          .slice(0, 2)
          .map((e) => [e.textContent?.trim(), e.getAttribute("aria-disabled")]),
      );
  // Dữ liệu thanh toán tải sau khi mở: nhãn "Đã trả" phải hiện trước khi kiểm tra khóa
  const paidShown = await page
    .getByRole("option", { name: /Đã trả/ })
    .first()
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  check(
    "M1b nhãn [Đã trả] hiện sau khi tải chi tiết",
    paidShown,
    JSON.stringify(await diagOf()),
  );
  const opt1Disabled = await opt1.evaluate(
    (el) =>
      el.getAttribute("aria-disabled") === "true" ||
      el.hasAttribute("disabled") ||
      el.getAttribute("data-disabled") !== null,
  );
  check("M2 kỳ 1 đã trả bị khóa trong dropdown", opt1Disabled);
  check("M3 kỳ 2 chưa trả vẫn chọn được", await opt2.isEnabled());

  // Tooltip gốc/lãi khi di chuột vào kỳ đã trả (desktop)
  await opt1.hover();
  const tip = await page
    .getByRole("tooltip")
    .filter({ hasText: /gốc|Gốc|lãi|Lãi/ })
    .first()
    .waitFor({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check("M4 tooltip kỳ đã trả hiện số gốc/lãi", tip);
  await shot(page, "loans-record-payment-dropdown");

  // Chọn kỳ 2 rồi kiểm tra card gợi ý
  await opt2.click();
  const suggestedText = await dialog
    .getByText(/Dự kiến kỳ này \(Kỳ \d+\)/)
    .first()
    .textContent();
  check(
    "M5 gợi ý kỳ chưa trả (Kỳ 2)",
    /Kỳ 2\)/.test(suggestedText ?? ""),
    suggestedText,
  );

  // Đo màu viền card tóm tắt so với input (AC-10)
  const border = await dialog.evaluate((root) => {
    const colorOf = (el) => getComputedStyle(el).borderTopColor;
    const findCard = () => {
      const label = [...root.querySelectorAll("*")].find(
        (el) =>
          el.childElementCount === 0 &&
          /Dư nợ còn lại/.test(el.textContent ?? ""),
      );
      let node = label;
      while (node && node !== root) {
        if (node.className && /border/.test(String(node.className)))
          return node;
        node = node.parentElement;
      }
      return null;
    };
    const card = findCard();
    const input = root.querySelector("input");
    return {
      card: card ? colorOf(card) : null,
      input: input ? colorOf(input) : null,
    };
  });
  console.log(`MEASURE viền card=${border.card} | viền input=${border.input}`);
  check(
    "M6 viền card khớp viền input",
    !!border.card && border.card === border.input,
    `card ${border.card} / input ${border.input}`,
  );
  await shot(page, "loans-record-payment-card");
} catch (e) {
  check("exception", false, e.message);
  await shot(page, "loans-record-payment-exception");
} finally {
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
