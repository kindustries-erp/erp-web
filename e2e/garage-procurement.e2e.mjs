// E2E Garage Procurement (PR/PO): tạo, duyệt, từ chối, nhân bản, UI menu & drawer.
// Cấu hình qua biến môi trường (xem erp-web/.agents/skills/erp-e2e-playwright/SKILL.md):
//   E2E_WEB_URL      (mặc định http://127.0.0.1:5173)
//   E2E_API_URL      (mặc định http://localhost:10003)
//   E2E_PASSWORD     (BẮT BUỘC, mật khẩu tài khoản test; không hardcode)
//   E2E_TAO_EMAIL    (mặc định ai-test-tao@example.com, người tạo)
//   E2E_DUYET_EMAIL  (mặc định ai-test-duyet@example.com, người duyệt)
//   E2E_CHROME_PATH  (mặc định /usr/bin/google-chrome)
// Chạy: bun run e2e:garage-procurement
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
const TAG = `E2E-${Date.now()}`;
const TODAY = new Date().toISOString().slice(0, 10);
const results = [];
const check = (step, pass, detail = "") => {
  results.push({ step, pass: !!pass, detail: String(detail).slice(0, 120) });
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${step}${detail ? " — " + String(detail).slice(0, 120) : ""}`,
  );
};

// ---------- API helpers (dựng dữ liệu nền) ----------
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
  const r = await fetch(`${API}/api/v2${path}`, {
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

// ---------- UI helpers ----------
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
async function openRowMenu(page, text) {
  const row = page.locator("tr", { hasText: text }).first();
  await row.waitFor({ timeout: 20000 });
  await row.click({ button: "right" });
  await page.getByRole("menu").first().waitFor({ timeout: 10000 });
}
async function waitTable(page) {
  for (let i = 0; i < 2; i++) {
    try {
      await page.locator("table").first().waitFor({ timeout: 15000 });
      return;
    } catch (e) {
      if (i === 1) {
        await shot(page, `fail-table-${Date.now()}`);
        throw e;
      }
      await page.reload({ waitUntil: "domcontentloaded" });
    }
  }
}
const menuItem = (page, name) =>
  page.getByRole("menuitem", { name, exact: true });
async function shot(page, name) {
  await page
    .screenshot({ path: `${SHOTS}${name}.png`, fullPage: false })
    .catch(() => {});
}
async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(`${name} (exception)`, false, e.message);
  }
}

// ---------- Dựng dữ liệu nền qua API ----------
const tao = await apiLogin(TAO_EMAIL);
const duyet = await apiLogin(DUYET_EMAIL);
const SUPPLIER = "02c760ca-2a7c-454b-9c52-28712653062b";

const mkPr = async (title) => {
  const r = await api(tao, "POST", "/procurement-requests-garage", {
    requestDate: TODAY,
    title,
    lines: [
      {
        lineType: "GOODS",
        itemName: `Vật tư ${title}`,
        qtyRequested: 2,
        estUnitPrice: 100,
      },
    ],
  });
  return r.data.id;
};
const prDraft = await mkPr(`${TAG} PR nháp`);
const prRejected = await mkPr(`${TAG} PR bị từ chối`);
await api(tao, "POST", `/procurement-requests-garage/${prRejected}/submit`, {
  approverId: duyet.user.id,
});
await api(duyet, "POST", `/procurement-requests-garage/${prRejected}/reject`, {
  reason: "Thiếu báo giá",
});
const prApproved = await mkPr(`${TAG} PR đã duyệt`);
await api(tao, "POST", `/procurement-requests-garage/${prApproved}/submit`, {
  approverId: duyet.user.id,
});
await api(
  duyet,
  "POST",
  `/procurement-requests-garage/${prApproved}/approve`,
  {},
);
const prApprovedDetail = (
  await api(tao, "GET", `/procurement-requests-garage/${prApproved}`)
).data;
const prNos = {
  draft: (await api(tao, "GET", `/procurement-requests-garage/${prDraft}`)).data
    .requestNo,
  rejected: (
    await api(tao, "GET", `/procurement-requests-garage/${prRejected}`)
  ).data.requestNo,
  approved: prApprovedDetail.requestNo,
};
console.log("Dữ liệu nền:", prNos);

// PO nháp có NCC (để kiểm tra nút Tạo mới/Cập nhật)
const poDraftRes = await api(tao, "POST", "/procurement-orders-garage", {
  orderDate: TODAY,
  supplierId: SUPPLIER,
  supplierName: "NCC E2E",
  lines: [
    {
      lineType: "GOODS",
      itemCode: `E2E-NHAP-${TAG}`.slice(0, 40),
      itemName: `Đơn nháp ${TAG}`,
      qtyOrdered: 1,
      unitPrice: 50,
    },
  ],
});
const poDraftId = poDraftRes.data.id;
const poDraftNo = poDraftRes.data.orderNo;

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

// ================= A. Người tạo: danh sách PR và menu theo trạng thái =================
await step("A0 đăng nhập người tạo", async () => {
  await login(page, TAO_EMAIL);
  check("A0 đăng nhập người tạo", true);
});

await step("A1 menu PR bị từ chối", async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, prNos.rejected);
  await shot(page, "A1-menu-pr-rejected");
  check(
    "A1 có Xem chi tiết (bật)",
    await menuItem(page, "Xem chi tiết").isEnabled(),
  );
  const nhanBan = menuItem(page, "Nhân bản");
  check(
    "A1 có Nhân bản (bật)",
    (await nhanBan.count()) === 1 && (await nhanBan.isEnabled()),
  );
  const edit = menuItem(page, "Chỉnh sửa");
  check(
    "A1 Chỉnh sửa bị mờ",
    (await edit.count()) === 1 && !(await edit.isEnabled()),
  );
  check(
    "A1 không có Gửi duyệt / Duyệt / Từ chối",
    (await page
      .getByRole("menuitem", {
        name: /^(Gửi duyệt|Duyệt|Từ chối|Thu hồi|Hủy)$/,
      })
      .count()) === 0,
  );
  await page.keyboard.press("Escape");
});

await step("A2 menu PR nháp", async () => {
  await openRowMenu(page, prNos.draft);
  await shot(page, "A2-menu-pr-draft");
  check(
    "A2 PR nháp có Chỉnh sửa (bật)",
    await menuItem(page, "Chỉnh sửa").isEnabled(),
  );
  // PR nháp gửi duyệt qua "Tạo mới / Cập nhật" trong drawer, không còn "Gửi duyệt" riêng ở menu dòng
  check(
    "A2 PR nháp không còn Gửi duyệt riêng",
    (await menuItem(page, "Gửi duyệt").count()) === 0,
  );
  check(
    "A2 PR nháp không có Nhân bản",
    (await menuItem(page, "Nhân bản").count()) === 0,
  );
  await page.keyboard.press("Escape");
});

await step("A3 Nhân bản PR từ phiếu bị từ chối", async () => {
  await openRowMenu(page, prNos.rejected);
  await menuItem(page, "Nhân bản").click();
  // Drawer chỉnh sửa của bản nháp mới
  await page
    .getByText("Sửa đề nghị mua", { exact: false })
    .first()
    .waitFor({ timeout: 20000 });
  await shot(page, "A3-clone-pr-drawer");
  check("A3 drawer sửa mở cho bản nháp mới", true);
  check(
    "A3 nút Lưu nháp hiển thị",
    (await page.getByRole("button", { name: /lưu nháp/i }).count()) > 0,
  );
  await page
    .getByRole("button", { name: "Hủy" })
    .first()
    .click()
    .catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
});

await step("A4 PR đã duyệt → menu Lập đơn mua bật", async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, prNos.approved);
  const item = menuItem(page, "Lập đơn mua từ đề nghị này");
  check(
    "A4 Lập đơn mua bật cho PR đã duyệt",
    (await item.count()) === 1 && (await item.isEnabled()),
  );
  await page.keyboard.press("Escape");
});

// Lập PO qua API để PR đủ hàng → menu PR phải mờ + tooltip
const poFromPr = await api(tao, "POST", "/procurement-orders-garage", {
  orderDate: TODAY,
  requestId: prApproved,
  supplierId: SUPPLIER,
  supplierName: "NCC E2E",
  lines: prApprovedDetail.lines.map((l) => ({
    lineType: l.lineType,
    itemName: l.itemName,
    qtyOrdered: Number(l.qtyRequested),
    unitPrice: Number(l.estUnitPrice ?? 0),
    requestLineId: l.id,
  })),
});
check("A4b lập PO từ PR (API seed)", poFromPr.status === 201, poFromPr.status);

await step("A5 PR đã đủ PO → Lập đơn mua mờ + tooltip", async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, prNos.approved);
  const item = menuItem(page, "Lập đơn mua từ đề nghị này");
  await shot(page, "A5-pr-fully-ordered");
  check(
    "A5 Lập đơn mua mờ khi đã đủ PO",
    (await item.count()) === 1 && !(await item.isEnabled()),
  );
  await item
    .locator("xpath=..")
    .hover({ force: true })
    .catch(() => {});
  await page.waitForTimeout(1500);
  const tip = page.getByText("Đề nghị đã được lập đủ đơn mua", {
    exact: false,
  });
  check("A5 tooltip giải thích lý do", (await tip.count()) > 0);
  await page.keyboard.press("Escape");
});

// ================= B. PO: nút Tạo mới/Cập nhật khi duyệt tắt =================
await step("B1 PO nháp: menu không có Gửi duyệt", async () => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, poDraftNo);
  await shot(page, "B1-po-draft-menu");
  check(
    "B1 PO nháp không có Gửi duyệt (duyệt PO đang tắt)",
    (await menuItem(page, "Gửi duyệt").count()) === 0,
  );
  check(
    "B1 PO nháp có Chỉnh sửa",
    (await menuItem(page, "Chỉnh sửa").count()) === 1,
  );
  await page.keyboard.press("Escape");
});

await step("B2 PO nháp: mở sửa → có Cập nhật cạnh Lưu nháp", async () => {
  await openRowMenu(page, poDraftNo);
  await menuItem(page, "Chỉnh sửa").click();
  await page
    .getByRole("button", { name: "Cập nhật", exact: true })
    .waitFor({ timeout: 20000 });
  await shot(page, "B2-po-edit-drawer");
  check("B2 nút Cập nhật hiển thị", true);
  check(
    "B2 nút Lưu nháp vẫn có",
    (await page.getByRole("button", { name: /lưu nháp/i }).count()) > 0,
  );
  await page.getByRole("button", { name: "Cập nhật", exact: true }).click();
  let after = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    after = await api(tao, "GET", `/procurement-orders-garage/${poDraftId}`);
    if (after.data?.status === "APPROVED") break;
  }
  check(
    "B2 Cập nhật → PO chuyển APPROVED (duyệt tắt)",
    after.data?.status === "APPROVED",
    after.data?.status,
  );
  await shot(page, "B2-after-update");
});

// ================= C. PO hủy → nhân bản =================
const poToCancel = (
  await api(tao, "POST", "/procurement-orders-garage", {
    orderDate: TODAY,
    supplierId: SUPPLIER,
    supplierName: "NCC E2E",
    lines: [
      {
        lineType: "GOODS",
        itemName: `Đơn hủy ${TAG}`,
        qtyOrdered: 1,
        unitPrice: 10,
      },
    ],
  })
).data;
await api(
  tao,
  "POST",
  `/procurement-orders-garage/${poToCancel.id}/submit`,
  {},
);

await step("C1 hủy PO bằng modal lý do", async () => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, poToCancel.orderNo);
  await menuItem(page, "Hủy").click();
  const reason = page.getByRole("textbox").first();
  await reason.waitFor({ timeout: 10000 });
  await reason.fill("Nhập nhầm NCC");
  await page
    .getByRole("button", { name: /xác nhận|đồng ý|hủy phiếu|lưu/i })
    .last()
    .click();
  await page.waitForTimeout(3000);
  const d = (
    await api(tao, "GET", `/procurement-orders-garage/${poToCancel.id}`)
  ).data;
  check("C1 PO đã hủy (CANCELLED)", d?.status === "CANCELLED", d?.status);
  await shot(page, "C1-po-cancelled");
});

await step("C2 nhân bản PO đã hủy từ menu", async () => {
  await openRowMenu(page, poToCancel.orderNo);
  check(
    "C2 menu PO hủy có Nhân bản",
    (await menuItem(page, "Nhân bản").count()) === 1,
  );
  await menuItem(page, "Nhân bản").click();
  await page
    .getByRole("button", { name: "Cập nhật", exact: true })
    .waitFor({ timeout: 20000 });
  await shot(page, "C2-clone-po-drawer");
  check("C2 drawer PO nháp mới mở ra để sửa", true);
  await page
    .getByRole("button", { name: "Hủy" })
    .first()
    .click()
    .catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
});

// ================= D. Quyền và lọc trạng thái =================
await step("D1 bộ lọc trạng thái có Từ chối", async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  const filter = page.getByRole("button", { name: /lọc|filter/i }).first();
  if (await filter.count()) await filter.click().catch(() => {});
  await shot(page, "D1-filter");
  check(
    "D1 (ghi nhận) trang danh sách tải được",
    (await page.locator("table").count()) > 0,
  );
});

// ================= E. Bảng dòng hàng không xuống dòng + Nhập kho từ đơn mua =================
await step("E1 drawer PR: header bảng dòng hàng không xuống dòng", async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, prNos.draft);
  await menuItem(page, "Xem chi tiết").click();
  const lines = page.locator('table[aria-label="Dòng hàng"]');
  await lines.waitFor({ timeout: 20000 });
  const heights = await lines
    .locator("th")
    .evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().height)),
    );
  await shot(page, "E1-pr-lines-table");
  check(
    "E1 header bảng dòng hàng một dòng (cao < 40px)",
    heights.length > 0 && Math.max(...heights) < 40,
    heights.join(","),
  );
  const scrollable = await lines.evaluate((t) =>
    getComputedStyle(t.parentElement).overflow.includes("auto"),
  );
  check("E1 vùng bảng cuộn được (overflow auto)", scrollable);
  await page.keyboard.press("Escape");
});

const suffix = Date.now();
const poIssued = (
  await api(tao, "POST", "/procurement-orders-garage", {
    orderDate: TODAY,
    supplierId: SUPPLIER,
    supplierName: "NCC E2E",
    lines: [
      {
        lineType: "GOODS",
        itemCode: `E2E-A-${suffix}`,
        itemName: `Nhập kho A ${TAG}`,
        qtyOrdered: 5,
        unitPrice: 100,
      },
      {
        lineType: "GOODS",
        itemCode: `E2E-B-${suffix}`,
        itemName: `Nhập kho B ${TAG}`,
        qtyOrdered: 3,
        unitPrice: 50,
      },
    ],
  })
).data;
await api(tao, "POST", `/procurement-orders-garage/${poIssued.id}/submit`, {});
const issueRes = await api(
  tao,
  "POST",
  `/procurement-orders-garage/${poIssued.id}/issue`,
  {},
);
check(
  "E2 phát hành PO (API seed)",
  issueRes.status === 201 || issueRes.status === 200,
  issueRes.status,
);
const hasInputValue = (value) =>
  page.evaluate(
    (v) => [...document.querySelectorAll("input")].some((i) => i.value === v),
    value,
  );

await step(
  "E2 menu PO: Nhập kho bật khi đã phát hành, mờ khi chưa",
  async () => {
    await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, poIssued.orderNo);
    const on = menuItem(page, "Nhập kho");
    check(
      "E2 Nhập kho bật cho PO đã phát hành",
      (await on.count()) === 1 && (await on.isEnabled()),
    );
    await page.keyboard.press("Escape");
    await openRowMenu(page, poDraftNo); // PO này ở trạng thái APPROVED (chưa phát hành)
    const off = menuItem(page, "Nhập kho");
    check(
      "E2 Nhập kho mờ khi chưa phát hành",
      (await off.count()) === 1 && !(await off.isEnabled()),
    );
    const issue = menuItem(page, "Phát hành");
    await issue.hover().catch(() => {});
    await page.waitForTimeout(1200);
    check(
      "E2 tooltip giải thích Phát hành",
      (await page.getByText("Chốt đơn đã duyệt", { exact: false }).count()) > 0,
    );
    await page.keyboard.press("Escape");
  },
);

await step("E3 drawer PO đã phát hành có nút Nhập kho", async () => {
  await openRowMenu(page, poIssued.orderNo);
  await menuItem(page, "Xem chi tiết").click();
  const btn = page.getByRole("button", { name: "Nhập kho", exact: true });
  await page.waitForTimeout(3000);
  await shot(page, "E3-po-drawer-receive");
  await btn.waitFor({ timeout: 20000 });
  check("E3 nút Nhập kho trong drawer bật", await btn.isEnabled());
  await page.keyboard.press("Escape");
});

let grRecord = null;
await step(
  "E4 Nhập kho từ PO → phiếu điền sẵn → lưu có liên kết PO",
  async () => {
    await openRowMenu(page, poIssued.orderNo);
    await menuItem(page, "Nhập kho").click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("input")].some((i) =>
          i.value.startsWith("Nhập kho A"),
        ),
      null,
      { timeout: 30000 },
    );
    await shot(page, "E4-receipt-prefilled");
    check(
      "E4 đúng trang nhập kho",
      page.url().includes("garage-goods-receipts"),
      page.url(),
    );
    check("E4 dòng A điền sẵn", await hasInputValue(`Nhập kho A ${TAG}`));
    check("E4 dòng B điền sẵn", await hasInputValue(`Nhập kho B ${TAG}`));
    check(
      "E4 NCC điền sẵn theo đơn mua (chữ chỉ đọc, không phải ô nhập)",
      (await page.getByText("NCC E2E", { exact: true }).count()) > 0 &&
        !(await hasInputValue("NCC E2E")),
    );
    check(
      "E4 tham số fromOrder đã được xóa khỏi URL",
      !page.url().includes("fromOrder"),
      page.url(),
    );
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/v2/garage-goods-receipts") &&
          r.request().method() === "POST",
        { timeout: 30000 },
      ),
      page
        .getByRole("button", { name: /lưu nháp/i })
        .first()
        .click(),
    ]);
    grRecord = (await resp.json()).data;
    check(
      "E4 phiếu lưu garageProcurementOrderId",
      grRecord?.garageProcurementOrderId === poIssued.id,
      grRecord?.garageProcurementOrderId,
    );
    check(
      "E4 2 dòng phiếu gắn dòng PO",
      grRecord?.lines?.length === 2 &&
        grRecord.lines.every((l) => l.procurementOrderLineId),
      grRecord?.lines?.length,
    );
  },
);

await step("E5 ghi sổ phiếu → PO nhận đủ và tự đóng", async () => {
  const post = await fetch(
    `${API}/api/v2/garage-goods-receipts/${grRecord.id}/post`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tao.token}`,
        "Content-Type": "application/json",
      },
    },
  );
  check(
    "E5 ghi sổ phiếu nhập",
    post.status === 201 || post.status === 200,
    post.status,
  );
  const po = (
    await api(tao, "GET", `/procurement-orders-garage/${poIssued.id}`)
  ).data;
  check(
    "E5 PO nhận đủ (FULL)",
    po?.fulfillmentStatus === "FULL",
    po?.fulfillmentStatus,
  );
  check("E5 PO tự chuyển CLOSED", po?.status === "CLOSED", po?.status);
  await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, poIssued.orderNo);
  const off = menuItem(page, "Nhập kho");
  check(
    "E5 Nhập kho mờ sau khi nhận đủ",
    (await off.count()) === 1 && !(await off.isEnabled()),
  );
  await shot(page, "E5-po-closed-menu");
  await page.keyboard.press("Escape");
});

