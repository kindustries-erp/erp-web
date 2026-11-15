// E2E Quản lý tài khoản V2 (/v2/users-management): bảng gọi API v2, tạo, sửa, ngưng/kích hoạt, đặt lại mật khẩu.
// Biến môi trường như garage-procurement.e2e.mjs (xem erp-e2e-playwright/SKILL.md): E2E_PASSWORD bắt buộc.
// E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD (mặc định E2E_PASSWORD): tài khoản có quyền admin_users:manage (email mặc định admin@liouni.com).
// Tạo dữ liệu có tiền tố email `e2e-users-`; không có API xóa nên dọn bằng SQL sau khi chạy. KHÔNG chạy trên DB production.
// Chạy: bun run e2e:users-management
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
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
const TAG = Date.now();
const EMAIL = `e2e-users-${TAG}@example.com`;
const NEW_PASSWORD = `E2e#${TAG}pw`;
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 140) : ""}`,
  );
};

async function apiLogin(email, password) {
  const r = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, token: b.accessToken };
}
async function apiGetUsers(token, search) {
  const r = await fetch(
    `${API}/api/v2/users-management?page=1&pageSize=5&search=${encodeURIComponent(search)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return (await r.json()).items ?? [];
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const v2Calls = [];
page.on("response", (res) => {
  const u = res.url();
  if (u.includes("/api/v2/users-management"))
    v2Calls.push({
      method: res.request().method(),
      status: res.status(),
      url: u,
    });
});
const shot = (name) => page.screenshot({ path: `${SHOTS}users-${name}.png` });

async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(name, false, e.message.split("\n")[0]);
    await shot(`fail-${name.replace(/\W+/g, "-")}`).catch(() => {});
  }
}

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

  await step("A. mở trang và bảng gọi API v2", async () => {
    await page.goto(`${WEB}/v2/users-management`, {
      waitUntil: "domcontentloaded",
    });
    await page.locator("table").first().waitFor({ timeout: 20000 });
    await page.locator("table tbody tr").first().waitFor({ timeout: 20000 });
    check(
      "A1 bảng có dòng dữ liệu",
      (await page.locator("table tbody tr").count()) > 0,
    );
    for (let i = 0; i < 20 && !v2Calls.length; i++)
      await page.waitForTimeout(250);
    check(
      "A2 web gọi GET /api/v2/users-management trả 200",
      v2Calls.some(
        (c) =>
          c.method === "GET" && c.status === 200 && !c.url.includes("/api/v1/"),
      ),
      JSON.stringify(v2Calls.map((c) => `${c.method} ${c.status}`)),
    );
  });

  await step("B. tạo tài khoản qua drawer", async () => {
    await page
      .getByRole("button", { name: "Thêm tài khoản", exact: true })
      .click();
    const dlg = page.locator('[role="dialog"]');
    await dlg.waitFor({ timeout: 10000 });
    await dlg.locator("input[type=email]").fill(EMAIL);
    await dlg.locator("input[type=password]").fill("ngan");
    await dlg.getByRole("button", { name: "Lưu", exact: true }).click();
    check(
      "B1 mật khẩu ngắn bị chặn phía client, drawer vẫn mở",
      await dlg.isVisible(),
    );
    await dlg.locator("input[type=password]").fill(NEW_PASSWORD);
    await dlg.getByRole("button", { name: "Lưu", exact: true }).click();
    await dlg.waitFor({ state: "hidden", timeout: 15000 });
    check(
      "B2 POST /api/v2/users-management trả 201",
      v2Calls.some((c) => c.method === "POST" && c.status === 201),
    );
    const admin = await apiLogin(ADMIN, PASSWORD);
    const found = await apiGetUsers(admin.token, EMAIL);
    check(
      "B3 tài khoản có trong DB v2, không lộ passwordHash",
      found.length === 1 && !("passwordHash" in found[0]),
    );
    check(
      "B4 tài khoản mới đăng nhập được qua auth v1 (đã sync)",
      (await apiLogin(EMAIL, NEW_PASSWORD)).status === 201,
    );
  });

  await step("C. tìm và ngưng hoạt động", async () => {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("table").first().waitFor({ timeout: 20000 });
    await page.getByPlaceholder(/tìm/i).first().fill(EMAIL);
    const row = page.locator("table tbody tr", { hasText: EMAIL });
    await row.first().waitFor({ timeout: 15000 });
    check("C1 tìm thấy dòng theo email", (await row.count()) === 1);
    await row.first().locator("button").last().click();
    await page
      .getByRole("menuitem", { name: "Ngưng hoạt động", exact: true })
      .click();
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await page
      .locator("table tbody tr", { hasText: EMAIL })
      .filter({ hasText: "Ngưng hoạt động" })
      .first()
      .waitFor({ timeout: 15000 });
    check("C2 trạng thái hiển thị Ngưng hoạt động", true);
    check(
      "C3 tài khoản ngưng không đăng nhập được",
      (await apiLogin(EMAIL, NEW_PASSWORD)).status !== 201,
    );
  });

  await step("D. kích hoạt lại và đặt lại mật khẩu", async () => {
    const row = page.locator("table tbody tr", { hasText: EMAIL }).first();
    await row.locator("button").last().click();
    await page
      .getByRole("menuitem", { name: "Kích hoạt", exact: true })
      .click();
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await page.waitForFunction(
      (email) =>
        [...document.querySelectorAll("table tbody tr")].some(
          (r) =>
            r.textContent.includes(email) &&
            r.textContent.includes("Hoạt động") &&
            !r.textContent.includes("Ngưng"),
        ),
      EMAIL,
      { timeout: 15000 },
    );
    check("D1 kích hoạt lại thành công", true);
    await row.locator("button").last().click();
    await page
      .getByRole("menuitem", { name: "Đặt lại mật khẩu", exact: true })
      .click();
    const reset = `E2e#${TAG}rs`;
    await page.locator("input[type=password]").last().fill(reset);
    await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
    await page.waitForTimeout(1500);
    check(
      "D2 mật khẩu mới đăng nhập được, mật khẩu cũ bị từ chối",
      (await apiLogin(EMAIL, reset)).status === 201 &&
        (await apiLogin(EMAIL, NEW_PASSWORD)).status === 401,
    );
  });

  await shot("final");
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.pass);
console.log(
  `\nE2E users-management: ${results.length - failed.length}/${results.length} PASS`,
);
console.log(`Dữ liệu test cần dọn: email = ${EMAIL}`);
process.exit(failed.length ? 1 : 0);
