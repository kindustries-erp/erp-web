// E2E "lưu rồi hành động một bước" Garage: PR Tạo mới/Cập nhật, PO Tạo mới (không còn 409), phiếu nhập Nhập kho + Hoàn nhập.
// Biến môi trường như garage-procurement.e2e.mjs (xem erp-e2e-playwright/SKILL.md): E2E_PASSWORD bắt buộc.
// Chạy: bun run e2e:garage-save-and-act
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const API = process.env.E2E_API_URL ?? "http://localhost:10003";
const WEB = process.env.E2E_WEB_URL ?? "http://127.0.0.1:5173";
const PASSWORD = process.env.E2E_PASSWORD;
const TAO_EMAIL = process.env.E2E_TAO_EMAIL ?? "ai-test-tao@example.com";
const DUYET_EMAIL = process.env.E2E_DUYET_EMAIL ?? "ai-test-duyet@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error(
    "Thiếu E2E_PASSWORD. Đặt mật khẩu tài khoản test rồi chạy lại.",
  );
  process.exit(2);
}
const SHOTS = new URL("./.artifacts/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const TAG = `E2E-SAA-${Date.now()}`;
const TODAY = new Date().toISOString().slice(0, 10);
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass, detail: String(detail).slice(0, 140) });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 140) : ""}`,
  );
};

async function apiLogin(email) {
  const r = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const b = await r.json();
  return { token: b.accessToken, user: b.user };
}
async function api(s, method, path, body) {
  const url = path.startsWith("/api/")
    ? `${API}${path}`
    : `${API}/api/v2${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${s.token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await r.json();
  } catch {
    /* no body */
  }
  return { status: r.status, data };
}
async function login(page, email) {
  await page.goto(WEB, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", email);
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
async function openRowMenu(page, text) {
  const row = page.locator("tr", { hasText: text }).first();
  await row.waitFor({ timeout: 20000 });
  await row.click({ button: "right" });
  await page.getByRole("menu").first().waitFor({ timeout: 10000 });
}
const menuItem = (page, name) =>
  page.getByRole("menuitem", { name, exact: true });
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
const buttonNames = (dialog) =>
  dialog
    .getByRole("button")
    .evaluateAll((els) =>
      els.map((e) => (e.innerText || "").trim()).filter(Boolean),
    );
const listByTitle = async (s, title) =>
  (
    await api(
      s,
      "GET",
      `/procurement-requests-garage?search=${encodeURIComponent(title)}&page=1`,
    )
  ).data?.items ?? [];

const tao = await apiLogin(TAO_EMAIL);
const duyet = await apiLogin(DUYET_EMAIL);

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
await step("J0 đăng nhập người tạo", async () => {
  await login(page, TAO_EMAIL);
  check("J0 đăng nhập", true);
});

const openCreatePr = async () => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=requests`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await page.getByRole("button", { name: /^Tạo/ }).first().click();
  const dialog = page.getByRole("dialog").first();
  await dialog
    .getByRole("button", { name: "Lưu nháp", exact: true })
    .waitFor({ timeout: 20000 });
  return dialog;
};
const fillPrLine = async (dialog, title) => {
  await dialog
    .getByRole("textbox", { name: "Tên", exact: true })
    .fill(`Vật tư ${title}`);
  await dialog
    .getByRole("textbox", { name: "Số lượng", exact: true })
    .fill("3");
  await dialog
    .getByRole("textbox", { name: "Đơn giá dự kiến", exact: true })
    .fill("100");
};
/** Ô "Nội dung" (tiêu đề PR): textarea đứng ngay sau nhãn. */
const fillTitle = async (dialog, value) => {
  const box = dialog
    .locator("label", { hasText: /^Nội dung$/ })
    .locator("xpath=following::*[self::input or self::textarea][1]");
  await box.fill(value);
  check(`Điền Nội dung "${value}"`, (await box.inputValue()) === value);
};
const pickApproverAndConfirm = async () => {
  const modal = page.getByRole("dialog").last();
  const combo = modal.getByRole("combobox", { name: "Người duyệt" });
  await combo.waitFor({ timeout: 20000 });
  await combo.click();
  await page.waitForTimeout(1500);
  await shot(page, `approver-${Date.now()}`);
  console.log(
    "approver options:",
    await page.getByRole("option").allInnerTexts(),
  );
  await page
    .getByRole("option", { name: new RegExp(DUYET_EMAIL.split("@")[0]) })
    .first()
    .click();
  await modal.getByRole("button", { name: "Gửi duyệt", exact: true }).click();
};

// ================= J. PR: Lưu nháp + Tạo mới / Cập nhật =================
const prTitle = `${TAG} PR UI`;
await step(
  "J1 drawer tạo PR: Hủy | Lưu nháp | Tạo mới, không có Gửi duyệt",
  async () => {
    const dialog = await openCreatePr();
    const names = await buttonNames(dialog);
    await shot(page, "J1-pr-create");
    check(
      "J1 có Lưu nháp và Tạo mới",
      names.includes("Lưu nháp") && names.includes("Tạo mới"),
      names.join(" | "),
    );
    check("J1 không có Gửi duyệt riêng", !names.includes("Gửi duyệt"));
    await page.keyboard.press("Escape");
  },
);

await step(
  "J2 PR Tạo mới → chọn người duyệt → đúng một PR, đã gửi duyệt",
  async () => {
    const dialog = await openCreatePr();
    await fillPrLine(dialog, prTitle);
    await fillTitle(dialog, prTitle);
    await dialog.getByRole("button", { name: "Tạo mới", exact: true }).click();
    await pickApproverAndConfirm();
    const items = await poll(
      () => listByTitle(tao, `Vật tư ${prTitle}`),
      (v) => v.length > 0,
    );
    await shot(page, "J2-pr-created");
    const all = await api(
      tao,
      "GET",
      `/procurement-requests-garage?page=1&pageSize=50`,
    );
    const mine = (all.data?.items ?? []).filter(
      (r) =>
        (r.title ?? "").includes(prTitle) ||
        (r.lines ?? []).some?.((l) => (l.itemName ?? "").includes(prTitle)),
    );
    const pr = mine[0] ?? items[0];
    check("J2 PR được tạo", Boolean(pr));
    check(
      "J2 PR đã gửi duyệt (không còn DRAFT)",
      pr && pr.status !== "DRAFT",
      pr?.status,
    );
    check(
      "J2 chỉ một PR cho lần Tạo mới",
      mine.length <= 1,
      String(mine.length),
    );
  },
);

let draftPrId = null;
const draftTitle = `${TAG} PR NHAP`;
await step("J3 PR Lưu nháp → mở sửa → Cập nhật gửi duyệt cùng PR", async () => {
  const dialog = await openCreatePr();
  await fillPrLine(dialog, draftTitle);
  await fillTitle(dialog, draftTitle);
  await dialog.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  const found = await poll(
    () => listByTitle(tao, draftTitle),
    (v) => v.length > 0,
  );
  const draft = found.find((r) => r.status === "DRAFT") ?? found[0];
  draftPrId = draft?.id;
  check("J3 Lưu nháp → PR ở DRAFT", draft?.status === "DRAFT", draft?.status);
  await page.waitForTimeout(1000);
  await page.goto(`${WEB}/v2/garage-procurement?tab=requests`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, draft.requestNo);
  check(
    "J3 menu PR nháp không có Gửi duyệt",
    (await menuItem(page, "Gửi duyệt").count()) === 0,
  );
  await menuItem(page, "Chỉnh sửa").click();
  const edit = page.getByRole("dialog").first();
  await edit
    .getByRole("button", { name: "Cập nhật", exact: true })
    .waitFor({ timeout: 20000 });
  await shot(page, "J3-pr-edit");
  await edit.getByRole("button", { name: "Cập nhật", exact: true }).click();
  await pickApproverAndConfirm();
  const after = await poll(
    () => api(tao, "GET", `/procurement-requests-garage/${draftPrId}`),
    (v) => v.data?.status !== "DRAFT",
  );
  check(
    "J3 Cập nhật → cùng PR chuyển sang đã gửi duyệt",
    after.data?.status && after.data.status !== "DRAFT",
    after.data?.status,
  );
  const dup = await listByTitle(tao, draftTitle);
  check("J3 không sinh PR trùng", dup.length === 1, String(dup.length));
});

// ================= K. PO: Tạo mới từ PR không còn 409 =================
let kPr = null;
await step(
  "K1 PO Tạo mới từ PR (NCC gõ tay) → APPROVED, PR được đặt, không 409",
  async () => {
    const created = await api(tao, "POST", "/procurement-requests-garage", {
      requestDate: TODAY,
      title: `${TAG} PR cho PO`,
      lines: [
        {
          lineType: "GOODS",
          itemCode: `${TAG}-SKU`,
          itemName: `Vật tư ${TAG} PO`,
          qtyRequested: 3,
          estUnitPrice: 100,
        },
      ],
    });
    kPr = created.data;
    await api(tao, "POST", `/procurement-requests-garage/${kPr.id}/submit`, {
      approverId: duyet.user.id,
    });
    await api(
      duyet,
      "POST",
      `/procurement-requests-garage/${kPr.id}/approve`,
      {},
    );
    kPr = (await api(tao, "GET", `/procurement-requests-garage/${kPr.id}`))
      .data;
    await page.goto(`${WEB}/v2/garage-procurement?tab=requests`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, kPr.requestNo);
    await menuItem(page, "Lập đơn mua từ đề nghị này").click();
    const dialog = page.getByRole("dialog").first();
    await dialog
      .getByRole("button", { name: "Lưu nháp", exact: true })
      .waitFor({ timeout: 30000 });
    // Khóa duyệt PO tải bất đồng bộ nên nút Tạo mới hiện sau Lưu nháp
    await dialog
      .getByRole("button", { name: "Tạo mới", exact: true })
      .waitFor({ timeout: 20000 })
      .catch(() => {});
    await shot(page, "K1-po-drawer");
    const names = await buttonNames(dialog);
    check(
      "K1 drawer PO có Lưu nháp và Tạo mới",
      names.includes("Lưu nháp") && names.includes("Tạo mới"),
      names.join(" | "),
    );
    const supplier = dialog.getByPlaceholder("Nhập tên NCC hoặc chọn hóa đơn");
    await supplier.waitFor({ timeout: 45000 }).catch(async (e) => {
      await shot(page, "K1-po-supplier-missing");
      throw e;
    });
    await supplier.fill(`NCC gõ tay ${TAG}`);
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/procurement-orders-garage") &&
          r.request().method() !== "GET",
        { timeout: 30000 },
      ),
      dialog.getByRole("button", { name: "Tạo mới", exact: true }).click(),
    ]);
    await shot(page, "K1-po-created");
    check(
      "K1 gọi endpoint save-and-confirm một request",
      resp.url().includes("save-and-confirm"),
      resp.url(),
    );
    check("K1 không còn 409", resp.status() !== 409, String(resp.status()));
    const body = await resp.json().catch(() => ({}));
    check(
      "K1 PO ghi nhận (không DRAFT)",
      body.status && body.status !== "DRAFT",
      body.status,
    );
    const prAfter = (
      await api(tao, "GET", `/procurement-requests-garage/${kPr.id}`)
    ).data;
    check(
      "K1 PR được đặt đủ",
      prAfter.orderingStatus === "FULL",
      prAfter.orderingStatus,
    );
    const orders =
      (
        await api(
          tao,
          "GET",
          `/procurement-orders-garage?search=${encodeURIComponent(`NCC gõ tay ${TAG}`)}&page=1`,
        )
      ).data?.items ?? [];
    check(
      "K1 chỉ một PO cho lần Tạo mới",
      orders.length <= 1,
      String(orders.length),
    );
    globalThis.kPo = body;
  },
);

// ================= L. Phiếu nhập: Nhập kho + Hoàn nhập =================
await step(
  "L1 phiếu nhập từ PO: Lưu nháp + Nhập kho → POSTED một bước",
  async () => {
    const po = globalThis.kPo;
    await api(duyet, "POST", `/procurement-orders-garage/${po.id}/issue`, {});
    await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, po.orderNo);
    await menuItem(page, "Nhập kho").click();
    const dialog = page.getByRole("dialog").first();
    await dialog
      .getByRole("button", { name: "Lưu nháp", exact: true })
      .waitFor({ timeout: 30000 });
    const names = await buttonNames(dialog);
    check(
      "L1 drawer phiếu nhập có Lưu nháp và Nhập kho",
      names.includes("Lưu nháp") && names.includes("Nhập kho"),
      names.join(" | "),
    );
    await shot(page, "L1-receipt-create");
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/garage-goods-receipts") &&
          r.request().method() !== "GET",
        { timeout: 30000 },
      ),
      dialog.getByRole("button", { name: "Nhập kho", exact: true }).click(),
    ]);
    check(
      "L1 gọi save-and-post một request",
      resp.url().includes("save-and-post"),
      resp.url(),
    );
    const rec = (await resp.json()).data;
    check("L1 phiếu POSTED ngay", rec?.status === "POSTED", rec?.status);
    const poAfter = (
      await api(tao, "GET", `/procurement-orders-garage/${po.id}`)
    ).data;
    check(
      "L1 PO nhận đủ",
      poAfter?.fulfillmentStatus === "FULL",
      poAfter?.fulfillmentStatus,
    );
    globalThis.kReceipt = rec;
  },
);

await step(
  "L2 phiếu đã nhập kho: chỉ có Hoàn nhập (không Hủy phiếu), xác nhận → CANCELLED",
  async () => {
    const rec = globalThis.kReceipt;
    await page.goto(`${WEB}/v2/garage-goods-receipts?receipt=${rec.id}`, {
      waitUntil: "domcontentloaded",
    });
    const dialog = page.getByRole("dialog").first();
    await dialog
      .getByRole("button", { name: "Hoàn nhập", exact: true })
      .waitFor({ timeout: 30000 });
    const names = await buttonNames(dialog);
    await shot(page, "L2-receipt-posted");
    check("L2 có Hoàn nhập", names.includes("Hoàn nhập"), names.join(" | "));
    check(
      "L2 không còn Hủy phiếu / Nhập kho",
      !names.includes("Hủy phiếu") && !names.includes("Nhập kho"),
    );
    check(
      "L2 Hoàn nhập bật khi hàng chưa dùng",
      await dialog
        .getByRole("button", { name: "Hoàn nhập", exact: true })
        .isEnabled(),
    );
    await dialog
      .getByRole("button", { name: "Hoàn nhập", exact: true })
      .click();
    const confirm = page.getByRole("dialog").last();
    await confirm.getByText("Hoàn nhập phiếu?").waitFor({ timeout: 10000 });
    await shot(page, "L2-reverse-confirm");
    await confirm
      .getByRole("button", { name: "Hoàn nhập", exact: true })
      .click();
    const after = await poll(
      () => api(tao, "GET", `/api/v1/garage-goods-receipts/${rec.id}`),
      (v) => (v.data?.data ?? v.data)?.status === "CANCELLED",
    );
    check(
      "L2 phiếu CANCELLED sau hoàn nhập",
      (after.data?.data ?? after.data)?.status === "CANCELLED",
    );
    const po = (
      await api(tao, "GET", `/procurement-orders-garage/${globalThis.kPo.id}`)
    ).data;
    check(
      "L2 PO về chưa nhận",
      po?.fulfillmentStatus === "NONE",
      po?.fulfillmentStatus,
    );
  },
);

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
for (const f of failed) console.log("  ✗", f.step, f.detail);
process.exit(failed.length ? 1 : 0);