// ================= F. Drawer đơn Garage: thứ tự field + combobox số hóa đơn =================
const poEdit = (
  await api(tao, "POST", "/procurement-orders-garage", {
    orderDate: TODAY,
    supplierId: SUPPLIER,
    supplierName: "NCC E2E",
    lines: [
      {
        lineType: "GOODS",
        itemCode: `E2E-F-${suffix}`,
        itemName: `Sửa đơn F ${TAG}`,
        qtyOrdered: 1,
        unitPrice: 10,
      },
    ],
  })
).data;
await step(
  "F1 drawer sửa: thứ tự field và ô số hóa đơn là combobox",
  async () => {
    await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, poEdit.orderNo);
    await menuItem(page, "Chỉnh sửa").click();
    const invoice = page.getByRole("combobox", { name: "Số hóa đơn NCC" });
    await invoice.waitFor({ timeout: 20000 });
    await shot(page, "F1-edit-order-fields");
    const order = await page.evaluate(() => {
      const norm = (e) =>
        (e.textContent ?? "").replace(/\*/g, "").replace(/\s+/g, " ").trim();
      const deepest = (txt, root) => {
        const c = [...root.querySelectorAll("*")].filter(
          (e) => norm(e) === txt,
        );
        return c.find((x) => !c.some((o) => o !== x && x.contains(o))) ?? null;
      };
      const title = deepest("Thông tin đơn", document.body);
      let root = title;
      while (
        root &&
        !(
          root.textContent.includes("Ghi chú") &&
          root.textContent.includes("Chi nhánh")
        )
      )
        root = root.parentElement;
      if (!root) return [];
      const labels = [
        "Ngày đơn",
        "Số hóa đơn NCC",
        "Nhà cung cấp",
        "Chi nhánh",
        "Ghi chú",
      ];
      return labels.map((l) => {
        const el = deepest(l, root);
        if (!el) return -1;
        const r = el.getBoundingClientRect();
        return Math.round(r.top) * 10000 + Math.round(r.left);
      });
    });
    const sorted =
      order.length === 5 &&
      order.every((v, i) => v >= 0 && (i === 0 || order[i - 1] <= v));
    check(
      "F1 nhãn đúng thứ tự: ngày → hóa đơn → NCC → chi nhánh → ghi chú",
      sorted,
      JSON.stringify(order),
    );
    await invoice.click();
    await page.waitForTimeout(1500);
    const optionCount = await page.getByRole("option").count();
    console.log(
      `INFO F1 số option hóa đơn mua vào trên staging: ${optionCount}`,
    );
    await page.keyboard.press("Escape");
    check("F1 combobox hóa đơn mở được", true);
    await page.keyboard.press("Escape");
  },
);

