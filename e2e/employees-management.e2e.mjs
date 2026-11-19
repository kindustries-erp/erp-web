// E2E Quản lý nhân viên V2 (/employees-management, /v2/employees-management): bảng gọi API v2, tạo, sửa, CCCD, đổi trạng thái, xóa, liên kết tài khoản.
// Biến môi trường như garage-procurement.e2e.mjs (xem erp-e2e-playwright/SKILL.md): E2E_PASSWORD bắt buộc.
// E2E_TAO_EMAIL (mặc định ai-test-tao@example.com), E2E_PASSWORD: tài khoản cần quyền employees:read/create/update/delete và admin_users:manage (nếu thiếu, bước đó FAIL đúng nghĩa thiếu quyền).
// Nhân viên test mã `E2E<tag>` được xóa mềm cuối bài; tài khoản `e2e-emp-*` cần dọn bằng SQL. KHÔNG chạy trên DB production.
// Chạy: bun run e2e:employees-management
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
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
const TAG = Date.now();
const CODE = `E2E${TAG}`;
const NAME = `E2E Nhan Vien ${TAG}`;
// CCCD không là chuỗi con của mã nhân viên
const NATIONAL_ID = `0${String(TAG).split("").reverse().join("")}`.slice(0, 12);
const USER_EMAIL = `e2e-emp-${TAG}@example.com`;
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 140) : ""}`,
  );
};

let token = "";
async function api(method, path, body) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function findEmployee() {
  const r = await api(
    "GET",
    `/api/v2/employees?page=1&pageSize=5&search=${CODE}`,
  );
  return (r.data.items ?? []).find((e) => e.employeeCode === CODE);
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const calls = [];
page.on("response", (res) => {
  const u = res.url();
  if (u.includes("/api/v2/employees") || u.includes("/api/v1/employees"))
    calls.push({
      method: res.request().method(),
      status: res.status(),
      url: u,
    });
});
const shot = (name) =>
  page.screenshot({ path: `${SHOTS}employees-${name}.png` });
async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(name, false, e.message.split("\n")[0]);
    await shot(`fail-${name.replace(/\W+/g, "-")}`).catch(() => {});
  }
}
const field = (dlg, label) =>
  dlg.locator(
    `xpath=.//*[normalize-space(text())="${label}"]/following::input[1]`,
  );
