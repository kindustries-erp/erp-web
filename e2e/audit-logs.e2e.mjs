// E2E Nhật ký hoạt động: V1 (/erp-activity-logs, API v1) và V2 (/v2/admin/audit-logs, API v2, drawer chỉ xem).
// Chỉ đọc. E2E_PASSWORD bắt buộc; E2E_TAO_EMAIL mặc định ai-test-tao@example.com. KHÔNG chạy trên DB production.
// Chạy: bun run e2e:audit-logs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveWebUrl } from "./e2e-ports.mjs";

const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const ADMIN = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD.");
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
let failed = 0;
const check = (step, pass, detail = "") => {
  if (!pass) failed++;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 160) : ""}`,
  );
};

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const calls = [];
page.on("response", (res) => {
  const u = res.url();
  if (u.includes("/audit-logs")) calls.push({ status: res.status(), url: u });
});
try {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", ADMIN);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );

  // ---- V1
  await page.goto(`${WEB}/erp-activity-logs`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("table tbody tr").first().waitFor({ timeout: 20000 });
  check(
    "A1 V1 bảng có dòng",
    (await page.locator("table tbody tr").count()) > 0,
  );
  check(
    "A2 V1 gọi /api/v1/audit-logs-core 200, không gọi v2",
    calls.some(
      (c) => c.url.includes("/api/v1/audit-logs-core") && c.status === 200,
    ) && !calls.some((c) => c.url.includes("/api/v2/audit-logs")),
    JSON.stringify(calls.map((c) => c.status)),
  );
  await page.screenshot({ path: `${SHOTS}audit-logs-table.png` });

  // ---- V2
  calls.length = 0;
  await page.goto(`${WEB}/v2/admin/audit-logs`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("table tbody tr").first().waitFor({ timeout: 30000 });
  check(
    "B1 V2 bảng có dòng",
    (await page.locator("table tbody tr").count()) > 0,
  );
  check(
    "B2 V2 gọi /api/v2/audit-logs 200, không gọi v1",
    calls.some(
      (c) => c.url.includes("/api/v2/audit-logs") && c.status === 200,
    ) && !calls.some((c) => c.url.includes("/api/v1/audit-logs-core")),
    JSON.stringify(calls.map((c) => c.status)),
  );
  await page.screenshot({ path: `${SHOTS}audit-logs-v2-table.png` });

  const colOpts = calls.length;
  await page.getByRole("button", { name: "Lọc cột Module" }).click();
  await page.waitForTimeout(2000);
  const optCalls = calls
    .slice(colOpts)
    .filter((c) => c.url.includes("/column-options"));
  check(
    "B3 mở lọc cột Module gọi column-options 200",
    optCalls.length > 0 && optCalls.every((c) => c.status === 200),
    JSON.stringify(optCalls.map((c) => c.status)),
  );
  await page.keyboard.press("Escape");

  const detail = page
    .locator("table tbody tr")
    .first()
    .locator("button, a")
    .first();
  await detail.click();
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  check(
    "B4 drawer chi tiết có nhãn Thông tin và Người thực hiện",
    (await dialog.getByText("Thông tin", { exact: true }).count()) > 0 &&
      (await dialog.getByText("Người thực hiện").count()) > 0,
  );
  check(
    "B5 drawer view mode không có ô nhập",
    (await dialog
      .locator("input, textarea, select, [role=combobox], [role=textbox]")
      .count()) === 0,
  );
  check(
    "B6 drawer không có nút Chỉnh sửa",
    (await dialog.getByText("Chỉnh sửa").count()) === 0,
  );
  await page.screenshot({ path: `${SHOTS}audit-logs-v2-drawer.png` });
  check(
    "B7 không lỗi trang",
    !(await page.getByText(/Cannot read|Something went wrong/i).count()),
  );
} catch (e) {
  check("E2E audit-logs", false, e.message.split("\n")[0]);
  await page
    .screenshot({ path: `${SHOTS}audit-logs-fail.png` })
    .catch(() => {});
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