// ================= G. Hóa đơn → NCC phụ thuộc, lưu số hóa đơn lúc tạo, nhập hàng nhiều đợt =================
const poInvApi = await api(tao, "POST", "/procurement-orders-garage", {
  orderDate: TODAY,
  supplierInvoiceNo: `HD-E2E-${suffix}`,
  lines: [
    {
      lineType: "GOODS",
      itemCode: `E2E-G0-${suffix}`,
      itemName: `Tạo kèm hóa đơn ${TAG}`,
      qtyOrdered: 1,
      unitPrice: 10,
    },
  ],
});
check(
  "G0 API tạo đơn nhận supplierInvoiceNo",
  poInvApi.status === 201 &&
    poInvApi.data?.supplierInvoiceNo === `HD-E2E-${suffix}`,
  `${poInvApi.status} ${poInvApi.data?.supplierInvoiceNo}`,
);

let pickedInvoice = "";
await step(
  "G1 tạo đơn: hóa đơn/NCC khác hàng, NCC chỉ đọc theo hóa đơn, lưu số hóa đơn lúc tạo",
  async () => {
    await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await page
      .getByRole("button", { name: "Tạo đơn mua", exact: true })
      .first()
      .click();
    const invoice = page.getByRole("combobox", { name: "Số hóa đơn NCC" });
    await invoice.waitFor({ timeout: 20000 });
    const supplierBox = page.getByPlaceholder("Nhập tên NCC hoặc chọn hóa đơn");
    check(
      "G1 NCC gõ tự do được (ô văn bản, có gợi ý nhập tên hoặc chọn hóa đơn)",
      (await supplierBox.count()) === 1,
    );
    check(
      "G1 không còn ô chọn NCC riêng",
      (await page.getByRole("combobox", { name: "Nhà cung cấp" }).count()) ===
        0,
    );
    const rows = await page.evaluate(() => {
      const top = (txt) => {
        const root = document.querySelector('[role="dialog"]') ?? document;
        const c = [...root.querySelectorAll("*")].filter(
          (e) => (e.textContent ?? "").replace(/\*/g, "").trim() === txt,
        );
        const el = c.find((x) => !c.some((o) => o !== x && x.contains(o)));
        return el ? Math.round(el.getBoundingClientRect().top) : -1;
      };
      return { invoice: top("Số hóa đơn NCC"), supplier: top("Nhà cung cấp") };
    });
    check(
      "G1 số hóa đơn và NCC ở hai hàng khác nhau",
      rows.invoice > 0 && rows.supplier > rows.invoice,
      JSON.stringify(rows),
    );

    await invoice.click();
    const options = page.getByRole("option");
    await options.first().waitFor({ timeout: 20000 });
    pickedInvoice = (
      (await options.first().innerText()).split("\n")[0] ?? ""
    ).trim();
    await options.first().click();
    await page.waitForTimeout(1500);
    check(
      "G1 chọn hóa đơn thì NCC tự điền theo hóa đơn",
      (await supplierBox.inputValue()).trim().length > 0,
    );
    const filledSupplier = await supplierBox.inputValue();
    await shot(page, "G1-invoice-picked");
    await page.getByRole("button", { name: "Bỏ lựa chọn" }).first().click();
    await page.waitForTimeout(500);
    check(
      "G1 bỏ hóa đơn thì NCC giữ nguyên (chỉ xóa số hóa đơn)",
      (await supplierBox.inputValue()) === filledSupplier,
    );
    await supplierBox.fill(`${filledSupplier} đổi`);
    await invoice.click();
    await options.first().waitFor({ timeout: 20000 });
    await options.first().click();
    await page.waitForTimeout(1500);
    await supplierBox.fill(`NCC gõ tay ${TAG}`);
    await page.waitForTimeout(500);
    check(
      "G1 đổi NCC thì hóa đơn tự reset",
      !(await invoice.innerText()).includes(pickedInvoice),
    );
    await invoice.click();
    await options.first().waitFor({ timeout: 20000 });
    await options.first().click();
    await page.waitForTimeout(1500);

    await page
      .getByRole("textbox", { name: "Mã", exact: true })
      .fill(`E2E-G1-${suffix}`);
    await page
      .getByRole("textbox", { name: "Tên", exact: true })
      .fill(`Tạo từ UI ${TAG}`);
    await page.getByLabel("Đơn giá", { exact: true }).fill("10");
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/v2/procurement-orders-garage") &&
          r.request().method() === "POST",
        { timeout: 30000 },
      ),
      page
        .getByRole("button", { name: /lưu nháp/i })
        .first()
        .click(),
    ]);
    const created = await resp.json();
    check(
      "G1 đơn tạo từ UI lưu số hóa đơn",
      Boolean(created?.supplierInvoiceNo) &&
        created.supplierInvoiceNo === pickedInvoice,
      `${created?.supplierInvoiceNo} / ${pickedInvoice}`,
    );
    check(
      "G1 đơn tạo từ UI lưu tên NCC theo hóa đơn",
      Boolean(created?.supplierName),
      created?.supplierName,
    );
  },
);

