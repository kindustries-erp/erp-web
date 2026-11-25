// E2E trang Tiến độ xưởng `/garage-workshop-progress` (desktop + mobile): xe chỉ lên bảng khi nhân viên chọn
// ("Thêm xe vào bảng": xe có sẵn giữ trạng thái, tạo xe mới theo biển số), bỏ khỏi bảng có xác nhận, status v2
// trên thẻ, ghi công đoạn có giờ sửa tay và người ngoài danh sách, ghi chú, sửa/xóa nhật ký (có xác nhận), kéo thẻ
// đổi status cha, mobile chọn tab và cập nhật công đoạn. Dùng xe NATIVE tạo qua API trên chi nhánh ERP có xe,
// xóa mềm cuối.
// Biến môi trường: E2E_PASSWORD (bắt buộc), E2E_ADMIN_EMAIL, E2E_ERP_BRANCH_ID (tùy chọn). Chạy: bun run e2e:garage-workshop-progress
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolveApiUrl, resolveWebUrl } from "./e2e-ports.mjs";

const API = resolveApiUrl();
const WEB = resolveWebUrl();
const PASSWORD = process.env.E2E_PASSWORD;
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "ai-test-admin@example.com";
const CHROME = process.env.E2E_CHROME_PATH ?? "/usr/bin/google-chrome";
if (!PASSWORD) {
  console.error("Thiếu E2E_PASSWORD.");
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const toLocalInput = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// ── Dữ liệu nền qua API ─────────────────────────────────────────────────────
const login = await fetch(`${API}/api/v2/auth-sessions/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const token = (await login.json()).data?.accessToken;
check("A0 đăng nhập API", Boolean(token));
const auth = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
// Chi nhánh ERP để chạy (header `x-erp-branch-id`): E2E_ERP_BRANCH_ID, thiếu thì lấy chi nhánh đầu tiên có xe.
const branches =
  (
    await (
      await fetch(`${API}/api/v2/branches?page=1&pageSize=500`, {
        headers: auth,
      })
    ).json()
  ).items ?? [];
let BRANCH = process.env.E2E_ERP_BRANCH_ID ?? null;
for (const b of BRANCH ? [] : branches) {
  const r = await (
    await fetch(`${API}/api/v2/cases-garage?pageSize=1`, {
      headers: { ...auth, "x-erp-branch-id": b.id },
    })
  ).json();
  if ((r.pagination?.total ?? 0) > 0) {
    BRANCH = b.id;
    break;
  }
}
check(
  "A1 có chi nhánh ERP có xe",
  Boolean(BRANCH),
  `${branches.length} chi nhánh`,
);
const H = { ...auth, "x-erp-branch-id": BRANCH };
const api = async (method, path, body) => {
  const r = await fetch(`${API}/api/v2/cases-garage${path}`, {
    method,
    headers: H,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => null);
  return { status: r.status, d: data?.data ?? data };
};
const tag = Date.now() % 100000;
const PLATE = `E2EW-${tag}`;
const created = await api("POST", "", {
  licensePlate: PLATE,
  vehicleBrandName: "VinFast",
  vehicleModelName: "VF8",
  customerName: "E2E xưởng",
  payerName: "E2E",
  services: [
    {
      productTypeCode: "DV",
      productName: "Công",
      quantity: 1,
      unitPrice: 100000,
      taxRate: 10,
    },
  ],
});
const CASE = created.d?.id;
const NEW_PLATE = `E2EN-${tag}`;
let NEW_CASE = null;
check("A2 tạo xe NATIVE qua API", Boolean(CASE), `${created.status}`);
const timeline = async () =>
  (await api("GET", `/${CASE}/progress-logs`)).d?.items ?? [];
const boardRow = async () =>
  (
    (await api("GET", `/workshop/board?pageSize=200&search=${PLATE}`)).d
      ?.items ?? []
  ).find((c) => c.id === CASE);
const poll = async (fn, ok, tries = 16) => {
  let v;
  for (let i = 0; i < tries; i += 1) {
    v = await fn();
    if (ok(v)) return v;
    await sleep(500);
  }
  return v;
};

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
async function openPage(viewport, isMobile) {
  const ctx = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
  });
  await ctx.addInitScript((branchId) => {
    localStorage.setItem(
      "erp-app",
      JSON.stringify({ state: { currentBranchId: branchId }, version: 0 }),
    );
  }, BRANCH);
  const page = await ctx.newPage();
  page.setDefaultTimeout(25000);
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
  return page;
}
/** Hộp thoại "Thêm xe vào bảng": gõ biển số, chọn xe theo nhãn radio, gửi. */
async function addVehicle(page, plate, radioName) {
  await page.getByRole("button", { name: "Thêm xe vào bảng" }).click();
  const modal = page.getByRole("dialog").filter({ hasText: "Đưa vào bảng" });
  await modal.getByPlaceholder(/Ví dụ: 51G/).fill(plate);
  const radio = modal.getByRole("radio", { name: radioName });
  await radio.waitFor({ timeout: 15000 });
  await radio.click();
  return modal;
}
const drawer = (page) => page.getByRole("dialog").last();

try {
  // ── B. Desktop ──────────────────────────────────────────────────────────
  const page = await openPage({ width: 1600, height: 1000 }, false);
  const card = page.getByTestId(`workshop-card-${CASE}`);
  await page.waitForTimeout(1500);
  check(
    "B0 xe mới tạo chưa tự lên bảng",
    (await card.count()) === 0 && !(await boardRow()),
  );
  const addModal = await addVehicle(page, PLATE, new RegExp(`^${PLATE}`));
  check(
    "B0a xe có sẵn: giữ trạng thái hiện tại (Tiếp nhận) đã chọn sẵn",
    await addModal.getByRole("radio", { name: /^Tiếp nhận/ }).isChecked(),
  );
  await addModal.getByRole("button", { name: "Đưa vào bảng" }).click();
  await card.waitFor({ timeout: 40000 });
  const tracked = await poll(boardRow, (r) => !!r?.workshopTrackedAt);
  check(
    "B0b đưa vào bảng: API có mốc workshopTrackedAt, status giữ INTAKE",
    tracked?.status === "INTAKE" && !!tracked?.workshopTrackedAt,
    JSON.stringify(tracked)?.slice(0, 200),
  );
  // Thêm xong thì drawer của xe tự mở để ghi công đoạn ngay.
  await drawer(page).getByTestId("workshop-log-form").waitFor();
  check("B0c thêm xong mở drawer của xe", true);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  // Tiêu đề cột có thể in hoa bằng CSS (innerText trả chữ hoa), nên so không phân biệt hoa thường.
  const body = (await page.innerText("body")).toLowerCase();
  const lanes = ["Tiếp nhận", "Báo giá", "Đang làm", "Hoàn thành", "Hủy"];
  check(
    "B1 đủ 5 cột status v2",
    lanes.every((n) => body.includes(n.toLowerCase())),
    lanes.filter((n) => !body.includes(n.toLowerCase())).join(","),
  );
  const cardText = await card.innerText();
  check(
    "B2 thẻ hiện status v2 Tiếp nhận và chưa chọn công đoạn",
    cardText.includes("Tiếp nhận") && cardText.includes("Chưa chọn công đoạn"),
    cardText,
  );

  await card.click();
  const dlg = drawer(page);
  await dlg.getByTestId("workshop-log-form").waitFor();
  // Công đoạn là combobox (không còn radio).
  await dlg.getByRole("combobox", { name: "Công đoạn" }).click();
  await page.getByRole("option", { name: /^Chờ kiểm tra/ }).click();
  // Người làm: gõ thì hiện gợi ý nhân viên; tên ngoài danh sách vẫn nhập tự do, không còn công tắc.
  const worker = dlg.getByRole("combobox", { name: "Người làm" });
  const staff = (await api("GET", "/workshop/workers?search=a")).d;
  const staffItems = staff?.items ?? staff ?? [];
  await worker.fill("");
  await worker.pressSequentially("a", { delay: 50 });
  await page.waitForTimeout(800);
  const suggestions = await page
    .locator("[data-v2-autocomplete-panel] [role=option]")
    .count();
  check(
    "C0 gõ tên hiện gợi ý nhân viên; không còn công tắc người ngoài",
    (staffItems.length === 0 || suggestions > 0) &&
      (await dlg.getByRole("switch").count()) === 0,
    `staff=${staffItems.length} suggestions=${suggestions}`,
  );
  await worker.fill("Thợ E2E");
  await dlg.getByPlaceholder(/Ví dụ/).fill("Kiểm tra gầm");
  // Bắt đầu lúc: V2DateTimePicker, không còn ô datetime-local; dùng nút chọn nhanh.
  check(
    "C0b Bắt đầu lúc dùng V2DateTimePicker + V2TimePicker",
    (await dlg.locator('input[type="datetime-local"]').count()) === 0 &&
      (await dlg.locator('input[type="time"]').count()) === 0 &&
      (await dlg.getByRole("button", { name: "Bắt đầu lúc – Giờ" }).count()) ===
        1,
  );
  await dlg.getByRole("button", { name: "30 phút trước" }).click();
  await dlg.getByRole("button", { name: "Lưu tiến độ" }).click();
  const tl1 = await poll(timeline, (t) => t.length === 1);
  const s1 = tl1[0];
  check(
    "C1 lưu công đoạn: STAGE AWAITING_INSPECTION, người làm, giờ sửa tay ~30 phút",
    s1?.stage === "AWAITING_INSPECTION" &&
      s1?.workerName === "Thợ E2E" &&
      s1?.durationMinutes >= 29 &&
      s1?.durationMinutes <= 31,
    JSON.stringify(s1),
  );
  await page.waitForTimeout(800);
  const c1 = await card.innerText();
  check(
    "C2 thẻ cập nhật công đoạn và đồng hồ",
    c1.includes("Chờ kiểm tra") && /Công đoạn đã (29|3\d) phút/.test(c1),
    c1,
  );
  await page.screenshot({ path: SHOTS + "workshop-desktop-stage.png" });

  await dlg.getByRole("tab", { name: "Ghi chú" }).click();
  await dlg.getByPlaceholder(/Ví dụ/).fill("Khách hẹn chiều lấy xe");
  await dlg.getByRole("button", { name: "Lưu tiến độ" }).click();
  const tl2 = await poll(timeline, (t) => t.length === 2);
  check(
    "D1 ghi chú lưu vào nhật ký",
    tl2.some((x) => x.kind === "NOTE" && x.note === "Khách hẹn chiều lấy xe"),
  );
  await dlg.getByText("Khách hẹn chiều lấy xe").first().waitFor();

  const stageRow = dlg.getByTestId(`workshop-log-${s1.id}`);
  await stageRow.getByRole("button", { name: /Sửa/ }).click();
  await dlg.getByText("Đang sửa một dòng nhật ký").waitFor();
  // V2TimePicker: chọn giờ rồi phút (bước 5 phút, làm tròn xuống) trong popover.
  const t45 = new Date(Date.now() - 45 * 60000);
  const two = (n) => String(n).padStart(2, "0");
  const timeBtn = dlg.getByRole("button", { name: "Bắt đầu lúc – Giờ" });
  await timeBtn.click();
  await page
    .getByRole("listbox", { name: "Giờ" })
    .getByRole("option", { name: two(t45.getHours()), exact: true })
    .click();
  await page
    .getByRole("listbox", { name: "Phút" })
    .getByRole("option", {
      name: two(Math.floor(t45.getMinutes() / 5) * 5),
      exact: true,
    })
    .click();
  await dlg.getByRole("button", { name: "Lưu thay đổi" }).click();
  const e1 = await poll(
    timeline,
    (t) => (t.find((x) => x.id === s1.id)?.durationMinutes ?? 0) >= 44,
  );
  check(
    "E1 sửa tay giờ bắt đầu thành ~45 phút",
    (e1.find((x) => x.id === s1.id)?.durationMinutes ?? 0) >= 44,
  );

  const noteId = tl2.find((x) => x.kind === "NOTE")?.id;
  await dlg
    .getByTestId(`workshop-log-${noteId}`)
    .getByRole("button", { name: /Xóa/ })
    .click();
  const confirm = page
    .getByRole("dialog")
    .filter({ hasText: "Xóa dòng nhật ký?" });
  await confirm.waitFor();
  check("F1 xóa cần hộp xác nhận", (await timeline()).length === 2);
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();
  const tl3 = await poll(timeline, (t) => t.length === 1);
  check(
    "F2 sau xác nhận, ghi chú bị xóa mềm",
    tl3.length === 1 && tl3[0].kind === "STAGE",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);

  // ── G. Kéo thẻ sang cột Đang làm: status v2 đổi, badge trên thẻ đổi ngay ──
  const from = await card.boundingBox();
  const lane = page.getByText("Đang làm", { exact: true }).first();
  const to = await lane.boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + 20);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + 30, {
    steps: 5,
  });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2 + 60, {
    steps: 25,
  });
  await page.waitForTimeout(500);
  await page.mouse.up();
  const row = await poll(boardRow, (r) => r?.status === "IN_PROGRESS");
  check(
    "G1 API: status IN_PROGRESS, bỏ status nhỏ cũ",
    row?.status === "IN_PROGRESS" && row?.progressStage === null,
    JSON.stringify(row)?.slice(0, 200),
  );
  await page.waitForTimeout(800);
  const c2 = await page.getByTestId(`workshop-card-${CASE}`).innerText();
  check(
    "G2 badge thẻ hiện status v2 mới (Đang làm)",
    c2.includes("Đang làm") && !c2.includes("Tiếp nhận"),
    c2,
  );
  const tl4 = await timeline();
  check(
    "G3 công đoạn cũ tự đóng khi đổi status cha",
    tl4.every((x) => x.endedAt !== null),
  );
  await page.screenshot({ path: SHOTS + "workshop-desktop-moved.png" });

  // ── I. Xe chưa có trong hệ thống: tạo mới theo biển số, rồi bỏ khỏi bảng ──
  await page.getByPlaceholder(/Tìm biển số/).fill("");
  const newModal = await addVehicle(page, NEW_PLATE, /^Tạo xe mới/);
  check(
    "I1 xe mới: không chọn thẳng được Hoàn thành",
    await newModal.getByRole("radio", { name: /^Hoàn thành/ }).isDisabled(),
  );
  await newModal.getByLabel("Tên khách (không bắt buộc)").fill("Khách E2E");
  await newModal.getByRole("button", { name: "Đưa vào bảng" }).click();
  const newRow = await poll(
    async () =>
      (
        (await api("GET", `/workshop/board?pageSize=200&search=${NEW_PLATE}`)).d
          ?.items ?? []
      ).find((c) => c.licensePlate === NEW_PLATE),
    (r) => !!r,
  );
  NEW_CASE = newRow?.id ?? null;
  check(
    "I2 tạo xe mới INTAKE trên bảng, biển số viết hoa, có tên khách",
    newRow?.status === "INTAKE" && newRow?.customerName === "Khách E2E",
    JSON.stringify(newRow)?.slice(0, 200),
  );
  const nd = drawer(page);
  await nd.getByRole("button", { name: "Bỏ khỏi bảng" }).click();
  const untrack = page
    .getByRole("dialog")
    .filter({ hasText: `Bỏ xe ${NEW_PLATE} khỏi bảng?` });
  await untrack.waitFor();
  await untrack.getByRole("button", { name: "Bỏ khỏi bảng" }).click();
  await page.waitForTimeout(800);
  const gone = await poll(
    async () =>
      (
        (await api("GET", `/workshop/board?pageSize=200&search=${NEW_PLATE}`)).d
          ?.items ?? []
      ).some((c) => c.id === NEW_CASE),
    (v) => v === false,
  );
  check(
    "I3 bỏ khỏi bảng qua xác nhận: xe rời bảng",
    gone === false &&
      (await page.getByTestId(`workshop-card-${NEW_CASE}`).count()) === 0,
  );
  await page.context().close();

  // ── H. Mobile ───────────────────────────────────────────────────────────
  const m = await openPage({ width: 390, height: 844 }, true);
  await m.getByTestId("workshop-mobile-list").waitFor();
  const mCard = m.getByTestId(`workshop-card-${CASE}`);
  await mCard.waitFor({ timeout: 30000 });
  check(
    "H1 mobile mở sẵn tab Đang làm, có thẻ xe",
    (await mCard.innerText()).includes("Đang làm"),
  );
  const box = await m.getByRole("button", { name: "Lưu tiến độ" }).count();
  check("H2 chưa mở drawer thì không có form", box === 0);
  await mCard.tap();
  const md = drawer(m);
  const stageBox = md.getByRole("combobox", { name: "Công đoạn" });
  await stageBox.waitFor();
  const btnBox = await stageBox.boundingBox();
  check(
    "H3 ô công đoạn đủ lớn để bấm (≥ 44px)",
    (btnBox?.height ?? 0) >= 43.5,
    `${btnBox?.height}`,
  );
  await stageBox.tap();
  await m.getByRole("option", { name: /^Đang sửa/ }).tap();
  await md.getByRole("button", { name: "Lưu tiến độ" }).tap();
  const mRow = await poll(boardRow, (r) => r?.progressStage === "REPAIRING");
  check(
    "H4 mobile lưu công đoạn Đang sửa",
    mRow?.progressStage === "REPAIRING",
  );
  await m.screenshot({ path: SHOTS + "workshop-mobile.png" });

  // H5. Mobile không kéo thả: đổi trạng thái trong drawer; Hủy phải xác nhận.
  const statusBox = md.getByRole("combobox", { name: "Trạng thái" });
  await statusBox.tap();
  const intake = m.getByRole("option", { name: /^Tiếp nhận/ });
  await intake.waitFor();
  check(
    "H5 ô Trạng thái khóa trạng thái sai bảng chuyển (Đang làm → Tiếp nhận)",
    (await intake.getAttribute("aria-disabled")) === "true",
  );
  await m.getByRole("option", { name: /^Hủy/ }).tap();
  const cancelDlg = m
    .getByRole("dialog")
    .filter({ hasText: `Hủy xe ${PLATE}?` });
  await cancelDlg.waitFor();
  check(
    "H6 chọn Hủy hiện hộp xác nhận, chưa đổi trạng thái",
    (await boardRow())?.status === "IN_PROGRESS",
  );
  await m.screenshot({ path: SHOTS + "workshop-mobile-cancel.png" });
  await cancelDlg.getByRole("button", { name: "Hủy xe" }).tap();
  const cRow = await poll(boardRow, (r) => r?.status === "CANCELLED");
  check("H7 xác nhận Hủy: xe chuyển sang Hủy", cRow?.status === "CANCELLED");
  await m.context().close();
} catch (e) {
  check("Lỗi ngoài dự kiến", false, e?.message ?? e);
} finally {
  if (CASE) await api("DELETE", `/${CASE}`);
  if (NEW_CASE) await api("DELETE", `/${NEW_CASE}`);
  await browser.close();
}

const failed = results.filter((r) => !r.pass).length;
console.log(`TOTAL ${results.length}, FAILED ${failed}`);
process.exit(failed ? 1 : 0);
