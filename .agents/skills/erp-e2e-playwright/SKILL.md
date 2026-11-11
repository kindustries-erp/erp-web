---
name: erp-e2e-playwright
description: Quy trình E2E UI cho erp-web bằng Playwright (playwright-core + Chrome có sẵn). Dùng khi cần kiểm tra luồng nhiều bước trên trình duyệt (tạo, duyệt, từ chối, nhân bản, menu, drawer) trên môi trường đang chạy. Không thay unit test Vitest.
---

# ERP Web — E2E Playwright

Phạm vi: kiểm tra luồng thật trên trình duyệt với API đang chạy. Unit test vẫn là `bun run test` (Vitest). E2E chỉ bổ sung cho luồng nhiều trang/nhiều bước.

## 1. Vị trí và cấu hình

- Script: `erp/erp-web/e2e/*.e2e.mjs`. Hiện có `garage-procurement.e2e.mjs` (PR/PO garage và phiếu nhập garage, 87 kiểm tra; mục A–D PR/PO, E nhập kho từ PO, F–G hóa đơn/NCC và nhập nhiều đợt, H xóa vĩnh viễn, I phiếu nhập gắn PO).
- Script `garage-save-and-act.e2e.mjs` (27 kiểm tra): PR Tạo mới/Cập nhật qua modal người duyệt, PO Tạo mới từ PR không còn 409, phiếu nhập Nhập kho một bước và Hoàn nhập. Chạy: `bun run e2e:garage-save-and-act`.
- Chạy: `bun run e2e:garage-procurement` (thêm script mới trong `package.json` theo cùng mẫu).
- Biến môi trường (không hardcode mật khẩu hay URL trong repo):
  - `E2E_PASSWORD`: BẮT BUỘC, mật khẩu tài khoản test. Script thoát mã 2 nếu thiếu.
  - `E2E_WEB_URL` (mặc định `http://127.0.0.1:5173`), `E2E_API_URL` (mặc định `http://localhost:10003`).
  - `E2E_TAO_EMAIL`, `E2E_DUYET_EMAIL`: tài khoản người tạo và người duyệt.
  - `E2E_CHROME_PATH` (mặc định `/usr/bin/google-chrome`).
- Ví dụ: `E2E_PASSWORD='...' bun run e2e:garage-procurement`.
- Ảnh chụp và báo cáo ghi vào `e2e/.artifacts/` (đã gitignore).

## 2. Điều kiện trước khi chạy

1. Vite dev server đang chạy ở `E2E_WEB_URL` (`bun run dev`, đọc `PORT` nếu có). Không tự kill server đang có sẵn của phiên khác.
2. API đang chạy ở `E2E_API_URL` với DB đúng. Trước khi ghi DB phải xác nhận DB bằng `SELECT current_database();` và báo cho người dùng (quy tắc chung của ERP).
3. Tài khoản test có quyền cần thiết. Nếu thiếu quyền thì kiểm tra fail là đúng, không phải lỗi UI.
4. Không chạy E2E trên DB production. Chỉ dùng staging hoặc dev.

## 3. Cách viết kiểm tra mới

- Dùng `check(step, pass, detail)` để ghi kết quả, `step(name, fn)` để bọc từng bước và chụp ảnh khi lỗi.
- Đăng nhập bằng `input[type=email]`, `input[type=password]`, `button[type=submit]`. Chờ ô mật khẩu biến mất.
- Chờ bảng bằng `waitTable(page)` (có một lần reload). Không dùng `waitUntil: 'networkidle'`, vì Vite HMR làm trang không bao giờ idle.
- Trạng thái hiển thị trên UI là tiếng Việt (ví dụ "Nháp", "Đã hủy"), selector phải theo nhãn UI. Các nút và mục menu lấy bằng `getByRole(..., { exact: true })`.
- Tooltip của mục menu bị mờ nằm ở thẻ span bọc ngoài: hover `item.locator('xpath=..')` rồi chờ khoảng 1.5 giây.
- Trạng thái nghiệp vụ (ví dụ PO đã APPROVED) phải poll qua API tối đa vài giây, không chờ cố định. Request có thể chậm hơn thao tác UI.
- Dữ liệu nền tạo qua API (`apiLogin`, `api`) để giảm phụ thuộc UI, nhưng xác nhận kết quả cuối bằng UI.

## 4. Quy tắc bảo mật

- Không commit mật khẩu, token, `.env`, ảnh chụp có dữ liệu thật. Ảnh nằm trong `.artifacts/` đã gitignore.
- Email tài khoản test là dữ liệu cấu hình, không phải secret. Mật khẩu chỉ đi qua biến môi trường.

## 5. Khi kiểm tra fail

1. Xem ảnh `e2e/.artifacts/<step>.png` (hoặc `fail-table-*.png`).
2. Lấy trạng thái thật qua API để tách lỗi app với lỗi test. Ví dụ: PO đã APPROVED trên API nhưng UI chưa cập nhật thì là vấn đề thời gian chờ.
3. Dùng script debug ngắn trong `e2e/` (không commit) để dump nút, dòng bảng, lỗi console.
4. Báo kết quả trung thực: số PASS/FAIL và lý do. Không đổi kỳ vọng để cho qua.

## 6. Bài học đã gặp

- `DRAFT` không khớp nhãn "Nháp": nhớ nhãn tiếng Việt.
- Drawer PO thiếu `directConfirm` ở một nơi render thì nút "Cập nhật" không hiện. Mọi nơi render `ProcurementOrderDrawer` phải truyền prop này.
- Dòng PO garage bắt buộc mã hàng (`itemCode`). Dữ liệu seed thiếu mã sẽ bị chặn bởi validation và trông như lỗi UI.
- Tooltip cần chờ độ trễ của Radix (khoảng 700ms trở lên).
- **Quyền của tài khoản test**: `ai-test-tao` và `ai-test-duyet` không có quyền xóa/purge PO và PR (API trả 403). Mục H chỉ kiểm nhánh âm (menu thường không có "Xóa vĩnh viễn") và ghi INFO; nhánh dương (bộ lọc "Đã xóa mềm" có "Xóa vĩnh viễn") được unit test `useProcurementListTabState.test.tsx` bao phủ. Cần tài khoản có quyền delete + purge để chạy nhánh dương.
- **Selector trong drawer**: bảng dòng của drawer cùng tồn tại với bảng danh sách phía sau, nên scope bằng `[role="dialog"]` trước khi tìm `table tbody tr` hoặc nhãn trùng tên cột (ví dụ "Nhà cung cấp").
- Nút tạo đơn mua tên "Tạo đơn mua" (không phải "Tạo mới"); nút tạo phiếu nhập tên "Tạo phiếu nhập kho".