// --- Nhập hàng nhiều đợt: đơn 2 dòng (A=5, B=3), đợt 1 nhận A=2 và B=3, đợt 2 nhận nốt A=3
const poBatch = (
  await api(tao, "POST", "/procurement-orders-garage", {
    orderDate: TODAY,
    supplierId: SUPPLIER,
    supplierName: "NCC E2E",
    lines: [
      {
        lineType: "GOODS",
        itemCode: `E2E-GA-${suffix}`,
        itemName: `Đợt A ${TAG}`,
        qtyOrdered: 5,
        unitPrice: 100,
      },
      {
        lineType: "GOODS",
        itemCode: `E2E-GB-${suffix}`,
        itemName: `Đợt B ${TAG}`,
        qtyOrdered: 3,
        unitPrice: 50,
      },
    ],
  })
).data;
await api(tao, "POST", `/procurement-orders-garage/${poBatch.id}/submit`, {});
await api(tao, "POST", `/procurement-orders-garage/${poBatch.id}/issue`, {});

const saveReceipt = async () => {
  const [resp] = await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes("/api/v2/garage-goods-receipts") &&
        r.request().method() === "POST",
      { timeout: 30000 },
    ),
    page
      .getByRole("button", { name: /lưu nháp/i })
      .first()
      .click(),
  ]);
  return (await resp.json()).data;
};
const postReceipt = (id) =>
  fetch(`${API}/api/v2/garage-goods-receipts/${id}/post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tao.token}`,
      "Content-Type": "application/json",
    },
  });