const rowActions = async (row, item) => {
  await row.locator("button").last().click();
  await page.getByRole("menuitem", { name: item, exact: true }).click();
};
const openList = async (path) => {
  await page.goto(`${WEB}${path}`, { waitUntil: "domcontentloaded" });
  await page.locator("table").first().waitFor({ timeout: 20000 });
  await page.getByPlaceholder(/tìm/i).first().fill(CODE);
};

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
  token = (
    await (
      await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN, password: PASSWORD }),
      })
    ).json()
  ).accessToken;

  await step("A. URL mới, URL cũ và trang V2 độc lập", async () => {
    await page.goto(`${WEB}/employees-management`, {
      waitUntil: "domcontentloaded",
    });
    await page.locator("table").first().waitFor({ timeout: 20000 });
    check(
      "A1 /employees-management hiện bảng V2",
      (await page
        .getByRole("button", { name: "Thêm nhân viên", exact: true })
        .count()) === 1,
    );
    for (let i = 0; i < 20 && !calls.length; i++)
      await page.waitForTimeout(250);
    check(
      "A2 web gọi GET /api/v2/employees 200, không gọi v1",
      calls.some(
        (c) =>
          c.method === "GET" &&
          c.status === 200 &&
          c.url.includes("/api/v2/employees"),
      ) && !calls.some((c) => c.url.includes("/api/v1/employees")),
      JSON.stringify(calls.map((c) => `${c.method} ${c.status}`)),
    );
    await page.goto(`${WEB}/erp-employees`, { waitUntil: "domcontentloaded" });
    await page
      .getByRole("button", { name: "Thêm nhân viên", exact: true })
      .waitFor({ timeout: 20000 });
    check("A3 URL cũ /erp-employees mở trang mới", true, page.url());
    await page.goto(`${WEB}/v2/employees-management`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("button", { name: "Thêm nhân viên", exact: true })
      .waitFor({ timeout: 20000 });
    check("A4 /v2/employees-management mở được", true);
  });

  await step("B. tạo nhân viên qua drawer", async () => {
    await page
      .getByRole("button", { name: "Thêm nhân viên", exact: true })
      .click();
    const dlg = page.locator('[role="dialog"]');
    await dlg.waitFor({ timeout: 10000 });
    await dlg.getByRole("button", { name: "Lưu", exact: true }).click();
    check(
      "B1 thiếu họ tên bị chặn client, drawer vẫn mở",
      await dlg.isVisible(),
    );
    await field(dlg, "Họ tên").fill(NAME);
    await field(dlg, "CCCD").fill("123");
    await dlg.getByRole("button", { name: "Lưu", exact: true }).click();
    check("B2 CCCD sai bị chặn client, drawer vẫn mở", await dlg.isVisible());
    await field(dlg, "Mã").fill(CODE);
    await field(dlg, "CCCD").fill(NATIONAL_ID);
    await field(dlg, "Chức danh").fill("Kỹ thuật viên");
    await field(dlg, "Phòng ban").fill("Xưởng");
    await dlg.getByRole("button", { name: "Lưu", exact: true }).click();
    await dlg.waitFor({ state: "hidden", timeout: 15000 });
    check(
      "B3 POST /api/v2/employees trả 201",
      calls.some((c) => c.method === "POST" && c.status === 201),
    );
    const emp = await findEmployee();
    check(
      "B4 có trong DB, CCCD chỉ trả bản che",
      emp &&
        emp.nationalIdMasked?.endsWith(NATIONAL_ID.slice(-4)) &&
        !JSON.stringify(emp).includes(NATIONAL_ID),
    );
  });

  await step("C. tìm, xem chi tiết, bảng chỉ hiện CCCD che", async () => {
    await openList("/employees-management");
    const row = page.locator("table tbody tr", { hasText: CODE });
    await row.first().waitFor({ timeout: 15000 });
    check("C1 tìm thấy dòng theo mã", (await row.count()) === 1);
    check(
      "C2 dòng hiện họ tên, chức danh, phòng ban",
      (await row.first().textContent()).includes(NAME) &&
        (await row.first().textContent()).includes("Kỹ thuật viên") &&
        (await row.first().textContent()).includes("Xưởng"),
    );
    await rowActions(row.first(), "Xem chi tiết");
    const dlg = page.locator('[role="dialog"]');
    await dlg.waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    const text = await dlg.textContent();
    check(
      "C3 chi tiết chỉ hiển thị CCCD che",
      text.includes(NATIONAL_ID.slice(-4)) && !text.includes(NATIONAL_ID),
    );
    await dlg.getByRole("button", { name: "Đóng", exact: true }).last().click();
    await dlg.waitFor({ state: "hidden", timeout: 10000 });
  });

  await step("D. sửa: CCCD đầy đủ nạp vào form, xóa chức danh", async () => {
    const row = page.locator("table tbody tr", { hasText: CODE }).first();
    await rowActions(row, "Chỉnh sửa");
    const dlg = page.locator('[role="dialog"]');
    await dlg.waitFor({ timeout: 10000 });
    await page.waitForFunction(
      (id) =>
        [...document.querySelectorAll('[role="dialog"] input')].some(
          (i) => i.value === id,
        ),
      NATIONAL_ID,
      { timeout: 10000 },
    );
    check(
      "D1 form sửa nạp CCCD đầy đủ qua /national-id",
      calls.some((c) => c.url.includes("/national-id") && c.status === 200),
    );
    check(
      "D2 mã nhân viên bị khóa khi sửa",
      await field(dlg, "Mã").isDisabled(),
    );
    await field(dlg, "Chức danh").fill("");
    await field(dlg, "Phòng ban").fill("Kho");
    await dlg.getByRole("button", { name: "Lưu", exact: true }).click();
    await dlg.waitFor({ state: "hidden", timeout: 15000 });
    const emp = await findEmployee();
    check(
      "D3 chức danh được xóa (null), phòng ban đổi",
      emp && emp.jobTitle == null && emp.department === "Kho",
    );
    check(
      "D4 CCCD giữ nguyên sau khi sửa",
      (await api("GET", `/api/v2/employees/${emp.id}/national-id`)).data?.data
        ?.nationalId === NATIONAL_ID,
    );
  });

  await step("E. đổi trạng thái nghỉ việc / đi làm lại", async () => {
    await openList("/employees-management");
    const row = page.locator("table tbody tr", { hasText: CODE }).first();
    await row.waitFor({ timeout: 15000 });
    await rowActions(row, "Chuyển sang nghỉ việc");
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await page
      .locator("table tbody tr", { hasText: CODE })
      .filter({ hasText: "Nghỉ việc" })
      .first()
      .waitFor({ timeout: 15000 });
    const off = await findEmployee();
    check(
      "E1 hiển thị Nghỉ việc và có ngày nghỉ việc",
      off?.status === "INACTIVE" && !!off.leaveDate,
    );
    await rowActions(
      page.locator("table tbody tr", { hasText: CODE }).first(),
      "Chuyển sang đang làm",
    );
    await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
    await page
      .locator("table tbody tr", { hasText: CODE })
      .filter({ hasText: "Đang làm" })
      .first()
      .waitFor({ timeout: 15000 });
    const on = await findEmployee();
    check(
      "E2 đi làm lại xóa ngày nghỉ việc",
      on?.status === "ACTIVE" && on.leaveDate == null,
    );
  });

  await step("F. nhân viên có tài khoản liên kết không xóa được", async () => {
    const emp = await findEmployee();
    const user = await api("POST", "/api/v2/users-management", {
      email: USER_EMAIL,
      password: `E2e#${TAG}pw`,
    });
    const link = await api(
      "POST",
      `/api/v2/users-management/${user.data?.data?.id}/link-employee`,
      { employeeId: emp.id },
    );
    check(
      "F1 liên kết tài khoản qua users-management v2",
      [200, 201].includes(link.status),
      link.status,
    );
    await openList("/employees-management");
    const row = page.locator("table tbody tr", { hasText: CODE }).first();
    await row.waitFor({ timeout: 15000 });
    check(
      "F2 cột Tài khoản hiện email liên kết",
      (await row.textContent()).includes(USER_EMAIL),
    );
    await row.locator("button").last().click();
    check(
      "F3 menu không có mục Xóa",
      (await page
        .getByRole("menuitem", { name: "Xóa", exact: true })
        .count()) === 0,
    );
    await page.keyboard.press("Escape");
    const del = await api("DELETE", `/api/v2/employees/${emp.id}`);
    check("F4 API cũng chặn xóa (409)", del.status === 409, del.status);
    await api(
      "POST",
      `/api/v2/users-management/${user.data.data.id}/unlink-employee`,
    );
  });

  await step("G. xóa mềm qua UI có xác nhận", async () => {
    await openList("/employees-management");
    const row = page.locator("table tbody tr", { hasText: CODE }).first();
    await row.waitFor({ timeout: 15000 });
    await rowActions(row, "Xóa");
    await page.getByRole("button", { name: "Xóa", exact: true }).last().click();
    await page.waitForFunction(
      (code) =>
        ![...document.querySelectorAll("table tbody tr")].some((r) =>
          r.textContent.includes(code),
        ),
      CODE,
      { timeout: 15000 },
    );
    check("G1 dòng biến mất khỏi bảng", true);
    check("G2 API không còn trả nhân viên (xóa mềm)", !(await findEmployee()));
  });

  await shot("final");
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.pass);
console.log(
  `\nE2E employees-management: ${results.length - failed.length}/${results.length} PASS`,
);
console.log(
  `Dữ liệu test: nhân viên ${CODE} đã xóa mềm; cần dọn tài khoản email = ${USER_EMAIL}`,
);
process.exitCode = failed.length ? 1 : 0;
