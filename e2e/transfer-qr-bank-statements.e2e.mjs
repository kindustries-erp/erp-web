import { statSync } from "node:fs";
import { chromium } from "playwright-core";
import { resolveWebUrl } from "./e2e-ports.mjs";

const WEB = resolveWebUrl();
const EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const PASSWORD = process.env.E2E_PASSWORD;
if (!PASSWORD) throw new Error("E2E_PASSWORD is required");

const browser = await chromium.launch({
  executablePath: process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
});

const externalRequests = [];
page.on("request", (req) => {
  const url = req.url();
  // Cho phép: trang web, data URL, và API nội bộ (cùng cổng API, đường dẫn /api/).
  if (
    url.startsWith("data:") ||
    url.startsWith(WEB) ||
    /:10003\/api\//.test(url)
  )
    return;
  externalRequests.push(url);
});

const step = (name) => console.log(`[step] ${name}`);

try {
  step("login");
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );

  step("open bank tab");
  await page.goto(`${WEB}/cashflow?tab=bank`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.locator("table").first().waitFor({ timeout: 30000 });

  step("open Thao tác menu and click QR item");
  await page.evaluate(() => {
    const imp = [...document.querySelectorAll("button")].find((b) =>
      /Nhập sao kê/.test(b.textContent || ""),
    );
    const chev = [...imp.parentElement.querySelectorAll("button")].find(
      (b) => b !== imp,
    );
    chev.setAttribute("data-e2e-thao-tac", "1");
  });
  await page.locator("[data-e2e-thao-tac='1']").click();
  await page.getByText("Tạo mã QR chuyển khoản", { exact: true }).click();

  const dialog = page
    .getByRole("dialog")
    .filter({ hasText: "Tạo mã QR chuyển khoản" });
  await dialog.waitFor({ timeout: 15000 });

  step("pay mode: fill supplier bank transfer");
  await dialog
    .getByText("Trả tiền nhà cung cấp", { exact: true })
    .first()
    .click();
  await dialog.getByText("Chọn ngân hàng", { exact: true }).first().click();
  await page
    .getByRole("option", { name: /Vietcombank|VCB/ })
    .first()
    .click();
  await dialog.getByLabel("Số tài khoản").fill("0123456789");
  await dialog.getByLabel("Tên chủ tài khoản").fill("NGUYEN VAN A");
  await dialog.getByLabel("Số tiền (VND)").fill("1500000");
  await dialog
    .getByLabel("Nội dung chuyển khoản")
    .fill("Thanh toan don hang 123");

  const preview = dialog.getByAltText("Xem trước mã QR");
  await preview.waitFor({ timeout: 15000 });
  const src = await preview.getAttribute("src");
  if (!src?.startsWith("data:image/png"))
    throw new Error("QR preview is not a generated PNG data URL");

  step("download PNG and check file name");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Tải ảnh QR (PNG)" }).click(),
  ]);
  const name = download.suggestedFilename();
  if (!/^QR_VCB_0123456789_1500000\.png$/.test(name))
    throw new Error(`Unexpected file name: ${name}`);

  step("receive mode: company account");
  await dialog.getByText("Nhận tiền từ khách", { exact: true }).first().click();
  await dialog.getByText("Chọn tài khoản", { exact: true }).first().click();
  const firstOption = page.getByRole("option").first();
  await firstOption.waitFor({ timeout: 10000 });
  await firstOption.click();
  await preview.waitFor({ timeout: 15000 });

  step("batch tab: paste 3 rows from Excel");
  await dialog.getByText("Nhiều lệnh thanh toán", { exact: true }).click();
  await dialog
    .getByRole("textbox", { name: "Dán từ Excel" })
    .fill(
      [
        "VCB\t0123456789\tNGUYEN VAN A\t1500000\tHD001/2025",
        "TCB\t19011234567\tTRAN THI B\t2000000\tDon hang (so 2)",
        "BIDV\t1234567890\tLE VAN C\t\tTT thang 11",
      ].join("\n"),
    );
  await dialog.getByRole("button", { name: "Thêm vào danh sách" }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll("[role=dialog] img[alt$='.png']").length === 3,
    null,
    { timeout: 15000 },
  );
  await dialog
    .getByText("Nội dung trên QR: HD001 2025", { exact: false })
    .first()
    .waitFor({ timeout: 5000 });

  step("download batch ZIP and PDF");
  const [zipDownload] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Tải ZIP tất cả" }).click(),
  ]);
  if (!/^QR_nhieu_lenh_\d{8}-\d{4}\.zip$/.test(zipDownload.suggestedFilename()))
    throw new Error(`Unexpected ZIP name: ${zipDownload.suggestedFilename()}`);
  if (statSync(await zipDownload.path()).size === 0)
    throw new Error("ZIP is empty");

  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Xuất PDF A4" }).click(),
  ]);
  if (!/^QR_nhieu_lenh_\d{8}-\d{4}\.pdf$/.test(pdfDownload.suggestedFilename()))
    throw new Error(`Unexpected PDF name: ${pdfDownload.suggestedFilename()}`);
  if (statSync(await pdfDownload.path()).size === 0)
    throw new Error("PDF is empty");

  step("external requests check");
  if (externalRequests.length > 0) {
    throw new Error(
      `External requests detected: ${externalRequests.slice(0, 5).join(", ")}`,
    );
  }

  console.log("[PASS] transfer-qr-bank-statements E2E");
} catch (error) {
  await page
    .screenshot({ path: "e2e/.artifacts/transfer-qr-failure.png" })
    .catch(() => {});
  console.error("[FAIL]", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
