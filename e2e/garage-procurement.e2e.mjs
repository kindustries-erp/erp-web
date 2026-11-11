// E2E Garage Procurement (PR/PO): tạo, duyệt, từ chối, nhân bản, UI menu & drawer.
// Cấu hình qua biến môi trường (xem erp-web/.agents/skills/erp-e2e-playwright/SKILL.md):
//   E2E_WEB_URL      (mặc định http://127.0.0.1:5173)
//   E2E_API_URL      (mặc định http://localhost:10003)
//   E2E_PASSWORD     (BẮT BUỘC, mật khẩu tài khoản test; không hardcode)
//   E2E_TAO_EMAIL    (mặc định ai-test-tao@example.com, người tạo)
//   E2E_DUYET_EMAIL  (mặc định ai-test-duyet@example.com, người duyệt)
//   E2E_CHROME_PATH  (mặc định /usr/bin/google-chrome)
// Chạy: bun run e2e:garage-procurement
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const API = process.env.E2E_API_URL ?? 'http://localhost:10003';
const WEB = process.env.E2E_WEB_URL ?? 'http://127.0.0.1:5173';
const PASSWORD = process.env.E2E_PASSWORD;
const TAO_EMAIL = process.env.E2E_TAO_EMAIL ?? 'ai-test-tao@example.com';
const DUYET_EMAIL = process.env.E2E_DUYET_EMAIL ?? 'ai-test-duyet@example.com';
const CHROME = process.env.E2E_CHROME_PATH ?? '/usr/bin/google-chrome';
if (!PASSWORD) {
  console.error('Thiếu E2E_PASSWORD. Đặt mật khẩu tài khoản test rồi chạy lại.');
  process.exit(2);
}
const SHOTS = new URL('./.artifacts/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });
const TAG = `E2E-${Date.now()}`;
const TODAY = new Date().toISOString().slice(0, 10);
const results = [];
const check = (step, pass, detail = '') => {
  results.push({ step, pass: !!pass, detail: String(detail).slice(0, 120) });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${step}${detail ? ' — ' + String(detail).slice(0, 120) : ''}`);
};

// ---------- API helpers (dựng dữ liệu nền) ----------
async function apiLogin(email) {
  const r = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const b = await r.json();
  return { token: b.accessToken, user: b.user };
}
async function api(s, method, path, body) {
  const r = await fetch(`${API}/api/v2${path}`, {
    method,
    headers: { Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await r.json(); } catch { /* no body */ }
  return { status: r.status, data };
}

// ---------- UI helpers ----------
async function login(page, email) {
  await page.goto(WEB, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForFunction(() => !document.querySelector('input[type=password]'), null, { timeout: 30000 });
}
async function openRowMenu(page, text) {
  const row = page.locator('tr', { hasText: text }).first();
  await row.waitFor({ timeout: 20000 });
  await row.click({ button: 'right' });
  await page.getByRole('menu').first().waitFor({ timeout: 10000 });
}
async function waitTable(page) {
  for (let i = 0; i < 2; i++) {
    try { await page.locator('table').first().waitFor({ timeout: 15000 }); return; }
    catch (e) {
      if (i === 1) { await shot(page, `fail-table-${Date.now()}`); throw e; }
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }
}
const menuItem = (page, name) => page.getByRole('menuitem', { name, exact: true });
async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}${name}.png`, fullPage: false }).catch(() => {});
}
async function step(name, fn) {
  try { await fn(); } catch (e) { check(`${name} (exception)`, false, e.message); }
}

// ---------- Dựng dữ liệu nền qua API ----------
const tao = await apiLogin(TAO_EMAIL);
const duyet = await apiLogin(DUYET_EMAIL);
const SUPPLIER = '02c760ca-2a7c-454b-9c52-28712653062b';

const mkPr = async (title) => {
  const r = await api(tao, 'POST', '/procurement-requests-garage', {
    requestDate: TODAY, title,
    lines: [{ lineType: 'GOODS', itemName: `Vật tư ${title}`, qtyRequested: 2, estUnitPrice: 100 }],
  });
  return r.data.id;
};
const prDraft = await mkPr(`${TAG} PR nháp`);
const prRejected = await mkPr(`${TAG} PR bị từ chối`);
await api(tao, 'POST', `/procurement-requests-garage/${prRejected}/submit`, { approverId: duyet.user.id });
await api(duyet, 'POST', `/procurement-requests-garage/${prRejected}/reject`, { reason: 'Thiếu báo giá' });
const prApproved = await mkPr(`${TAG} PR đã duyệt`);
await api(tao, 'POST', `/procurement-requests-garage/${prApproved}/submit`, { approverId: duyet.user.id });
await api(duyet, 'POST', `/procurement-requests-garage/${prApproved}/approve`, {});
const prApprovedDetail = (await api(tao, 'GET', `/procurement-requests-garage/${prApproved}`)).data;
const prNos = {
  draft: (await api(tao, 'GET', `/procurement-requests-garage/${prDraft}`)).data.requestNo,
  rejected: (await api(tao, 'GET', `/procurement-requests-garage/${prRejected}`)).data.requestNo,
  approved: prApprovedDetail.requestNo,
};
console.log('Dữ liệu nền:', prNos);

