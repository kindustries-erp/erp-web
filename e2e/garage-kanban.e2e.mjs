// E2E Kanban "Tiến độ công việc" (drawer dashboard garage): kéo thẻ Báo giá -> Tiếp nhận lưu vào v2
// (status ghi đè, KGara giữ nguyên), nút "Về trạng thái KGara" hoàn lại. Ghi tạm DB staging và luôn hoàn lại.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_ADMIN_EMAIL, E2E_SYNC_BRANCH (branch_external_id của xe KGARA_SYNC).
// Chạy: bun run e2e:garage-kanban
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const BRANCH = process.env.E2E_SYNC_BRANCH;
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "ai-test-admin@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD || !BRANCH) {
  console.error("Thiếu E2E_PASSWORD hoặc E2E_SYNC_BRANCH.");
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

const login = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await login.json()).data?.accessToken;
check("A0 đăng nhập API", Boolean(token));
const H = { Authorization: `Bearer ${token}`, "x-kgara-branch-id": BRANCH };
const progress = async (status) => {
  const all = [];
  for (let page = 1, pages = 1; page <= pages; page += 1) {
    const r = await fetch(
      `${API}/api/v2/cases-garage/progress?status=${status}&page=${page}&pageSize=200`,
      { headers: H },
    );
    const body = await r.json();
    all.push(...(body.items ?? []));
    pages = body.pagination?.totalPages ?? 1;
  }
  return all;
};

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await (
  await browser.newContext({ viewport: { width: 1700, height: 1000 } })
).newPage();
page.setDefaultTimeout(25000);
let movedId = null;
const preOverridden = new Set(
  (await progress("ALL"))
    .filter((c) => c.overriddenFields?.includes("status"))
    .map((c) => c.id),
);
try {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );
  await page.goto(`${WEB}/garage-cases?tab=dashboard`, {
    waitUntil: "domcontentloaded",
  });
  const funnel = page.getByText("2. Báo Giá", { exact: true });
  await funnel.first().waitFor({ state: "visible", timeout: 40000 });
  await funnel.first().click();
  await page.getByTestId("cases-table-counts").first().waitFor();
  await page.getByText("Tiến độ công việc", { exact: true }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: SHOTS + "garage-kanban-before.png" });

  const body0 = await page.innerText("body");
  check(
    "B1 đủ 5 cột kể cả Tiếp nhận",
    ["Tiếp nhận", "Báo giá", "Đang làm", "Hoàn thành", "Hủy"].every((n) =>
      body0.includes(n),
    ),
  );

  // Chọn thẻ đầu tiên có biển số khớp một xe sync QUOTED trong API.
  const quoted = await progress("QUOTED");
  const plates = new Map(quoted.map((c) => [c.licensePlate, c]));
  const card = page
    .locator("[aria-roledescription=sortable]")
    .filter({ hasText: /[0-9]{2}[A-Z]/ });
  const count = await card.count();
  check("B2 có thẻ xe để kéo", count > 0, `số thẻ: ${count}`);
  let source = null;
  for (let i = 0; i < count; i += 1) {
    const box = await card.nth(i).boundingBox();
    if (!box) continue;
    const text = await card.nth(i).innerText();
    if (!text.includes("Báo giá")) continue;
    const plate = [...plates.keys()].find(
      (p) =>
        p && text.replace(/[-.\s]/g, "").includes(p.replace(/[-.\s]/g, "")),
    );
    if (plate) {
      source = { el: card.nth(i), data: plates.get(plate) };
      break;
    }
  }
  check("B3 tìm được thẻ khớp xe QUOTED của API", Boolean(source));
  if (source) {
    movedId = source.data.id;
    const target = page.getByText("Chưa có mục nào").first();
    const from = await source.el.boundingBox();
    const to = await target.boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + 20);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + 30, {
      steps: 5,
    });
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: 25,
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: SHOTS + "garage-kanban-mid-drag.png" });
    await page.mouse.up();

    let row = null;
    for (let i = 0; i < 12 && !row; i += 1) {
      await page.waitForTimeout(500);
      row = (await progress("INTAKE")).find((c) => c.id === movedId);
    }
    check("C1 kéo sang Tiếp nhận: API trả status INTAKE", Boolean(row));
    check(
      "C2 status được đánh dấu ghi đè",
      row?.overriddenFields?.includes("status"),
    );
    await page.waitForTimeout(1500);
    await page.screenshot({ path: SHOTS + "garage-kanban-after-drag.png" });
    // Thẻ kéo thả cũng có role=button chứa chữ này, nên chọn đúng thẻ <button>.
    const revert = page
      .locator('button[aria-label="Về trạng thái KGara"]')
      .first();
    check(
      "C3 thẻ hiện nút Về trạng thái KGara",
      await revert.waitFor({ state: "visible", timeout: 20000 }).then(
        () => true,
        () => false,
      ),
    );
    await revert.click();
    let back = null;
    for (let i = 0; i < 12 && !back; i += 1) {
      await page.waitForTimeout(500);
      back = (await progress("QUOTED")).find((c) => c.id === movedId);
    }
    check(
      "C4 hoàn về KGara: API trả QUOTED, không còn ghi đè",
      back && !back.overriddenFields?.includes("status"),
    );
    movedId = null;
  }
} finally {
  // Hoàn mọi phiếu bị ghi đè status trong lần chạy này (thẻ có thể gồm nhiều phiếu).
  const stale = (await progress("ALL")).filter(
    (c) => c.overriddenFields?.includes("status") && !preOverridden.has(c.id),
  );
  for (const c of stale) {
    await fetch(`${API}/api/v2/cases-garage/${c.id}/revert`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: ["status"] }),
    });
  }
  if (stale.length)
    console.log(`INFO  đã revert ${stale.length} phiếu staging`);
  await page
    .screenshot({ path: SHOTS + "garage-kanban-end.png" })
    .catch(() => {});
  await browser.close();
}
const failed = results.filter((r) => !r.pass).length;
console.log(`TOTAL ${results.length}, FAILED ${failed}`);
process.exit(failed ? 1 : 0);
