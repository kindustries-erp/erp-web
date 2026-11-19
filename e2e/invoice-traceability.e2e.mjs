// E2E chỉ đọc: sơ đồ "Chứng từ liên kết" trong drawer hóa đơn (ErpInvoiceLinkedDocsSection + core invoices).
// Duyệt các dòng đầu của /erp-invoices-out, bắt phản hồi traceability-graph và so số node/cạnh với canvas.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_TAO_EMAIL, E2E_INVOICE_ROWS (mặc định 45).
// Chạy: bun run e2e:invoice-traceability
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveWebUrl } from "./e2e-ports.mjs";

const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
const ROWS = Number(process.env.E2E_INVOICE_ROWS ?? 45);
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD.");
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 160) : ""}`);
};

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();
page.setDefaultTimeout(25000);
await page.goto(WEB, { waitUntil: "domcontentloaded" });
await page.fill("input[type=email]", EMAIL);
await page.fill("input[type=password]", PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => !document.querySelector("input[type=password]"), null, { timeout: 30000 });

let checked = 0;
let editChecked = false;
try {
  await page.goto(`${WEB}/erp-invoices-out`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => (document.querySelector("table tbody tr td:nth-child(4)")?.textContent ?? "").trim().length > 0,
    null,
    { timeout: 40000 },
  );
  for (let i = 0; i < ROWS && checked < 2; i++) {
    const graphWait = page.waitForResponse((r) => r.url().includes("/traceability-graph") && r.status() === 200, { timeout: 12000 }).catch(() => null);
    await page.locator("table tbody tr").nth(i).locator("td").nth(3).locator("a,button,span").first().click();
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.waitFor({ timeout: 10000 });
    const tab = dialog.getByText("Chứng từ liên kết", { exact: false }).first();
    await tab.waitFor({ timeout: 4000 }).catch(() => {});
    if (process.env.E2E_DEBUG) console.log("row", i, "tabVisible", await tab.isVisible().catch(() => false));
    if (!(await tab.isVisible().catch(() => false))) {
      await page.keyboard.press("Escape");
      continue;
    }
    await tab.click();
    const resp = await graphWait;
    const g = resp ? await resp.json().catch(() => null) : null;
    await page.waitForTimeout(1500);
    if (process.env.E2E_DEBUG) console.log("row", i, "graph", g ? `${g.nodes?.length}n/${g.edges?.length}e` : "none");
    if (!g || (g.edges?.length ?? 0) < 1) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      continue;
    }
    const tag = `[hóa đơn dòng ${i + 1}]`;
    const nodes = await page.locator(".react-flow__node").count();
    const edges = await page.locator(".react-flow__edge").count();
    check(`${tag} canvas: số node = backend`, nodes === g.nodes.length, `${nodes}/${g.nodes.length}`);
    check(`${tag} canvas: số cạnh = backend`, edges === g.edges.length, `${edges}/${g.edges.length}`);
    await page.screenshot({ path: `${SHOTS}invoice-trace-${i + 1}.png` }).catch(() => {});
    checked++;
    if (!editChecked) {
      const editBtn = page.getByText("Chỉnh sửa", { exact: true }).first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(800);
        const unlink = page.locator('[title="Gỡ liên kết chứng từ này"]');
        const n = await unlink.count();
        check(`${tag} sửa: có nút gỡ liên kết`, n > 0, `${n} nút`);
        if (n > 0) {
          await unlink.first().click();
          const confirm = page.getByRole("button", { name: "Gỡ liên kết", exact: true });
          const visibleAbove = await confirm
            .click({ timeout: 6000 })
            .then(() => true)
            .catch(() => false);
          check(`${tag} sửa: hộp xác nhận gỡ liên kết bấm được (không bị drawer che)`, visibleAbove);
        }
        editChecked = true;
      }
    }
    // Hủy mọi thay đổi trên màn hình: không lưu, không ghi DB
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Hủy", exact: true }).first().click({ timeout: 3000 }).catch(() => {});
    await page.getByRole("button", { name: /^(Đóng|Đóng không lưu)$/ }).last().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
  }
  check("I1 tìm được hóa đơn có chứng từ liên kết", checked > 0, `${checked} hóa đơn`);
} catch (e) {
  check("(exception)", false, e.message);
  await page.screenshot({ path: `${SHOTS}invoice-trace-fail.png` }).catch(() => {});
}
await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(`\nTổng: ${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