const qtyInput = (n) =>
  page.locator('[role="dialog"] table tbody tr').nth(n).locator("input").nth(3);

let receipt1 = null;
await step(
  "G2 đợt 1: nhận A=2, B=3 → đơn nhận một phần, vẫn nhập kho được",
  async () => {
    await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, poBatch.orderNo);
    await menuItem(page, "Nhập kho").click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("input")].some((i) =>
          i.value.startsWith("Đợt A"),
        ),
      null,
      { timeout: 30000 },
    );
    await qtyInput(0).fill("2");
    await qtyInput(0).blur();
    await shot(page, "G2-receipt-batch1");
    receipt1 = await saveReceipt();
    check(
      "G2 phiếu đợt 1 lưu 2 dòng gắn đơn",
      receipt1?.lines?.length === 2 &&
        receipt1.garageProcurementOrderId === poBatch.id,
      receipt1?.lines?.length,
    );
    const post = await postReceipt(receipt1.id);
    check(
      "G2 ghi sổ phiếu đợt 1",
      post.status === 201 || post.status === 200,
      post.status,
    );
    const po = (
      await api(tao, "GET", `/procurement-orders-garage/${poBatch.id}`)
    ).data;
    check(
      "G2 đơn nhận một phần (PARTIAL)",
      po?.fulfillmentStatus === "PARTIAL",
      po?.fulfillmentStatus,
    );
    check(
      "G2 đơn vẫn ở trạng thái đã phát hành",
      po?.status === "ISSUED",
      po?.status,
    );
  },
);

