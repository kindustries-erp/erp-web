// E2E dashboard garage: đối chiếu số trên màn hình V1 (`/garage-cases?tab=dashboard`) với API,
// kiểm guard V2 (`/garage-cases-v2`, chỉ admin). Không ghi dữ liệu.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_ADMIN_EMAIL (mặc định ai-test-admin).
// Chạy: bun run e2e:garage-dashboard
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "ai-test-admin@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD.");
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 220) : ""}`,
  );
};

const login = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await login.json()).data?.accessToken;
check("A0 đăng nhập API", Boolean(token));
const H = { Authorization: `Bearer ${token}` };
const v1Raw = await (
  await fetch(`${API}/api/v1/greenway/dashboard/checkpoint-kpis`, {
    headers: H,
  })
).json();
const v1 = v1Raw.data ?? v1Raw;
const expectedIntake = v1?.month?.stages?.totalIntake;
const expectedTienCoThue = v1?.month?.totalTienCoThue;

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await (
  await browser.newContext({ viewport: { width: 1600, height: 1000 } })
).newPage();
page.setDefaultTimeout(25000);
await page.goto(WEB, { waitUntil: "domcontentloaded" });
await page.fill("input[type=email]", EMAIL);
await page.fill("input[type=password]", PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(
  () => !document.querySelector("input[type=password]"),
  null,
  { timeout: 30000 },
);

// B. Trang V1 hiển thị KPI tháng.
await page.goto(`${WEB}/garage-cases?tab=dashboard`, {
  waitUntil: "domcontentloaded",
});
await page
  .waitForFunction(
    () => /XE THÁNG NÀY\s+\d+\s*xe/.test(document.body.innerText),
    null,
    { timeout: 40000 },
  )
  .catch(() => {});
const body = await page.innerText("body");
await page.screenshot({ path: SHOTS + "garage-dashboard-v1.png" });
const headline = /XE THÁNG NÀY\s+(\d+)\s*xe\s*\(([\d.,]+)tr\)/.exec(body);
check("B1 V1 hiển thị 'XE THÁNG NÀY'", Boolean(headline), headline?.[0]);
if (headline) {
  const uiXe = Number(headline[1]);
  check(
    "B2 số xe tháng trên màn hình V1 = stages.totalIntake của API",
    uiXe === expectedIntake,
    `UI ${uiXe}, API ${expectedIntake}`,
  );
  // Tiền "(475tr)" là làm tròn triệu của tiền có thuế (totalTienCoThue).
  const uiMillion = Number(headline[2].replace(/[.,]/g, ""));
  const apiMillion = Math.round(Number(expectedTienCoThue) / 1e6);
  check(
    "B3 tiền tháng trên màn hình V1 = totalTienCoThue (triệu)",
    uiMillion === apiMillion,
    `UI ${uiMillion}tr, API ${apiMillion}tr`,
  );
}

// B4. Drill-down theo XE: bấm thẻ phễu "2. Báo Giá" (locator cụ thể, lỗi thì dừng, không nuốt),
// drawer phải hiện số xe (= thẻ) thay vì số lệnh.
const expectedQuotation = v1?.month?.stages?.quotation;
const quotationCard = page.getByText("2. Báo Giá", { exact: true });
check(
  "B4a thẻ phễu '2. Báo Giá' xuất hiện đúng một lần",
  (await quotationCard.count()) === 1,
  `số thẻ: ${await quotationCard.count()}`,
);
await quotationCard.first().click({ timeout: 15000 });
const counts = page.getByTestId("cases-table-counts");
await counts.first().waitFor({ state: "visible", timeout: 20000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: SHOTS + "garage-dashboard-v1-drawer.png" });
const tableCounts = await counts.first().innerText();
const drawerCounts = /^(\d+)\s*xe\s*·\s*(\d+)\s*lệnh$/i.exec(
  tableCounts.trim(),
);
check(
  "B4 bảng Báo giá hiện 'N xe · M lệnh'",
  Boolean(drawerCounts),
  tableCounts,
);
// B5. Số xe của bảng = thẻ Báo giá của API.
check(
  "B5 bảng tab Báo giá đếm xe = stages.quotation của API",
  Number(drawerCounts?.[1]) === expectedQuotation,
  `UI ${tableCounts}, API ${expectedQuotation} xe`,
);
// B6. Không còn đếm theo phiếu.
const drawerText = await page.innerText("body");
check(
  "B6 không còn đếm 'N phiếu' trong drawer",
  !/\d+\s*phiếu/i.test(drawerText),
  tableCounts,
);
// B7. Cột dữ liệu đầu tiên là "Biển số xe" (trước "Số phiếu").
// Bảng của drawer: bảng có cột "Số phiếu"; bỏ cột STT ("#") và cột trống (mở rộng/chọn).
const headers = (
  await page
    .locator("table", { has: page.locator("th", { hasText: /Số phiếu/i }) })
    .first()
    .locator("th")
    .allInnerTexts()
)
  .map((h) => h.trim())
  .filter((h) => h && h !== "#");
const plateIdx = headers.findIndex((h) => /^Biển số xe/i.test(h));
const codeIdx = headers.findIndex((h) => /^Số phiếu/i.test(h));
check(
  "B7 cột 'Biển số xe' là cột dữ liệu đầu, đứng trước 'Số phiếu'",
  plateIdx === 0 && codeIdx > plateIdx,
  headers.slice(0, 5).join(" | "),
);

// C. Guard V2: người không phải admin không thấy trang V2 và không có mục menu "(v2)".
await page.goto(`${WEB}/garage-cases-v2?tab=dashboard`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(5000);
const v2Body = await page.innerText("body");
await page.screenshot({ path: SHOTS + "garage-dashboard-v2-guard.png" });
check(
  "C1 non-admin: /garage-cases-v2 hiện 404",
  /404/.test(v2Body) && !/XE THÁNG NÀY/.test(v2Body),
);
const menuV2 = await page
  .getByRole("link", { name: "Hoạt động garage (v2)", exact: true })
  .count();
check(
  "C2 non-admin: không có mục menu 'Hoạt động garage (v2)'",
  menuV2 === 0,
  `số mục: ${menuV2}`,
);

// D. Nội dung V2 cần tài khoản admin (không dùng admin trong E2E theo quy ước).
console.log(
  "INFO  D: nội dung trang V2 không kiểm được bằng tài khoản test (admin-only). Kiểm bằng unit test và smoke API.",
);

await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(`TOTAL ${results.length}, FAILED ${failed}`);
process.exit(failed ? 1 : 0);