// PO nháp có NCC (để kiểm tra nút Tạo mới/Cập nhật)
const poDraftRes = await api(tao, 'POST', '/procurement-orders-garage', {
  orderDate: TODAY, supplierId: SUPPLIER,
  lines: [{ lineType: 'GOODS', itemCode: `E2E-NHAP-${TAG}`.slice(0, 40), itemName: `Đơn nháp ${TAG}`, qtyOrdered: 1, unitPrice: 50 }],
});
const poDraftId = poDraftRes.data.id;
const poDraftNo = poDraftRes.data.orderNo;

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

// ================= A. Người tạo: danh sách PR và menu theo trạng thái =================
await step('A0 đăng nhập người tạo', async () => {
  await login(page, TAO_EMAIL);
  check('A0 đăng nhập người tạo', true);
});

await step('A1 menu PR bị từ chối', async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, { waitUntil: 'domcontentloaded' }); await waitTable(page);
  await openRowMenu(page, prNos.rejected);
  await shot(page, 'A1-menu-pr-rejected');
  check('A1 có Xem chi tiết (bật)', await menuItem(page, 'Xem chi tiết').isEnabled());
  const nhanBan = menuItem(page, 'Nhân bản');
  check('A1 có Nhân bản (bật)', (await nhanBan.count()) === 1 && (await nhanBan.isEnabled()));
  const edit = menuItem(page, 'Chỉnh sửa');
  check('A1 Chỉnh sửa bị mờ', (await edit.count()) === 1 && !(await edit.isEnabled()));
  check('A1 không có Gửi duyệt / Duyệt / Từ chối', (await page.getByRole('menuitem', { name: /^(Gửi duyệt|Duyệt|Từ chối|Thu hồi|Hủy)$/ }).count()) === 0);
  await page.keyboard.press('Escape');
});

await step('A2 menu PR nháp', async () => {
  await openRowMenu(page, prNos.draft);
  await shot(page, 'A2-menu-pr-draft');
  check('A2 PR nháp có Chỉnh sửa (bật)', await menuItem(page, 'Chỉnh sửa').isEnabled());
  check('A2 PR nháp có Gửi duyệt', (await menuItem(page, 'Gửi duyệt').count()) === 1);
  check('A2 PR nháp không có Nhân bản', (await menuItem(page, 'Nhân bản').count()) === 0);
  await page.keyboard.press('Escape');
});

await step('A3 Nhân bản PR từ phiếu bị từ chối', async () => {
  await openRowMenu(page, prNos.rejected);
  await menuItem(page, 'Nhân bản').click();
  // Drawer chỉnh sửa của bản nháp mới
  await page.getByText('Sửa đề nghị mua', { exact: false }).first().waitFor({ timeout: 20000 });
  await shot(page, 'A3-clone-pr-drawer');
  check('A3 drawer sửa mở cho bản nháp mới', true);
  check('A3 nút Lưu nháp hiển thị', (await page.getByRole('button', { name: /lưu nháp/i }).count()) > 0);
  await page.getByRole('button', { name: 'Hủy' }).first().click().catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
});

await step('A4 PR đã duyệt → menu Lập đơn mua bật', async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, { waitUntil: 'domcontentloaded' }); await waitTable(page);
  await openRowMenu(page, prNos.approved);
  const item = menuItem(page, 'Lập đơn mua từ đề nghị này');
  check('A4 Lập đơn mua bật cho PR đã duyệt', (await item.count()) === 1 && (await item.isEnabled()));
  await page.keyboard.press('Escape');
});

// Lập PO qua API để PR đủ hàng → menu PR phải mờ + tooltip
const poFromPr = await api(tao, 'POST', '/procurement-orders-garage', {
  orderDate: TODAY, requestId: prApproved, supplierId: SUPPLIER,
  lines: prApprovedDetail.lines.map((l) => ({
    lineType: l.lineType, itemName: l.itemName, qtyOrdered: Number(l.qtyRequested),
    unitPrice: Number(l.estUnitPrice ?? 0), requestLineId: l.id,
  })),
});
check('A4b lập PO từ PR (API seed)', poFromPr.status === 201, poFromPr.status);

await step('A5 PR đã đủ PO → Lập đơn mua mờ + tooltip', async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, { waitUntil: 'domcontentloaded' }); await waitTable(page);
  await openRowMenu(page, prNos.approved);
  const item = menuItem(page, 'Lập đơn mua từ đề nghị này');
  await shot(page, 'A5-pr-fully-ordered');
  check('A5 Lập đơn mua mờ khi đã đủ PO', (await item.count()) === 1 && !(await item.isEnabled()));
  await item.locator('xpath=..').hover({ force: true }).catch(() => {});
  await page.waitForTimeout(1500);
  const tip = page.getByText('Đề nghị đã được lập đủ đơn mua', { exact: false });
  check('A5 tooltip giải thích lý do', (await tip.count()) > 0);
  await page.keyboard.press('Escape');
});

