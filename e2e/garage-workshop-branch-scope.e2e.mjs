// E2E trang Tiến độ xưởng `/garage-workshop-progress` theo chi nhánh ERP và bộ lọc Phân loại (Garage V2 không còn
// chi nhánh KGara): ô phạm vi "Tất cả chi nhánh" thì thấy mọi xe và không gửi `x-erp-branch-id`; chọn chi nhánh thì gửi
// đúng id và xe không thuộc chi nhánh đó không hiện; không gọi `external-links`, không còn câu "KGara";
// lọc "Xe OJ" ẩn xe chưa phân loại, hiện xe sau khi đặt phân loại OJ.
// Dùng xe NATIVE `E2EB-*` không chi nhánh tạo qua API, đưa vào bảng; `finally` bỏ khỏi bảng và xóa mềm.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_ADMIN_EMAIL, E2E_ERP_BRANCH_IDS (bắt buộc, `<GR>,<GN>`).
// Chạy: bun run e2e:garage-workshop-branch-scope
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "ai-test-admin@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
const BRANCHES = (process.env.E2E_ERP_BRANCH_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (!PASSWORD || BRANCHES.length < 2) {
  console.error(
    "Thiếu E2E_PASSWORD hoặc E2E_ERP_BRANCH_IDS (cần 2 chi nhánh).",
  );
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 220) : ""}`,
  );
};

// ── Dữ liệu nền qua API (không chi nhánh) ───────────────────────────────────
const login = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await login.json()).data?.accessToken;
check("A0 đăng nhập API", Boolean(token));
const H = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
const api = async (method, path, body) => {
  const r = await fetch(`${API}/api/v2/cases-garage${path}`, {
    method,
    headers: H,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  return { status: r.status, d: data?.data ?? data };
};
const PLATE = `E2EB-${Date.now() % 100000}`;
const created = await api("POST", "", {
  licensePlate: PLATE,
  customerName: "E2E chi nhánh",
});
const CASE = created.d?.id;
check(
  "A1 tạo xe NATIVE không chi nhánh (branchId null)",
  Boolean(CASE) && created.d?.branchId === null,
  `${created.status}`,
);
const tracked = CASE
  ? await api("POST", "/workshop/track", { caseId: CASE })
  : { status: 0 };
check(
  "A2 đưa xe vào bảng",
  [200, 201].includes(tracked.status),
  `${tracked.status}`,
);

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});

/** Mở trang với chi nhánh shell `branchId` (null = chưa chọn); ghi lại request board và external-links. */
async function openPage(branchId) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
  });
  await ctx.addInitScript((id) => {
    localStorage.setItem(
      "erp-app",
      JSON.stringify({ state: { currentBranchId: id }, version: 0 }),
    );
  }, branchId);
  const page = await ctx.newPage();
  page.setDefaultTimeout(25000);
  const net = { board: [], externalLinks: 0 };
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/external-links")) net.externalLinks += 1;
    if (url.includes("/api/v2/cases-garage/workshop/board"))
      net.board.push({ url, branch: req.headers()["x-erp-branch-id"] });
  });
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );
  await page.goto(`${WEB}/garage-workshop-progress`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("heading", { name: "Tiến độ xưởng" }).waitFor();
  await page.getByPlaceholder(/Tìm biển số/).fill(PLATE);
  await page.waitForTimeout(2500);
  return { ctx, page, net };
}
const card = (page) => page.getByTestId(`workshop-card-${CASE}`);
const shot = (page, name) =>
  page.screenshot({ path: `${SHOTS}branch-scope-${name}.png` }).catch(() => {});

try {
  // ── B. Phạm vi "Tất cả chi nhánh" (shell luôn có chi nhánh, chọn phạm vi trên trang) ──
  {
    const { ctx, page, net } = await openPage(BRANCHES[0]);
    const scope = page.getByRole("combobox", { name: "Phạm vi chi nhánh" });
    check(
      "B0 ô phạm vi mặc định Chi nhánh đang chọn",
      (await scope.innerText()).includes("Chi nhánh đang chọn"),
    );
    net.board.length = 0;
    await scope.click();
    await page.getByRole("option", { name: "Tất cả chi nhánh" }).click();
    await page.waitForTimeout(2500);
    await card(page)
      .waitFor({ timeout: 30000 })
      .catch(() => {});
    check(
      "B1 Tất cả chi nhánh: thấy xe không chi nhánh",
      (await card(page).count()) === 1,
    );
    check(
      "B2 Tất cả chi nhánh: request board không gửi x-erp-branch-id",
      net.board.length > 0 && net.board.every((r) => !r.branch),
      JSON.stringify(net.board.slice(0, 2)),
    );
    check(
      "B3 không gọi external-links",
      net.externalLinks === 0,
      `${net.externalLinks}`,
    );
    const body = await page.locator("body").innerText();
    check("B4 trang không còn chữ KGara", !/KGara/i.test(body));
    check(
      "B5 nút Thêm xe vào bảng hiện khi xem mọi chi nhánh",
      await page.getByRole("button", { name: "Thêm xe vào bảng" }).isVisible(),
    );

    // Lọc "Xe OJ": xe chưa phân loại bị ẩn; đặt OJ qua API rồi làm mới thì hiện.
    const filter = page.getByRole("combobox", { name: "Phân loại" });
    check(
      "C0 có ô lọc Phân loại, mặc định Tất cả",
      (await filter.innerText()).includes("Tất cả phân loại"),
    );
    await filter.click();
    await page.getByRole("option", { name: "Xe OJ" }).click();
    await page.waitForTimeout(2500);
    check(
      "C1 chọn Xe OJ: board gọi classification=OJ",
      net.board.some((r) => r.url.includes("classification=OJ")),
    );
    check(
      "C2 xe chưa phân loại bị ẩn khi lọc OJ",
      (await card(page).count()) === 0,
    );
    const up = await api("PATCH", `/${CASE}`, { classification: "OJ" });
    check("C3 đặt phân loại OJ qua API", up.status === 200, `${up.status}`);
    await page.getByRole("button", { name: "Làm mới" }).click();
    await card(page)
      .waitFor({ timeout: 20000 })
      .catch(() => {});
    check(
      "C4 sau khi phân loại OJ, xe hiện trong lọc OJ",
      (await card(page).count()) === 1,
    );
    await shot(page, "no-branch-oj");
    await ctx.close();
  }

  // ── D. Chọn từng chi nhánh ERP ─────────────────────────────────────────
  for (const [i, br] of BRANCHES.slice(0, 2).entries()) {
    const { ctx, page, net } = await openPage(br);
    check(
      `D${i}a chi nhánh ${br.slice(0, 8)}: board gửi đúng x-erp-branch-id`,
      net.board.length > 0 && net.board.every((r) => r.branch === br),
      JSON.stringify(net.board.slice(0, 2)),
    );
    check(
      `D${i}b chi nhánh ${br.slice(0, 8)}: xe không chi nhánh không hiện`,
      (await card(page).count()) === 0,
    );
    check(
      `D${i}c không gọi external-links`,
      net.externalLinks === 0,
      `${net.externalLinks}`,
    );
    await shot(page, `branch-${i}`);
    await ctx.close();
  }
} catch (e) {
  check("Z lỗi không mong đợi", false, e?.message ?? String(e));
} finally {
  if (CASE) {
    await api("DELETE", `/workshop/track/${CASE}`);
    const del = await api("DELETE", `/${CASE}`);
    check(
      "Z1 dọn: xóa mềm xe E2E",
      [200, 201].includes(del.status),
      `${del.status}`,
    );
  }
  await browser.close();
}

const failed = results.filter((r) => !r.pass).length;
console.log(`\nTOTAL ${results.length}, FAILED ${failed}`);
process.exit(failed ? 1 : 0);
