// E2E màn V1 hóa đơn (/erp-invoices-in) sau cutover: tab "Tài liệu & PDF" đọc/ghi qua API V2.
// Dùng tài khoản ai-test-tao (E2E_TAO_EMAIL, E2E_PASSWORD). Chỉ staging/dev, KHÔNG production.
// Dọn dữ liệu: file test tự xóa cứng qua API (PURGE). Chạy: bun run e2e:invoice-attachments-v1
import {
  API,
  PDF,
  uploadViaApi,
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
const TOKEN = await apiLogin();
const call = apiCall(TOKEN);
const NAME = `e2e-v1-${Date.now()}.pdf`;
const { browser, page } = await openBrowser();
const net = [];
page.on("response", (res) => {
  const u = res.url();
  if (
    u.includes("/attachments") ||
    u.includes("/api/v1/erp-attachments") ||
    /erp-invoices\/[^/]+\/(pdfs|attachments)/.test(u)
  )
    net.push({ m: res.request().method(), s: res.status(), u });
});
const v2 = (m) =>
  net.filter((c) => c.m === m && c.u.includes("/api/v2/invoices/"));
let invoiceId = null;
let fileId = null;
try {
  await page.goto(`${WEB}/erp-invoices-in`, { waitUntil: "domcontentloaded" });
  await page.locator("table tbody tr").first().waitFor({ timeout: 30000 });
  await page
    .locator("table tbody tr")
    .first()
    .locator("td")
    .nth(3)
    .locator("a,button,span")
    .first()
    .click();
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.waitFor({ timeout: 10000 });
  await dialog.getByText("Tài liệu & PDF").first().click();
  await dialog.getByText("Danh sách tệp").waitFor({ timeout: 10000 });

  const list = v2("GET").find((c) => /attachments$/.test(c.u));
  invoiceId = list?.u.match(/invoices\/([0-9a-f-]+)\/attachments/)?.[1] ?? null;
  check(
    "B1 danh sách tệp V1 gọi GET /api/v2/invoices/:id/attachments 200",
    Boolean(invoiceId) && list.s === 200,
    list?.u,
  );

  const input = dialog.locator("input[type=file][multiple]").first();
  await input.setInputFiles({
    name: NAME,
    mimeType: "application/pdf",
    buffer: PDF,
  });
  await page
    .waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().includes("/api/v2/invoices/"),
      { timeout: 20000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1500);
  // Sau refresh detail màn quay về tab Chi tiết: mở lại tab Tài liệu & PDF
  if ((await dialog.getByText(NAME).count()) === 0) {
    await dialog.getByText("Tài liệu & PDF").first().click();
  }
  await dialog.getByText(NAME).first().waitFor({ timeout: 20000 });
  const up = v2("POST")[0];
  check(
    "B2 tải lên qua POST V2 trả 2xx",
    up && up.s >= 200 && up.s < 300,
    up && `${up.s} ${up.u}`,
  );
  check(
    "B3 không còn gọi route V1 ghi file",
    !net.some((c) => c.m !== "GET" && !c.u.includes("/api/v2/")),
    JSON.stringify(
      net.filter((c) => c.m !== "GET" && !c.u.includes("/api/v2/")),
    ),
  );

  const mine = (
    await call("GET", `/api/v2/invoices/${invoiceId}/attachments`)
  ).body.items.find((i) => i.fileName === NAME);
  fileId = mine?.id ?? null;
  check("B4 file hiện ở API V2 (nguồn duy nhất)", Boolean(fileId));
  await page.screenshot({ path: SHOTS + "v1-after-upload.png" });

  await dialog.getByText(NAME).first().click();
  await page.waitForTimeout(1200);
  const dl = net.find((c) => c.m === "GET" && /download-url/.test(c.u));
  check("B5 xem trước lấy URL qua V2 download-url", dl && dl.s === 200, dl?.u);

  const card = dialog.locator("div.group", { hasText: NAME }).first();
  await card.hover();
  await card.locator("button").last().click();
  const confirm = page
    .locator('[role="alertdialog"], [role="dialog"]')
    .last()
    .getByRole("button", { name: /Xóa|Xác nhận|Đồng ý/ })
    .last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await page.waitForTimeout(2000);
  const del = v2("DELETE")[0];
  check(
    "B6 xóa qua DELETE V2 trả 2xx",
    del && del.s >= 200 && del.s < 300,
    del && `${del.s} ${del.u}`,
  );
  check(
    "B7 file biến mất khỏi danh sách",
    (await dialog.getByText(NAME).count()) === 0,
  );
  await page.screenshot({ path: SHOTS + "v1-after-delete.png" });

  // B8 zip V2 (API): upload một file riêng của e2e rồi tải zip, phải ra application/zip có nội dung
  await uploadViaApi(call, invoiceId, `zip-${NAME}`);
  const zipRes = await fetch(
    `${API}/api/v2/invoices/${invoiceId}/attachments/zip`,
    { headers: { Authorization: `Bearer ${TOKEN}` } },
  );
  check(
    "B8 route zip V2 trả application/zip có nội dung",
    zipRes.status === 200 &&
      (zipRes.headers.get("content-type") ?? "").includes("zip") &&
      (await zipRes.arrayBuffer()).byteLength > 0,
    String(zipRes.status),
  );

  // B9 lọc cột PDF gốc: V1 và V2 phải cho cùng tổng, và nhỏ hơn tổng không lọc
  const filter = JSON.stringify({
    pdfSource: ["manual_upload", "provider_original"],
  });
  const q = `column_filters=${encodeURIComponent(filter)}`;
  const v1All = (await call("GET", `/api/v1/erp-invoices?page=1&pageSize=1`))
    .body;
  const v1F = (await call("GET", `/api/v1/erp-invoices?page=1&pageSize=1&${q}`))
    .body;
  const v2F = (await call("GET", `/api/v2/invoices?page=1&pageSize=1&${q}`))
    .body;
  const tot = (b) => b?.pagination?.total ?? b?.total ?? b?.meta?.total;
  check(
    "B9 lọc pdfSource có hiệu lực ở V1 và V2",
    tot(v1F) < tot(v1All) && tot(v1F) > 0 && tot(v2F) > 0,
    `v1All=${tot(v1All)} v1F=${tot(v1F)} v2F=${tot(v2F)}`,
  );
} catch (e) {
  state.failed++;
  console.log("FAIL  lỗi kịch bản —", e.message);
  console.log(JSON.stringify(net.slice(-8)));
  await page.screenshot({ path: SHOTS + "v1-error.png" }).catch(() => {});
} finally {
  if (invoiceId) {
    const all =
      (
        await call(
          "GET",
          `/api/v2/file-attachments-management?deleted=only&limit=100`,
        )
      ).body?.items ?? [];
    for (const f of all.filter((x) => x.fileName.endsWith(NAME))) {
      const r = await call(
        "DELETE",
        `/api/v2/file-attachments-management/${f.id}/permanent`,
      );
      console.log(`dọn ${f.id}: ${r.status}`);
    }
    const live =
      (
        await call("GET", `/api/v2/invoices/${invoiceId}/attachments`)
      ).body?.items?.filter((i) => i.fileName.endsWith(NAME)) ?? [];
    for (const f of live) {
      await call("DELETE", `/api/v2/file-attachments-management/${f.id}`);
      await call(
        "DELETE",
        `/api/v2/file-attachments-management/${f.id}/permanent`,
      );
    }
  }
  await browser.close();
}
console.log(state.failed ? `\n${state.failed} FAIL` : "\nTất cả PASS");
process.exit(state.failed ? 1 : 0);
