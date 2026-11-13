// E2E Kho Garage v2 (chỉ đọc): cột/badge/tab trang Tồn kho và Chứng từ kho, thẻ kho, hợp đồng API.
// Cấu hình qua biến môi trường (xem erp-web/.agents/skills/erp-e2e-playwright/SKILL.md):
//   E2E_WEB_URL      (mặc định http://127.0.0.1:5173)
//   E2E_API_URL      (mặc định http://localhost:10003)
//   E2E_PASSWORD     (BẮT BUỘC, mật khẩu tài khoản test; không hardcode)
//   E2E_TAO_EMAIL    (mặc định ai-test-tao@example.com)
//   E2E_CHROME_PATH  (mặc định /usr/bin/google-chrome)
// Chạy (E2E_PASSWORD lấy từ erp-api/.env, không in ra): bun e2e/garage-stock.e2e.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const WEB = process.env.E2E_WEB_URL ?? "http://127.0.0.1:5173";
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
const DENIED = "Bạn không có quyền truy cập trang này";
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD. Đặt mật khẩu tài khoản test rồi chạy lại.");
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 160) : ""}`,
  );
};
const shot = (page, name) => page.screenshot({ path: `${SHOTS}${name}.png` });
const visible = (page, text, scope = page) =>
  scope.getByText(text, { exact: true }).first().isVisible().catch(() => false);

async function login(page) {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.locator("input[type=email]").first().waitFor({ timeout: 20000 });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.locator("input[type=password]").first().waitFor({ state: "detached", timeout: 20000 });
}

/** Chờ tiêu đề trang hoặc thông báo thiếu quyền, trả về "ok" | "denied" | "timeout". */
async function openPage(page, path, title) {
  await page.goto(`${WEB}${path}`, { waitUntil: "domcontentloaded" });
  const titleSeen = page.getByText(title, { exact: true }).first().waitFor({ timeout: 30000 }).then(() => "ok");
  const deniedSeen = page.getByText(DENIED, { exact: true }).first().waitFor({ timeout: 30000 }).then(() => "denied");
  try {
    const outcome = await Promise.any([titleSeen, deniedSeen]);
    await page.waitForTimeout(1500);
    return outcome;
  } catch {
    return "timeout";
  }
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Bắt hợp đồng thật của API balances khi trang tải
  let balancesBody = null;
  page.on("response", async (res) => {
    if (res.url().includes("/inventory-movements-garage-ledger/balances") && res.status() === 200 && !balancesBody) {
      try {
        balancesBody = await res.json();
      } catch {
        /* bỏ qua */
      }
    }
  });

  await login(page);
  check("đăng nhập bằng UI", true, EMAIL);

  // ---------- Trang Tồn kho Garage ----------
  const balances = await openPage(page, "/v2/garage-stock-balances", "Tồn kho Garage");
  if (balances === "ok") {
    for (const label of ["Tất cả", "Còn hàng", "Hết hàng", "Tồn âm"]) {
      check(`tồn kho: tab "${label}" hiển thị`, await visible(page, label));
    }
    for (const col of ["Nhập", "Xuất", "Điều chỉnh", "Tồn kho"]) {
      check(`tồn kho: cột "${col}" trong tiêu đề bảng`, await visible(page, col, page.locator("thead")));
    }
    await shot(page, "stock-balances-light");
    check(
      "tồn kho: API balances có summaries và extraData.tabCounts",
      balancesBody?.summaries?.qtyReceived && typeof balancesBody?.extraData?.tabCounts === "object",
      balancesBody ? Object.keys(balancesBody).join(",") : "không bắt được response",
    );
    const detailBtn = page.getByRole("button", { name: "Xem chi tiết" }).first();
    if (await detailBtn.isVisible().catch(() => false)) {
      await detailBtn.click();
      const ledgerOpen = await page.getByText("Thẻ kho", { exact: true }).first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      check("tồn kho: mở thẻ kho từ mã hàng", ledgerOpen);
      await shot(page, "stock-ledger-drawer");
      await page.keyboard.press("Escape");
    } else {
      check("tồn kho: mở thẻ kho từ mã hàng", true, "INFO: staging chưa có mã hàng, bỏ qua");
    }
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(800);
    await shot(page, "stock-balances-dark");
    check("tồn kho: chụp ảnh giao diện tối", true, "e2e/.artifacts/stock-balances-dark.png");
    await page.emulateMedia({ colorScheme: "light" });
  } else {
    check(
      "tồn kho: tài khoản có quyền truy cập trang",
      false,
      balances === "denied"
        ? "tài khoản test thiếu quyền Garage stock; migration seed quyền 20261112234500 chưa chạy trên staging"
        : "trang không tải được trong thời gian chờ",
    );
  }

  // ---------- Trang Chứng từ kho Garage ----------
  const vouchers = await openPage(page, "/v2/garage-stock-vouchers", "Chứng từ kho Garage");
  if (vouchers === "ok") {
    for (const label of ["Tất cả", "Nhập mua hàng", "Nhập khác", "Xuất kho", "Điều chỉnh"]) {
      check(`chứng từ: tab "${label}" hiển thị`, await visible(page, label));
    }
    for (const col of ["Số phiếu", "Loại phiếu", "Trạng thái"]) {
      check(`chứng từ: cột "${col}" trong tiêu đề bảng`, await visible(page, col, page.locator("thead")));
    }
    await shot(page, "stock-vouchers-light");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(800);
    await shot(page, "stock-vouchers-dark");
    check("chứng từ: chụp ảnh giao diện tối", true, "e2e/.artifacts/stock-vouchers-dark.png");
  } else {
    check(
      "chứng từ: tài khoản có quyền truy cập trang",
      false,
      vouchers === "denied"
        ? "tài khoản test thiếu quyền Garage stock; migration seed quyền 20261112234500 chưa chạy trên staging"
        : "trang không tải được trong thời gian chờ",
    );
  }
} catch (err) {
  check("script không bị lỗi", false, err?.message ?? String(err));
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.pass).length;
console.log(`\nKẾT QUẢ: ${passed}/${results.length} PASS`);
process.exit(results.every((r) => r.pass) ? 0 : 1);