await step(
  "G3 drawer đơn: cột Đã nhận/Còn lại và lịch sử nhập kho",
  async () => {
    await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, poBatch.orderNo);
    await menuItem(page, "Xem chi tiết").click();
    await page
      .getByText("Lịch sử nhập kho", { exact: true })
      .waitFor({ timeout: 20000 });
    await page.waitForTimeout(1500);
    await shot(page, "G3-po-drawer-history");
    check(
      "G3 có cột Đã nhận",
      (await page.getByText("Đã nhận", { exact: true }).count()) > 0,
    );
    check(
      "G3 có cột Còn lại",
      (await page.getByText("Còn lại", { exact: true }).count()) > 0,
    );
    check(
      "G3 lịch sử có phiếu đợt 1",
      (await page.getByText(receipt1.receiptNo, { exact: true }).count()) > 0,
      receipt1.receiptNo,
    );
    const btn = page.getByRole("button", { name: "Nhập kho", exact: true });
    check(
      "G3 nút Nhập kho vẫn bật khi còn hàng chưa nhận",
      (await btn.count()) === 1 && (await btn.isEnabled()),
    );
  },
);

let receipt2 = null;
await step(
  "G4 đợt 2: phiếu điền sẵn phần còn lại, chặn nhận quá, ghi sổ → đơn nhận đủ",
  async () => {
    await page.getByRole("button", { name: "Nhập kho", exact: true }).click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("input")].some((i) =>
          i.value.startsWith("Đợt A"),
        ),
      null,
      { timeout: 30000 },
    );
    await page.waitForTimeout(500);
    const hasB = await page.evaluate(() =>
      [...document.querySelectorAll("input")].some((i) =>
        i.value.startsWith("Đợt B"),
      ),
    );
    check("G4 chỉ còn dòng A (dòng B đã nhận đủ)", !hasB);
    check(
      "G4 số nhận điền sẵn bằng phần còn lại (3)",
      (await qtyInput(0).inputValue()) === "3",
      await qtyInput(0).inputValue(),
    );
    await qtyInput(0).fill("9");
    await qtyInput(0).blur();
    const clamped = Number(await qtyInput(0).inputValue());
    check(
      "G4 nhập quá phần còn lại bị chặn (<= 3)",
      clamped <= 3,
      String(clamped),
    );
    await shot(page, "G4-receipt-batch2");
    receipt2 = await saveReceipt();
    const post = await postReceipt(receipt2.id);
    check(
      "G4 ghi sổ phiếu đợt 2",
      post.status === 201 || post.status === 200,
      post.status,
    );
    const po = (
      await api(tao, "GET", `/procurement-orders-garage/${poBatch.id}`)
    ).data;
    check(
      "G4 đơn nhận đủ (FULL)",
      po?.fulfillmentStatus === "FULL",
      po?.fulfillmentStatus,
    );
    check("G4 đơn tự đóng (CLOSED)", po?.status === "CLOSED", po?.status);
  },
);

await step("G5 lịch sử có 2 phiếu và mở được phiếu", async () => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, {
    waitUntil: "domcontentloaded",
  });
  await waitTable(page);
  await openRowMenu(page, poBatch.orderNo);
  await menuItem(page, "Xem chi tiết").click();
  await page
    .getByText("Lịch sử nhập kho", { exact: true })
    .waitFor({ timeout: 20000 });
  await page
    .getByText(receipt2.receiptNo, { exact: true })
    .waitFor({ timeout: 20000 });
  check(
    "G5 lịch sử có phiếu đợt 1 và đợt 2",
    (await page.getByText(receipt1.receiptNo, { exact: true }).count()) > 0 &&
      (await page.getByText(receipt2.receiptNo, { exact: true }).count()) > 0,
  );
  await shot(page, "G5-po-history-2");
  await page.getByText(receipt1.receiptNo, { exact: true }).first().click();
  await page.waitForFunction(
    () => window.location.pathname.includes("garage-goods-receipts"),
    null,
    { timeout: 20000 },
  );
  await page
    .getByText(receipt1.receiptNo, { exact: true })
    .first()
    .waitFor({ timeout: 20000 });
  check(
    "G5 bấm số phiếu mở phiếu nhập (xóa tham số receipt khỏi URL)",
    !page.url().includes("receipt="),
    page.url(),
  );
  await shot(page, "G5-receipt-opened");
});

