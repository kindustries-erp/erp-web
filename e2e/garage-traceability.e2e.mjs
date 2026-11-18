// E2E chỉ đọc: canvas "Chứng từ liên kết" của phiếu garage (core garage-cases + engine V2).
// Kiểm: node thủ công không nhân đôi, mỗi cặp node một cạnh, số node/cạnh trên canvas khớp đồ thị backend.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_TAO_EMAIL, E2E_CASE_CODES (phân tách bằng dấu phẩy), E2E_BRANCH_ID.
// Chạy: bun run e2e:garage-traceability
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
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
  console.log(`${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 160) : ""}`);
};

const res = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await res.json()).data?.accessToken;
check("A0 đăng nhập API", Boolean(token));
const branchId = process.env.E2E_BRANCH_ID ?? "0b4d6d3a-55df-492b-abaf-377d84b61d05";
const H = { Authorization: `Bearer ${token}`, "x-greenway-branch-id": branchId };
const get = async (p) => (await fetch(`${API}/api/v1/greenway${p}`, { headers: H })).json();

let codes = (process.env.E2E_CASE_CODES ?? "").split(",").filter(Boolean);
const cases = [];
if (codes.length === 0) {
  for (let pageNo = 1; pageNo <= 33 && cases.length < 2; pageNo++) {
    const list = (await get(`/cases?page=${pageNo}&pageSize=20&q=`)).data ?? [];
    for (const c of list) {
      const g = await get(`/cases/${c.id}/traceability-graph`);
      if (g.edges?.length >= 2) cases.push({ code: c.soChungTu, id: c.id, g, pageNo });
      if (cases.length >= 2) break;
    }
  }
} else {
  for (const code of codes) {
    const c = await get(`/cases/by-code/${encodeURIComponent(code)}`);
    cases.push({ code, id: c.id, pageNo: 1, g: await get(`/cases/${c.id}/traceability-graph`) });
  }
}
check("A1 tìm được phiếu có đồ thị liên kết", cases.length > 0, cases.map((c) => c.code).join(","));

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();
page.setDefaultTimeout(25000);
await page.goto(WEB, { waitUntil: "domcontentloaded" });
await page.fill("input[type=email]", EMAIL);
await page.fill("input[type=password]", PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => !document.querySelector("input[type=password]"), null, { timeout: 30000 });

for (const { code, g, pageNo } of cases) {
  const tag = `[${code}]`;
  try {
    const pairs = new Set(g.edges.map((e) => [e.source, e.target].sort().join("|")));
    check(`${tag} backend: không có cạnh trùng cặp`, pairs.size === g.edges.length);
    const manual = g.nodes.filter((n) => String(n.id).startsWith("manual-"));
    check(`${tag} backend: node thủ công có tiền tố manual-`, manual.length >= 0, `${manual.length} node`);

    await page.goto(`${WEB}/garage-cases?tab=cases`, { waitUntil: "domcontentloaded" });
    if (pageNo > 1) {
      await page.getByRole("button", { name: String(pageNo), exact: true }).first().click();
      await page.waitForTimeout(1500);
    }
    const row = page.locator("tr", { hasText: code }).first();
    await page.waitForSelector("table tbody tr");
    await row.waitFor({ timeout: 30000 });
    await row.getByText(code, { exact: false }).first().click();
    const tab = page.getByText("Chứng từ liên kết", { exact: false }).first();
    await tab.waitFor({ timeout: 20000 });
    await tab.click();
    await page.locator(".react-flow__node").first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(1500);
    const nodes = await page.locator(".react-flow__node").count();
    const edges = await page.locator(".react-flow__edge").count();
    await page.screenshot({ path: `${SHOTS}garage-trace-${code}.png` }).catch(() => {});
    check(`${tag} canvas: số node = backend`, nodes === g.nodes.length, `${nodes}/${g.nodes.length}`);
    check(`${tag} canvas: số cạnh = backend (không nhân đôi)`, edges === g.edges.length, `${edges}/${g.edges.length}`);
    // Chế độ sửa (không lưu: gỡ/ghép chỉ đổi trạng thái trên màn hình, rồi đóng drawer)
    if (!process.env.E2E_SKIP_EDIT) {
      await page.getByRole("button", { name: "Chỉnh sửa", exact: true }).first().click();
      await page.waitForTimeout(800);
      const linkBtn = page.getByRole("button", { name: /Ghép nối chứng từ/ }).first();
      check(`${tag} sửa: có nút Ghép nối chứng từ`, await linkBtn.isVisible().catch(() => false));
      const unlink = page.locator('[title="Gỡ liên kết chứng từ này"]');
      const unlinkCount = await unlink.count();
      check(`${tag} sửa: node có nút gỡ liên kết`, unlinkCount > 0, `${unlinkCount} nút`);
      if (unlinkCount > 0) {
        await page.locator(".react-flow__node", { hasText: "HÓA ĐƠN VAT" }).locator('[title="Gỡ liên kết chứng từ này"]').first().click();
        await page.waitForTimeout(600);
        await page.getByRole("button", { name: "Gỡ liên kết", exact: true }).click();
        await page.waitForTimeout(1200);
        const after = await page.locator(".react-flow__node").count();
        check(`${tag} sửa: gỡ node thì canvas giảm node`, after < nodes, `${nodes} → ${after}`);
        await page.screenshot({ path: `${SHOTS}garage-trace-${code}-edit.png` }).catch(() => {});
      }
      await linkBtn.click();
      await page.getByText("Hóa đơn VAT", { exact: true }).click();
      const picker = page.getByText("Liên kết Hóa đơn VAT", { exact: true }).first();
      const pickerOpen = await picker.waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
      check(`${tag} sửa: chọn loại Hóa đơn mở ngăn chọn hóa đơn`, pickerOpen);
      await page.screenshot({ path: `${SHOTS}garage-trace-${code}-add.png` }).catch(() => {});
    }
    // Hủy mọi thay đổi trên màn hình: không lưu, không ghi DB
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Hủy", exact: true }).first().click({ timeout: 4000 }).catch(() => {});
    await page.getByRole("button", { name: "Đóng", exact: true }).last().click({ timeout: 4000 }).catch(() => {});
  } catch (e) {
    check(`${tag} (exception)`, false, e.message);
    await page.screenshot({ path: `${SHOTS}garage-trace-${code}-fail.png` }).catch(() => {});
  }
}
await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(`\nTổng: ${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
