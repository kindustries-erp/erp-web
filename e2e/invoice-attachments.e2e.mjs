// E2E tab "Tài liệu" ở drawer hóa đơn V2: tải lên, xem trước/tải, xóa mềm qua modal xác nhận.
// Dùng tài khoản ai-test-tao (E2E_TAO_EMAIL, E2E_PASSWORD). Chỉ staging/dev, KHÔNG production.
// Dọn dữ liệu: file test tự xóa cứng qua API (PURGE). Chạy: bun run e2e:invoice-attachments
import {
  PDF,
  SHOTS,
  WEB,
  apiCall,
  apiLogin,
  makeChecker,
  openBrowser,
  requireEnv,
} from "./file-attachments-helpers.mjs";

requireEnv();
const { state, check } = makeChecker();
const call = apiCall(await apiLogin());
const NAME = `e2e-att-${Date.now()}.pdf`;
const { browser, page } = await openBrowser();
const netCalls = [];
page.on("response", (res) => {
  if (res.url().includes("/attachments"))
    netCalls.push({ m: res.request().method(), s: res.status(), u: res.url() });
});
let invoiceId = null;
let fileId = null;
try {
  await page.goto(`${WEB}/v2/invoices`, { waitUntil: "domcontentloaded" });
  await page.getByText("Hóa đơn mua vào", { exact: true }).first().click();
  await page.locator("table tbody tr").first().waitFor({ timeout: 30000 });
  const firstRow = page.locator("table tbody tr").first();
  await firstRow.hover();
  await firstRow
    .locator("td")
    .nth(2)
    .locator("button, a, span")
    .first()
    .click();
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ timeout: 10000 });
  check(
    "A1 drawer có hai tab Thông tin và Tài liệu",
    (await dialog.getByText("Thông tin", { exact: true }).count()) > 0 &&
      (await dialog.getByText("Tài liệu", { exact: true }).count()) > 0,
  );

  await dialog.getByText("Tài liệu", { exact: true }).first().click();
  await dialog
    .locator("input[type=file]")
    .first()
    .waitFor({ state: "attached", timeout: 10000 });
  const list = netCalls.find(
    (c) => c.m === "GET" && /invoices\/[0-9a-f-]+\/attachments$/.test(c.u),
  );
  invoiceId = list?.u.match(/invoices\/([0-9a-f-]+)\/attachments/)?.[1] ?? null;
  check(
    "A2 tab gọi GET /api/v2/invoices/:id/attachments 200",
    Boolean(invoiceId) && list.s === 200,
    list?.u,
  );

  await dialog
    .locator("input[type=file]")
    .first()
    .setInputFiles({ name: NAME, mimeType: "application/pdf", buffer: PDF });
  await dialog.getByText(NAME).first().waitFor({ timeout: 20000 });
  check("B1 tải lên: file hiện trong danh sách", true);
  const up = netCalls.find(
    (c) => c.m === "POST" && c.u.endsWith("/attachments"),
  );
  check("B2 POST upload trả 201/200", up && up.s < 300, up?.s);
  const apiList = await call(
    "GET",
    `/api/v2/invoices/${invoiceId}/attachments`,
  );
  const row = apiList.body.items.find((i) => i.fileName === NAME);
  fileId = row?.id ?? null;
  check(
    "B3 API xác nhận file origin V2, không lộ file_key",
    row?.origin === "V2" && !("fileKey" in row),
    row?.origin,
  );
  check(
    "B4 extraData.policy có giới hạn từ server",
    apiList.body.extraData?.policy?.maxFileBytes > 0,
  );
  await page.screenshot({ path: `${SHOTS}invoice-attachments-uploaded.png` });

  await dialog.getByLabel("Xem trước").first().click();
  await page.waitForTimeout(1500);
  const dl = netCalls.find((c) => c.u.includes("/download-url"));
  check("C1 xem trước gọi download-url 200", dl && dl.s === 200, dl?.s);

  await dialog.getByLabel("Xóa").first().click();
  const modal = page.locator('[role="dialog"], [role="alertdialog"]').last();
  check(
    "D1 xóa phải qua modal xác nhận (chưa gọi DELETE)",
    !netCalls.some((c) => c.m === "DELETE"),
  );
  await modal.getByRole("button", { name: "Xóa", exact: true }).click();
  await page.waitForFunction(
    (n) => !document.body.innerText.includes(n),
    NAME,
    { timeout: 15000 },
  );
  check("D2 xác nhận xong file biến khỏi danh sách", true);
  const after = await call("GET", `/api/v2/invoices/${invoiceId}/attachments`);
  check(
    "D3 API: không còn trong danh sách owner",
    !after.body.items.some((i) => i.id === fileId),
  );
  const deleted = await call(
    "GET",
    "/api/v2/file-attachments-management?deleted=only&search=" +
      encodeURIComponent(NAME),
  );
  check(
    "D4 là xóa mềm: còn ở bộ lọc Đã xóa",
    deleted.body.items.some((i) => i.id === fileId),
  );
} catch (e) {
  check("E2E không lỗi bất ngờ", false, e.message);
  await page
    .screenshot({ path: `${SHOTS}invoice-attachments-fail.png` })
    .catch(() => {});
} finally {
  if (fileId)
    await call(
      "DELETE",
      `/api/v2/file-attachments-management/${fileId}/permanent`,
    );
  await browser.close();
}
console.log(state.failed ? `\n${state.failed} FAIL` : "\nTất cả PASS");
process.exit(state.failed ? 1 : 0);