// ================= H. Xóa vĩnh viễn chỉ ở bộ lọc "Đã xóa mềm" =================
// Nhánh dương (có Xóa vĩnh viễn trong bộ lọc Đã xóa mềm) cần tài khoản có quyền delete + purge.
// Tài khoản test mặc định không có: khi API trả 403 thì chỉ kiểm nhánh âm và ghi INFO.
const mkDraft = async (kind, label) => {
  if (kind === "orders") {
    return (
      await api(tao, "POST", "/procurement-orders-garage", {
        orderDate: TODAY,
        lines: [
          {
            lineType: "GOODS",
            itemCode: `E2E-H-${suffix}`,
            itemName: `${label} ${TAG}`,
            qtyOrdered: 1,
            unitPrice: 10,
          },
        ],
      })
    ).data;
  }
  const id = await mkPr(`${TAG} ${label}`);
  return (await api(tao, "GET", `/procurement-requests-garage/${id}`)).data;
};
const deletedCount = async (base, no) => {
  const r = await api(
    tao,
    "GET",
    `${base}?deleted=only&search=${encodeURIComponent(no)}&pageSize=5`,
  );
  return (r.data?.items ?? []).length;
};

for (const kind of ["orders", "requests"]) {
  await step(
    `H ${kind}: Xóa vĩnh viễn chỉ hiện ở bộ lọc Đã xóa mềm`,
    async () => {
      const base =
        kind === "orders"
          ? "/procurement-orders-garage"
          : "/procurement-requests-garage";
      const live = await mkDraft(kind, "Bản nháp còn sống");
      const liveNo = live.orderNo ?? live.requestNo;
      const doc = await mkDraft(kind, "Bản sẽ xóa mềm");
      const docNo = doc.orderNo ?? doc.requestNo;
      await page.goto(`${WEB}/v2/garage-procurement?tab=${kind}`, {
        waitUntil: "domcontentloaded",
      });
      await waitTable(page);

      await openRowMenu(page, liveNo);
      await shot(page, `H-${kind}-menu-normal`);
      check(
        `H ${kind} menu thường KHÔNG có Xóa vĩnh viễn`,
        (await menuItem(page, "Xóa vĩnh viễn").count()) === 0,
      );
      await page.keyboard.press("Escape");

      const del = await api(tao, "DELETE", `${base}/${doc.id}`);
      if (del.status === 403) {
        console.log(
          `INFO H ${kind}: tài khoản test không có quyền xóa/purge, bỏ qua nhánh Đã xóa mềm (có unit test useProcurementListTabState)`,
        );
        return;
      }
      check(
        `H ${kind} xóa mềm bằng API`,
        del.status === 200 || del.status === 204,
        del.status,
      );
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitTable(page);
      await page
        .getByRole("button", { name: "Chế độ xem", exact: true })
        .click();
      await page.getByText("Đã xóa mềm", { exact: true }).first().click();
      await page.keyboard.press("Escape");
      await openRowMenu(page, docNo);
      await shot(page, `H-${kind}-menu-deleted`);
      check(
        `H ${kind} bộ lọc Đã xóa mềm có Xóa vĩnh viễn`,
        (await menuItem(page, "Xóa vĩnh viễn").count()) === 1,
      );
      check(
        `H ${kind} bộ lọc Đã xóa mềm không còn Chỉnh sửa`,
        (await menuItem(page, "Chỉnh sửa").count()) === 0,
      );
      check(
        `H ${kind} trước khi xóa vĩnh viễn: dòng còn trong thùng`,
        (await deletedCount(base, docNo)) === 1,
      );
      await menuItem(page, "Xóa vĩnh viễn").click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Xóa vĩnh viễn", exact: true })
        .click();
      await page
        .locator("tr", { hasText: docNo })
        .waitFor({ state: "detached", timeout: 20000 });
      check(`H ${kind} xóa vĩnh viễn: dòng biến mất khỏi bảng`, true);
      check(
        `H ${kind} xóa vĩnh viễn: không còn trong thùng`,
        (await deletedCount(base, docNo)) === 0,
      );
    },
  );
}

// ================= I. Phiếu nhập Garage gắn đơn mua: NCC/tổng theo PO, badge cạnh mã phiếu =================
const poRecv = (
  await api(tao, "POST", "/procurement-orders-garage", {
    orderDate: TODAY,
    supplierId: SUPPLIER,
    supplierName: "NCC E2E",
    lines: [
      {
        lineType: "GOODS",
        itemCode: `E2E-I-${suffix}`,
        itemName: `Phiếu từ PO ${TAG}`,
        qtyOrdered: 4,
        unitPrice: 25,
      },
    ],
  })
).data;
await api(tao, "POST", `/procurement-orders-garage/${poRecv.id}/submit`, {});
await api(tao, "POST", `/procurement-orders-garage/${poRecv.id}/issue`, {});
const poRecvDetail = (
  await api(tao, "GET", `/procurement-orders-garage/${poRecv.id}`)
).data;