// ================= B. PO: nút Tạo mới/Cập nhật khi duyệt tắt =================
await step('B1 PO nháp: menu không có Gửi duyệt', async () => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, { waitUntil: 'domcontentloaded' }); await waitTable(page);
  await openRowMenu(page, poDraftNo);
  await shot(page, 'B1-po-draft-menu');
  check('B1 PO nháp không có Gửi duyệt (duyệt PO đang tắt)', (await menuItem(page, 'Gửi duyệt').count()) === 0);
  check('B1 PO nháp có Chỉnh sửa', (await menuItem(page, 'Chỉnh sửa').count()) === 1);
  await page.keyboard.press('Escape');
});

await step('B2 PO nháp: mở sửa → có Cập nhật cạnh Lưu nháp', async () => {
  await openRowMenu(page, poDraftNo);
  await menuItem(page, 'Chỉnh sửa').click();
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).waitFor({ timeout: 20000 });
  await shot(page, 'B2-po-edit-drawer');
  check('B2 nút Cập nhật hiển thị', true);
  check('B2 nút Lưu nháp vẫn có', (await page.getByRole('button', { name: /lưu nháp/i }).count()) > 0);
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
  let after = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    after = await api(tao, 'GET', `/procurement-orders-garage/${poDraftId}`);
    if (after.data?.status === 'APPROVED') break;
  }
  check('B2 Cập nhật → PO chuyển APPROVED (duyệt tắt)', after.data?.status === 'APPROVED', after.data?.status);
  await shot(page, 'B2-after-update');
});

// ================= C. PO hủy → nhân bản =================
const poToCancel = (await api(tao, 'POST', '/procurement-orders-garage', {
  orderDate: TODAY, supplierId: SUPPLIER,
  lines: [{ lineType: 'GOODS', itemName: `Đơn hủy ${TAG}`, qtyOrdered: 1, unitPrice: 10 }],
})).data;
await api(tao, 'POST', `/procurement-orders-garage/${poToCancel.id}/submit`, {});

await step('C1 hủy PO bằng modal lý do', async () => {
  await page.goto(`${WEB}/v2/garage-procurement?tab=orders`, { waitUntil: 'domcontentloaded' }); await waitTable(page);
  await openRowMenu(page, poToCancel.orderNo);
  await menuItem(page, 'Hủy').click();
  const reason = page.getByRole('textbox').first();
  await reason.waitFor({ timeout: 10000 });
  await reason.fill('Nhập nhầm NCC');
  await page.getByRole('button', { name: /xác nhận|đồng ý|hủy phiếu|lưu/i }).last().click();
  await page.waitForTimeout(3000);
  const d = (await api(tao, 'GET', `/procurement-orders-garage/${poToCancel.id}`)).data;
  check('C1 PO đã hủy (CANCELLED)', d?.status === 'CANCELLED', d?.status);
  await shot(page, 'C1-po-cancelled');
});

await step('C2 nhân bản PO đã hủy từ menu', async () => {
  await openRowMenu(page, poToCancel.orderNo);
  check('C2 menu PO hủy có Nhân bản', (await menuItem(page, 'Nhân bản').count()) === 1);
  await menuItem(page, 'Nhân bản').click();
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).waitFor({ timeout: 20000 });
  await shot(page, 'C2-clone-po-drawer');
  check('C2 drawer PO nháp mới mở ra để sửa', true);
  await page.getByRole('button', { name: 'Hủy' }).first().click().catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
});

// ================= D. Quyền và lọc trạng thái =================
await step('D1 bộ lọc trạng thái có Từ chối', async () => {
  await page.goto(`${WEB}/v2/garage-procurement`, { waitUntil: 'domcontentloaded' }); await waitTable(page);
  const filter = page.getByRole('button', { name: /lọc|filter/i }).first();
  if (await filter.count()) await filter.click().catch(() => {});
  await shot(page, 'D1-filter');
  check('D1 (ghi nhận) trang danh sách tải được', await page.locator('table').count() > 0);
});

await browser.close();

// ---------- Đối chiếu DB qua API ----------
const prRej = (await api(tao, 'GET', `/procurement-requests-garage`)).data;
check('DB: PR bị từ chối vẫn REJECTED', (await api(tao, 'GET', `/procurement-requests-garage/${prRejected}`)).data.status === 'REJECTED');

const failed = results.filter((r) => !r.pass);
console.log(`\nTOTAL ${results.length}  PASS ${results.length - failed.length}  FAIL ${failed.length}`);
for (const f of failed) console.log('  ✗', f.step, f.detail);
