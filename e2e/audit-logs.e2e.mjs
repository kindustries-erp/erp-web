// E2E Nhật ký hoạt động V1 (/erp-activity-logs): bảng đi qua API V1 /api/v1/audit-logs-core (không gọi v2).
// Chỉ đọc. E2E_PASSWORD bắt buộc; E2E_ADMIN_EMAIL mặc định admin@liouni.com. KHÔNG chạy trên DB production.
// Chạy: bun run e2e:audit-logs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveWebUrl } from "./e2e-ports.mjs";

const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.E2E_PASSWORD;
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? "admin@liouni.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD hoặc E2E_ADMIN_PASSWORD.");
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

  await page.goto(`${WEB}/erp-activity-logs`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("table tbody tr").first().waitFor({ timeout: 20000 });
  check(
    "A1 bảng nhật ký có dòng dữ liệu",
    (await page.locator("table tbody tr").count()) > 0,
  );
  check(
    "A2 trang V1 gọi /api/v1/audit-logs-core trả 200, không gọi v2",
    calls.some(
      (c) => c.url.includes("/api/v1/audit-logs-core") && c.status === 200,
    ) && !calls.some((c) => c.url.includes("/api/v2/audit-logs")),
    JSON.stringify(calls.map((c) => c.status)),
  );
  await page.screenshot({ path: `${SHOTS}audit-logs-table.png` });

  const first = page.locator("table tbody tr").first();
  const before = calls.length;
  await first.click();
  await page.waitForTimeout(1200);
  check(
    "A3 bấm dòng không lỗi trang",
    !(await page.getByText(/Cannot read|Something went wrong/i).count()),
  );
  await page.screenshot({ path: `${SHOTS}audit-logs-row.png` });
  console.log(`(request audit mới sau khi bấm dòng: ${calls.length - before})`);
} catch (e) {
  check("E2E audit-logs", false, e.message.split("\n")[0]);
  await page
    .screenshot({ path: `${SHOTS}audit-logs-fail.png` })
    .catch(() => {});
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