const apiV2 = (s, method, path, body) =>
  fetch(`${API}/api/v2${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${s.token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({
    status: r.status,
    data: await r.json().catch(() => ({})),
  }));

await step(
  "I1 API: phiếu nhập bắt buộc có đơn mua; NCC/tổng theo đơn",
  async () => {
    const noPo = await apiV2(tao, "POST", "/garage-goods-receipts", {
      receiptDate: TODAY,
      lines: [{ itemName: "X", qtyReceived: 1, unitCost: 1 }],
    });
    check(
      "I1 tạo phiếu thiếu đơn mua bị từ chối (400)",
      noPo.status === 400,
      noPo.status,
    );
    const created = await apiV2(tao, "POST", "/garage-goods-receipts", {
      receiptDate: TODAY,
      garageProcurementOrderId: poRecv.id,
      supplierName: "NCC tự gõ",
      totalAmount: 999999,
      lines: [
        {
          itemName: `Phiếu từ PO ${TAG}`,
          qtyReceived: 2,
          unitCost: 25,
          procurementOrderLineId: poRecvDetail.lines[0].id,
        },
      ],
    });
    const gr = created.data?.data;
    check(
      "I1 tạo phiếu có đơn mua (201)",
      created.status === 201,
      created.status,
    );
    check(
      "I1 NCC bị ghi đè theo đơn mua",
      gr?.supplierName === "NCC E2E",
      gr?.supplierName,
    );
    check(
      "I1 tổng tiền = tổng dòng nhận (50), không tin client",
      Number(gr?.totalAmount) === 50,
      gr?.totalAmount,
    );
    check(
      "I1 response có số đơn và tổng tiền đơn mua",
      gr?.garageProcurementOrderNo === poRecv.orderNo &&
        Number(gr?.orderTotalAmount) === 100,
      `${gr?.garageProcurementOrderNo} ${gr?.orderTotalAmount}`,
    );
    const swap = await apiV2(tao, "PATCH", `/garage-goods-receipts/${gr?.id}`, {
      garageProcurementOrderId: poBatch.id,
    });
    check(
      "I1 không đổi được đơn mua của phiếu (400)",
      swap.status === 400,
      swap.status,
    );
    globalThis.__receiptI = gr;
  },
);

await step(
  "I2 UI: drawer phiếu nhập có Đơn mua, NCC chỉ đọc, tổng đơn mua, badge cạnh mã phiếu",
  async () => {
    const gr = globalThis.__receiptI;
    await page.goto(`${WEB}/v2/garage-goods-receipts`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await openRowMenu(page, gr.receiptNo);
    await menuItem(page, "Xem chi tiết").click();
    const dialog = page.getByRole("dialog").first();
    await dialog
      .getByText(poRecv.orderNo, { exact: true })
      .first()
      .waitFor({ timeout: 20000 });
    await shot(page, "I2-receipt-view");
    check(
      "I2 hiện số đơn mua",
      (await dialog.getByText(poRecv.orderNo, { exact: true }).count()) > 0,
    );
    check(
      "I2 hiện Tổng tiền đơn mua",
      (await dialog.getByText("Tổng tiền đơn mua", { exact: true }).count()) >
        0,
    );
    check(
      "I2 không còn dòng Trạng thái trong thông tin phiếu",
      (await dialog.getByText("Trạng thái", { exact: true }).count()) === 0,
    );
    const pos = await page.evaluate((no) => {
      const root = document.querySelector('[role="dialog"]');
      const title = [...root.querySelectorAll("*")].find(
        (e) => e.children.length === 0 && (e.textContent ?? "").trim() === no,
      );
      const badge = [...root.querySelectorAll("*")].find(
        (e) =>
          e.children.length === 0 && (e.textContent ?? "").trim() === "Nháp",
      );
      if (!title || !badge) return null;
      const a = title.getBoundingClientRect();
      const b = badge.getBoundingClientRect();
      return {
        sameRow: Math.abs(a.top - b.top) < 24,
        badgeAfter: b.left >= a.right - 1,
      };
    }, gr.receiptNo);
    check(
      "I2 Badge trạng thái nằm cùng hàng, sau mã phiếu trong title",
      Boolean(pos?.sameRow && pos?.badgeAfter),
      JSON.stringify(pos),
    );
    await page.keyboard.press("Escape");
  },
);

await step(
  "I3 UI: tạo phiếu mới chọn đơn mua → NCC/dòng tự điền; thiếu đơn mua bị chặn",
  async () => {
    await page.goto(`${WEB}/v2/garage-goods-receipts`, {
      waitUntil: "domcontentloaded",
    });
    await waitTable(page);
    await page
      .getByRole("button", { name: /tạo phiếu nhập kho/i })
      .first()
      .click();
    const dialog = page.getByRole("dialog").first();
    const picker = dialog.getByRole("combobox", { name: "Đơn mua" });
    await picker.waitFor({ timeout: 20000 });
    check(
      "I3 NCC chỉ đọc, gợi ý tự điền theo đơn mua",
      (await dialog.getByText("Tự điền theo đơn mua").count()) === 1,
    );
    check(
      "I3 không có ô nhập Nhà cung cấp",
      (await dialog.getByRole("textbox", { name: "Nhà cung cấp" }).count()) ===
        0,
    );
    await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
    await page.waitForTimeout(800);
    check(
      "I3 lưu khi chưa chọn đơn mua bị chặn (còn drawer, báo thiếu thông tin)",
      (await dialog.count()) === 1 &&
        (await page.getByText("Thiếu thông tin").count()) > 0,
    );
    await picker.click();
    await page.keyboard.type(poRecv.orderNo);
    await page
      .getByRole("option", { name: new RegExp(poRecv.orderNo) })
      .first()
      .click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("input")].some((i) =>
          i.value.startsWith("Phiếu từ PO"),
        ),
      null,
      { timeout: 20000 },
    );
    await shot(page, "I3-picked-order");
    check(
      "I3 chọn đơn mua: NCC tự điền",
      (await dialog.getByText("NCC E2E", { exact: true }).count()) > 0,
    );
    check(
      "I3 chọn đơn mua: Tổng tiền đơn mua hiện 100",
      (await dialog.getByText(/100\s*₫/).count()) > 0,
    );
    check(
      "I3 Badge Nháp có ngay khi tạo mới",
      (await dialog.getByText("Nháp", { exact: true }).count()) > 0,
    );
    await page.keyboard.press("Escape");
  },
);

await browser.close();

// ---------- Đối chiếu DB qua API ----------
const prRej = (await api(tao, "GET", `/procurement-requests-garage`)).data;
check(
  "DB: PR bị từ chối vẫn REJECTED",
  (await api(tao, "GET", `/procurement-requests-garage/${prRejected}`)).data
    .status === "REJECTED",
);

const failed = results.filter((r) => !r.pass);
console.log(
  `\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`,
);
for (const f of failed) console.log("  ✗", f.step, f.detail);
