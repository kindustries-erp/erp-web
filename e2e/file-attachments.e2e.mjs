// E2E trang V2 "Quản lý tài liệu": bộ lọc Đã xóa, xóa vĩnh viễn qua modal, cài đặt lưu giữ.
// Dùng admin seed (E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD hoặc E2E_PASSWORD). Chỉ staging/dev, KHÔNG production.
// Dữ liệu test: tạo file qua API rồi xóa mềm; cài đặt lưu giữ được khôi phục về giá trị ban đầu.
// Chạy: bun run e2e:file-attachments
import {
  SHOTS,
  WEB,
  apiCall,
  apiLogin,
  makeChecker,
  openBrowser,
  requireEnv,
  uploadViaApi,
} from "./file-attachments-helpers.mjs";

requireEnv();
const { state, check } = makeChecker();
const call = apiCall(await apiLogin());
const NAME = `e2e-mgmt-${Date.now()}.pdf`;
const original = (await call("GET", "/api/v2/file-attachments/settings")).body
  .data;
const inv = (await call("GET", "/api/v2/invoices?pageSize=1")).body.items[0];
const created = await uploadViaApi(call, inv.id, NAME);
await call("DELETE", `/api/v2/file-attachments/${created.id}`);
const { browser, page } = await openBrowser();
const calls = [];
page.on("response", (res) => {
  if (res.url().includes("/file-attachments"))
    calls.push({ m: res.request().method(), s: res.status(), u: res.url() });
});
try {
  await page.goto(`${WEB}/file-attachments`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("table tbody tr").first().waitFor({ timeout: 30000 });
  check(
    "A1 trang tải danh sách qua /api/v2/file-attachments 200",
    calls.some(
      (c) => c.m === "GET" && c.s === 200 && !c.u.includes("settings"),
    ),
  );
  check(
    "A2 mặc định không gửi deleted=only",
    !calls.some((c) => c.u.includes("deleted=only")),
  );
  check(
    "A3 chưa ở chế độ Đã xóa: không có nút Xóa vĩnh viễn",
    (await page.getByRole("button", { name: /Xóa vĩnh viễn/ }).count()) === 0,
  );

  // Bộ lọc có sẵn nằm trong popover chế độ xem
  // Nút chế độ xem nằm trong header trang (x > 900), khác mục "Tổng quan" ở sidebar
  const viewBtns = page.locator("button", { hasText: "Tổng quan" });
  for (let i = 0; i < (await viewBtns.count()); i++) {
    const box = await viewBtns.nth(i).boundingBox();
    if (box && box.x > 900 && box.y < 120) {
      await viewBtns.nth(i).click();
      break;
    }
  }
  await page
    .locator("[data-radix-popper-content-wrapper]")
    .getByText("Đã xóa", { exact: true })
    .first()
    .click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1500);
  check(
    "B1 chọn Đã xóa gửi deleted=only",
    calls.some((c) => c.u.includes("deleted=only") && c.s === 200),
  );

  await page.getByPlaceholder(/Tìm/).first().fill(NAME);
  const row = page.locator("table tbody tr", { hasText: NAME }).first();
  await row.waitFor({ timeout: 15000 });
  check("B2 file đã xóa mềm hiện ở bộ lọc Đã xóa", true);
  await page.screenshot({ path: `${SHOTS}file-attachments-deleted.png` });

  await row.locator("input[type=checkbox], [role=checkbox]").first().click();
  const purgeBtn = page.getByRole("button", { name: /Xóa vĩnh viễn \(1\)/ });
  await purgeBtn.waitFor({ timeout: 5000 });
  check("C1 chọn dòng: hiện nút Xóa vĩnh viễn (1)", true);
  await purgeBtn.click();
  const modal = page.locator('[role="dialog"], [role="alertdialog"]').last();
  await modal.waitFor({ timeout: 5000 });
  check(
    "C2 xóa vĩnh viễn phải qua modal xác nhận (chưa gọi POST purge)",
    !calls.some((c) => c.m === "POST" && c.u.endsWith("/purge")),
  );
  await modal
    .getByRole("button", { name: "Xóa vĩnh viễn", exact: true })
    .click();
  await page.waitForFunction(
    (n) => !document.querySelector("table tbody")?.innerText.includes(n),
    NAME,
    { timeout: 15000 },
  );
  const purge = calls.find((c) => c.m === "POST" && c.u.endsWith("/purge"));
  check(
    "C3 POST purge thành công và dòng biến khỏi bảng",
    purge?.s === 201 || purge?.s === 200,
    purge?.s,
  );
  const gone = await call("GET", `/api/v2/file-attachments/${created.id}`);
  check("C4 API: bản ghi không còn (404)", gone.status === 404, gone.status);

  // Cài đặt lưu giữ
  await page.getByRole("button", { name: "Cài đặt lưu giữ" }).click();
  const drawer = page.locator('[role="dialog"]').last();
  const sw = drawer.getByRole("switch");
  await sw.waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  check(
    "D1 công tắc phản ánh cài đặt hiện tại",
    (await sw.getAttribute("aria-checked")) ===
      String(original.autoPurgeEnabled),
  );
  await sw.click();
  const days = drawer.locator("input").last();
  await days.fill("0");
  check(
    "D2 số ngày 0 không hợp lệ: nút Lưu bị khóa",
    await drawer.getByRole("button", { name: "Lưu" }).isDisabled(),
  );
  await days.fill("45");
  await drawer.getByRole("button", { name: "Lưu" }).click();
  await page.waitForTimeout(1500);
  const saved = (await call("GET", "/api/v2/file-attachments/settings")).body
    .data;
  check(
    "D3 PATCH settings lưu đúng giá trị",
    saved.autoPurgeEnabled === !original.autoPurgeEnabled &&
      saved.retentionDays === 45,
    JSON.stringify(saved),
  );
} catch (e) {
  check("E2E không lỗi bất ngờ", false, e.message);
  await page
    .screenshot({ path: `${SHOTS}file-attachments-fail.png` })
    .catch(() => {});
} finally {
  await call("PATCH", "/api/v2/file-attachments/settings", {
    autoPurgeEnabled: original.autoPurgeEnabled,
    retentionDays: original.retentionDays,
  });
  await call("DELETE", `/api/v2/file-attachments/${created.id}/permanent`);
  await browser.close();
}
console.log(state.failed ? `\n${state.failed} FAIL` : "\nTất cả PASS");
process.exit(state.failed ? 1 : 0);
