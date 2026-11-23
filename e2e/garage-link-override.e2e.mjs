// E2E link-override (PR garage): chọn chi nhánh → điền tên song song, sửa tên → "Đã chỉnh",
// khôi phục, lưu nháp, đối chiếu API (snapshot, cờ đã chỉnh, chi nhánh gốc không đổi), màn hình điện thoại.
// Biến môi trường như garage-procurement.e2e.mjs (xem erp-e2e-playwright/SKILL.md): E2E_PASSWORD bắt buộc.
// Chạy: bun run e2e:garage-link-override
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const TAO_EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error(
    "Thiếu E2E_PASSWORD. Đặt mật khẩu tài khoản test rồi chạy lại.",
  );
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const TAG = `E2E-LNK-${Date.now()}`;
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 140) : ""}`,
  );
};
const shot = (page, name) =>
  page.screenshot({ path: `${SHOTS}${name}.png` }).catch(() => {});
async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(`${name} (exception)`, false, e.message);
  }
}
const poll = async (fn, ok, tries = 30) => {
  let v = null;
  for (let i = 0; i < tries; i++) {
    v = await fn();
    if (ok(v)) return v;
    await new Promise((r) => setTimeout(r, 500));
  }
  return v;
};

const unwrap = (d) => d?.data ?? d;
const loginRes = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: TAO_EMAIL, password: PASSWORD }),
});
const token = unwrap(await loginRes.json())?.accessToken;
const api = async (path) =>
  unwrap(
    await (
      await fetch(`${API}/api/v2${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).json(),
  );

