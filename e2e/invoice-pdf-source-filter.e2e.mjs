// E2E cột "PDF gốc" ở bảng hóa đơn V2 (/v2/invoices): cột hiện ra, chọn lọc gửi column_filters.pdfSource,
// tổng dòng khớp API. Chỉ staging/dev. Chạy: bun run e2e:invoice-pdf-source
import {
  SHOTS,
  WEB,
  makeChecker,
  openBrowser,
  requireEnv,
} from "./file-attachments-helpers.mjs";

requireEnv();
const { state, check } = makeChecker();
const { browser, page } = await openBrowser();
const calls = [];
page.on("request", (r) => {
  if (r.method() === "GET" && /\/api\/v2\/invoices\?/.test(r.url()))
    calls.push(r.url());
});
try {
  await page.goto(`${WEB}/v2/invoices`, { waitUntil: "domcontentloaded" });
  await page.getByText("Hóa đơn mua vào", { exact: true }).first().click();
  await page.locator("table tbody tr").first().waitFor({ timeout: 30000 });

  // Cột PDF gốc nằm ở chế độ xem "Kiểm toán / Đối soát"
  const viewBtns = page.locator("button", { hasText: "Tổng quan" });
  const boxes = await viewBtns.evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  const idx = boxes.findIndex((b) => b.x > 900 && b.y < 150);
  if (idx < 0) throw new Error("không thấy nút chọn chế độ xem");
  await viewBtns.nth(idx).click();
  await page.getByText("Kiểm toán / Đối soát", { exact: true }).first().click();
  await page.waitForTimeout(1000);

  const header = page.getByText("PDF gốc", { exact: true }).first();
  check("C1 bảng V2 có cột PDF gốc", (await header.count()) > 0);
  await page.screenshot({ path: SHOTS + "v2-pdf-column.png" });
  if ((await header.count()) === 0) throw new Error("không thấy cột PDF gốc");

  const before = calls.length;
  await page
    .getByRole("button", { name: /Bộ lọc/ })
    .first()
    .click();
  // Bộ lọc mở ở drawer "Bộ lọc": chọn dòng PDF gốc rồi tick "PDF nhà cung cấp"
  await page.getByText("PDF gốc", { exact: true }).last().click();
  await page.getByText("PDF nhà cung cấp", { exact: true }).first().click();
  await page
    .getByRole("button", { name: /^Áp dụng$/ })
    .first()
    .click();
  await page.waitForTimeout(500);
  await page
    .getByRole("button", { name: /^Đóng$/ })
    .last()
    .click()
    .catch(() => {});
  await page.waitForTimeout(2000);

  const filtered = calls
    .slice(before)
    .find((u) => decodeURIComponent(u).includes('"pdfSource"'));
  check(
    "C2 chọn lọc gửi column_filters.pdfSource=provider_original",
    Boolean(filtered) &&
      decodeURIComponent(filtered).includes("provider_original"),
    filtered && decodeURIComponent(filtered).slice(-120),
  );
  const rows = await page.locator("table tbody tr").count();
  const badges = await page
    .locator("table tbody tr", { hasText: "PDF nhà cung cấp" })
    .count();
  check(
    "C3 mọi dòng sau lọc đều là PDF nhà cung cấp",
    rows > 0 && badges === rows,
    `${badges}/${rows}`,
  );
  await page.screenshot({ path: SHOTS + "v2-pdf-filtered.png" });
} catch (e) {
  state.failed++;
  console.log("FAIL  lỗi kịch bản —", e.message);
  await page.screenshot({ path: SHOTS + "v2-pdf-error.png" }).catch(() => {});
} finally {
  await browser.close();
}
console.log(state.failed ? `\n${state.failed} FAIL` : "\nTất cả PASS");
process.exit(state.failed ? 1 : 0);
