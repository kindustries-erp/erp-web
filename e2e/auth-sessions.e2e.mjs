// E2E Auth V2 (/api/v2/auth-sessions): đăng nhập từ UI gọi API v2, 401 tự refresh qua v2 và gọi lại thành công,
// refresh token bị thu hồi thì UI đưa về màn hình đăng nhập, đổi mật khẩu thu hồi phiên cũ.
// Biến môi trường như users-management.e2e.mjs (xem erp-e2e-playwright/SKILL.md): E2E_PASSWORD hoặc E2E_ADMIN_PASSWORD bắt buộc,
// E2E_ADMIN_EMAIL mặc định admin@liouni.com. Tạo tài khoản `e2e-auth-<tag>@example.com`; dọn bằng SQL sau khi chạy.
// KHÔNG chạy trên DB production. Chạy: bun run e2e:auth-sessions
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
const TEMP_EMAIL = `e2e-auth-${TAG}@example.com`;
const TEMP_PW1 = `E2e#${TAG}a`;
const TEMP_PW2 = `E2e#${TAG}b`;
const A = `${API}/api/v2/auth-sessions`;
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 140) : ""}`,
  );
};

async function post(url, body, token) {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const calls = [];
page.on("response", (res) => {
  const u = res.url();
  if (u.includes("/api/v2/auth-sessions") || u.includes("/api/v1/auth"))
    calls.push({
      method: res.request().method(),
      status: res.status(),
      url: u,
    });
});
const stored = () =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("erp-auth") ?? "{}").state ?? {},
  );
const shot = (name) => page.screenshot({ path: `${SHOTS}auth-${name}.png` });
async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(name, false, e.message.split("\n")[0]);
    await shot(`fail-${name.replace(/\W+/g, "-")}`).catch(() => {});
  }
}
const hit = (path, status) =>
  calls.some((c) => c.url.includes(path) && c.status === status);

try {
  await step("A. đăng nhập từ UI gọi auth V2", async () => {
    await page.goto(WEB, { waitUntil: "domcontentloaded" });
    await page.fill("input[type=email]", ADMIN);
    await page.fill("input[type=password]", PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForFunction(
      () => !document.querySelector("input[type=password]"),
      null,
      {
        timeout: 30000,
      },
    );
    check(
      "A1 POST /api/v2/auth-sessions/login trả 200",
      hit("/api/v2/auth-sessions/login", 200),
    );
    check(
      "A2 UI không gọi /api/v1/auth/login",
      !calls.some((c) => c.url.includes("/api/v1/auth/login")),
    );
    const s = await stored();
    check(
      "A3 phiên lưu accessToken và refreshToken",
      !!s.accessToken && !!s.refreshToken,
    );
  });

  await step("B. profile qua V2 sau đăng nhập", async () => {
    for (let i = 0; i < 20 && !hit("/api/v2/auth-sessions/profile", 200); i++)
      await page.waitForTimeout(250);
    check(
      "B1 GET /api/v2/auth-sessions/profile trả 200",
      hit("/api/v2/auth-sessions/profile", 200),
    );
  });

  await step("C. 401 tự refresh qua V2 rồi gọi lại thành công", async () => {
    const before = (await stored()).refreshToken;
    let blocked = false;
    await page.route("**/api/v2/users-management?**", async (route) => {
      if (!blocked) {
        blocked = true;
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Unauthorized" }),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto(`${WEB}/v2/users-management`, {
      waitUntil: "domcontentloaded",
    });
    await page.locator("table tbody tr").first().waitFor({ timeout: 30000 });
    check(
      "C1 gọi POST /api/v2/auth-sessions/refresh trả 200",
      hit("/api/v2/auth-sessions/refresh", 200),
    );
    check(
      "C2 UI không gọi /api/v1/auth/refresh",
      !calls.some((c) => c.url.includes("/api/v1/auth/refresh")),
    );
    const after = (await stored()).refreshToken;
    check("C3 refresh token được xoay vòng", !!after && after !== before);
    check(
      "C4 bảng hiển thị dữ liệu sau khi gọi lại",
      (await page.locator("table tbody tr").count()) > 0,
    );
    await page.unroute("**/api/v2/users-management?**");
  });

  await step("D. đổi mật khẩu qua API V2 thu hồi phiên cũ", async () => {
    const admin = await post(`${A}/login`, {
      email: ADMIN,
      password: PASSWORD,
    });
    const T = admin.data?.data?.accessToken;
    const created = await post(
      `${API}/api/v2/users-management`,
      { email: TEMP_EMAIL, password: TEMP_PW1 },
      T,
    );
    check(
      "D1 tạo tài khoản tạm",
      created.status === 201,
      String(created.status),
    );
    const l1 = await post(`${A}/login`, {
      email: TEMP_EMAIL,
      password: TEMP_PW1,
    });
    check("D2 tài khoản tạm đăng nhập được", l1.status === 200);
    const chg = await post(
      `${A}/change-password`,
      { oldPassword: TEMP_PW1, newPassword: TEMP_PW2 },
      l1.data?.data?.accessToken,
    );
    check("D3 đổi mật khẩu thành công", chg.status === 200, String(chg.status));
    const old = await post(`${A}/refresh`, {
      refreshToken: l1.data?.data?.refreshToken,
    });
    check(
      "D4 refresh token cũ bị từ chối",
      old.status === 401,
      String(old.status),
    );
    check(
      "D5 mật khẩu mới đăng nhập được",
      (await post(`${A}/login`, { email: TEMP_EMAIL, password: TEMP_PW2 }))
        .status === 200,
    );
  });

  await step(
    "E. refresh token bị thu hồi: UI về màn hình đăng nhập",
    async () => {
      const s = await stored();
      const out = await post(`${A}/logout`, { refreshToken: s.refreshToken });
      check(
        "E1 logout V2 thu hồi refresh token đang lưu",
        out.status === 200,
        String(out.status),
      );
      const again = await post(`${A}/refresh`, {
        refreshToken: s.refreshToken,
      });
      check(
        "E2 refresh bằng token vừa logout trả 401",
        again.status === 401,
        String(again.status),
      );
      let blocked = false;
      await page.route("**/api/v2/users-management?**", async (route) => {
        if (!blocked) {
          blocked = true;
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ message: "Unauthorized" }),
          });
        } else {
          await route.continue();
        }
      });
      await page.goto(`${WEB}/v2/users-management`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("input[type=password]", { timeout: 30000 });
      check("E3 UI quay về màn hình đăng nhập", true);
      await page.unroute("**/api/v2/users-management?**");
    },
  );
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(
  `\nE2E auth-sessions: ${results.length - failed.length}/${results.length} PASS`,
);
console.log(
  `Dữ liệu test cần dọn: email LIKE 'e2e-auth-${TAG}%' (users_management, core_users)`,
);
process.exit(failed.length ? 1 : 0);