async function login(page) {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", TAO_EMAIL);
  await page.fill("input[type=password]", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !document.querySelector("input[type=password]"),
    null,
    { timeout: 30000 },
  );
}
async function waitTable(page) {
  for (let i = 0; i < 2; i++) {
    try {
      await page.locator("table").first().waitFor({ timeout: 15000 });
      return;
    } catch (e) {
      if (i === 1) throw e;
      await page.reload({ waitUntil: "domcontentloaded" });
    }
  }
}
const openCreate = async (page, { mobile = false } = {}) => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=requests`, {
    waitUntil: "domcontentloaded",
  });
  // Màn hình điện thoại hiển thị danh sách dạng thẻ, không có <table>.
  if (!mobile) await waitTable(page);
  await page.getByRole("button", { name: /^Tạo/ }).first().click();
  const dialog = page.getByRole("dialog").first();
  await dialog
    .getByRole("button", { name: "Lưu nháp", exact: true })
    .waitFor({ timeout: 20000 });
  return dialog;
};

async function openRowMenu(page, text) {
  const row = page.locator("tr", { hasText: text }).first();
  await row.waitFor({ timeout: 20000 });
  await row.click({ button: "right" });
  await page.getByRole("menu").first().waitFor({ timeout: 10000 });
}
const menuItem = (page, name) =>
  page.getByRole("menuitem", { name, exact: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
await step("K0 đăng nhập", async () => {
  await login(page);
  check("K0 đăng nhập", true);
});

let sourceName = "";
let branchId = "";
let savedPr = null;
await step("K1 chọn chi nhánh → tên song song tự điền", async () => {
  const dialog = await openCreate(page);
  await dialog.getByRole("combobox", { name: "Chi nhánh" }).click();
  const opt = page.getByRole("option").first();
  await opt.waitFor({ timeout: 20000 });
  // Nhãn option là "mã — tên"; giá trị nguồn của field là tên thuần (phần sau " — ").
  const optionLabel = ((await opt.innerText()) || "").trim();
  sourceName = optionLabel.includes(" — ")
    ? optionLabel.split(" — ").slice(1).join(" — ")
    : optionLabel;
  await opt.click();
  const nameBox = dialog.getByRole("textbox", {
    name: "Tên chi nhánh trên phiếu",
  });
  await nameBox.waitFor();
  check("K1 ô tên chi nhánh có mặt", true);
  check(
    "K1 tên tự điền = tên chi nhánh đã chọn",
    (await nameBox.inputValue()) === sourceName,
    sourceName,
  );
  check(
    "K1 chưa có nhãn Đã chỉnh",
    (await dialog.getByText("Đã chỉnh", { exact: true }).count()) === 0,
  );
  await shot(page, "K1-linked-picked");

  await nameBox.fill(`${sourceName} (${TAG})`);
  await dialog
    .getByText("Đã chỉnh", { exact: true })
    .waitFor({ timeout: 5000 });
  check("K2 sửa tên → hiện nhãn Đã chỉnh", true);
  check(
    "K2 hiện giá trị gốc",
    (await dialog.getByText(`Gốc: ${sourceName}`).count()) > 0,
  );

  await dialog.getByRole("button", { name: "Khôi phục theo nguồn" }).click();
  check(
    "K3 khôi phục → tên về giá trị gốc",
    (await nameBox.inputValue()) === sourceName,
  );
  check(
    "K3 khôi phục → hết nhãn Đã chỉnh",
    (await dialog.getByText("Đã chỉnh", { exact: true }).count()) === 0,
  );

  await nameBox.fill(`${sourceName} (${TAG})`);
  await dialog
    .getByText("Đã chỉnh", { exact: true })
    .waitFor({ timeout: 5000 });

  const title = dialog
    .locator("label", { hasText: /^Nội dung$/ })
    .locator("xpath=following::*[self::input or self::textarea][1]");
  await title.fill(`${TAG} PR`);
  await dialog
    .getByRole("textbox", { name: "Tên", exact: true })
    .fill(`Vật tư ${TAG}`);
  await dialog
    .getByRole("textbox", { name: "Số lượng", exact: true })
    .fill("2");
  await dialog
    .getByRole("textbox", { name: "Đơn giá dự kiến", exact: true })
    .fill("100");
  await dialog.getByRole("button", { name: "Lưu nháp", exact: true }).click();
});

await step("K4 lưu nháp → API đúng", async () => {
  const found = await poll(
    async () =>
      (
        await api(
          `/procurement-requests-garage?search=${encodeURIComponent(TAG)}&page=1`,
        )
      )?.items ?? [],
    (items) => items.length > 0,
  );
  check("K4 PR đã được tạo", found.length > 0);
  const pr = await api(`/procurement-requests-garage/${found[0].id}`);
  branchId = pr.branchId;
  savedPr = pr;
  check(
    "K4 branchName là tên đã sửa",
    pr.branchName === `${sourceName} (${TAG})`,
    pr.branchName,
  );
  check(
    "K4 overriddenFields có branchName",
    (pr.overriddenFields ?? []).includes("branchName"),
  );
  check(
    "K4 snapshot giữ tên gốc",
    pr.sourceSnapshot?.branchName === sourceName,
    pr.sourceSnapshot?.branchName,
  );
  const branches = (await api("/branches?page=1&pageSize=200"))?.items ?? [];
  check(
    "K4 chi nhánh gốc KHÔNG đổi tên",
    branches.find((b) => b.id === branchId)?.name === sourceName,
  );
});

await step(
  "K4b chỉ chọn chi nhánh (không sửa tên) → không bị đánh dấu Đã chỉnh",
  async () => {
    const dialog = await openCreate(page);
    await dialog.getByRole("combobox", { name: "Chi nhánh" }).click();
    await page.getByRole("option").first().click();
    const plainTitle = `${TAG} PR-plain`;
    await dialog
      .locator("label", { hasText: /^Nội dung$/ })
      .locator("xpath=following::*[self::input or self::textarea][1]")
      .fill(plainTitle);
    await dialog
      .getByRole("textbox", { name: "Tên", exact: true })
      .fill(`Vật tư ${TAG}`);
    await dialog
      .getByRole("textbox", { name: "Số lượng", exact: true })
      .fill("1");
    await dialog
      .getByRole("textbox", { name: "Đơn giá dự kiến", exact: true })
      .fill("100");
    await dialog.getByRole("button", { name: "Lưu nháp", exact: true }).click();
    const found = await poll(
      async () =>
        (
          await api(
            `/procurement-requests-garage?search=${encodeURIComponent(plainTitle)}&page=1`,
          )
        )?.items ?? [],
      (items) => items.length > 0,
    );
    const pr = await api(`/procurement-requests-garage/${found[0]?.id}`);
    check(
      "K4b branchName = tên chi nhánh thuần",
      pr.branchName === sourceName,
      pr.branchName,
    );
    check(
      "K4b KHÔNG có field đã chỉnh",
      (pr.overriddenFields ?? []).length === 0,
      JSON.stringify(pr.overriddenFields),
    );
  },
);

await step(
  "K6 sửa PR đã lưu: đổi chi nhánh chưa lưu thì không còn Cập nhật từ nguồn; bỏ chọn thì xóa tên",
  async () => {
    if (!savedPr) throw new Error("Không có PR đã lưu từ K4");
    await page.goto(`${WEB}/v2/garage-procurement?tab=requests`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, savedPr.requestNo);
    await menuItem(page, "Chỉnh sửa").click();
    const dialog = page.getByRole("dialog").first();
    const nameBox = dialog.getByRole("textbox", {
      name: "Tên chi nhánh trên phiếu",
    });
    await nameBox.waitFor({ timeout: 20000 });
    const refreshBtn = dialog.getByRole("button", {
      name: "Cập nhật từ nguồn",
    });
    check(
      "K6 chi nhánh trùng bản đã lưu → có nút Cập nhật từ nguồn",
      (await refreshBtn.count()) > 0,
    );

    await dialog.getByRole("combobox", { name: "Chi nhánh" }).click();
    const options = page.getByRole("option");
    await options.first().waitFor();
    const texts = await options.allInnerTexts();
    const otherIdx = texts.findIndex((t) => !t.includes(sourceName));
    if (otherIdx < 0) {
      console.log("INFO  K6 chỉ có một chi nhánh, bỏ qua nhánh đổi chi nhánh");
      await page.keyboard.press("Escape");
    } else {
      await options.nth(otherIdx).click();
      await page.waitForTimeout(500);
      check(
        "K6 đã chọn chi nhánh khác (chưa lưu) → ẩn nút Cập nhật từ nguồn",
        (await refreshBtn.count()) === 0,
      );
    }

    await dialog.getByRole("button", { name: "Bỏ lựa chọn" }).click();
    check(
      "K6 bỏ chọn chi nhánh → ô tên chi nhánh trống",
      (await nameBox.inputValue()) === "",
      await nameBox.inputValue(),
    );
    await shot(page, "K6-edit-cleared");
  },
);

await step("K5 màn hình điện thoại không tràn ngang", async () => {
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mp = await mobile.newPage();
  mp.setDefaultTimeout(20000);
  await login(mp);
  const dialog = await openCreate(mp, { mobile: true });
  await dialog.getByRole("combobox", { name: "Chi nhánh" }).click();
  const opt = mp.getByRole("option").first();
  await opt.waitFor();
  await opt.click();
  const nameBox = dialog.getByRole("textbox", {
    name: "Tên chi nhánh trên phiếu",
  });
  await nameBox.waitFor();
  await nameBox.fill(`${sourceName} (${TAG} m)`);
  await dialog.getByText("Đã chỉnh", { exact: true }).waitFor();
  await shot(mp, "K5-linked-mobile");
  const overflow = await mp.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  const box = await nameBox.boundingBox();
  check("K5 trang không cuộn ngang", overflow <= 1, `overflow=${overflow}`);
  check(
    "K5 ô tên nằm trọn trong màn hình",
    !!box && box.x >= 0 && box.x + box.width <= 390 + 1,
    JSON.stringify(box),
  );
  await mobile.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`TOTAL ${results.length}, FAILED ${failed.length}`);
process.exit(failed.length ? 1 : 0);
