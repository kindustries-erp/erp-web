---
name: erp-e2e-playwright
description: Quy trình E2E UI cho erp-web bằng Playwright (playwright-core + Chrome có sẵn). Dùng khi cần kiểm tra luồng nhiều bước trên trình duyệt (tạo, duyệt, từ chối, nhân bản, menu, drawer) trên môi trường đang chạy. Không thay unit test Vitest.
---

# ERP Web — E2E Playwright

Phạm vi: kiểm tra luồng thật trên trình duyệt với API đang chạy. Unit test vẫn là `bun run test` (Vitest). E2E chỉ bổ sung cho luồng nhiều trang/nhiều bước.

## 1. Vị trí và cấu hình

- Script: `erp/erp-web/e2e/*.e2e.mjs`. Hiện có `garage-procurement.e2e.mjs` (PR/PO garage và phiếu nhập garage, 87 kiểm tra; mục A–D PR/PO, E nhập kho từ PO, F–G hóa đơn/NCC và nhập nhiều đợt, H xóa vĩnh viễn, I phiếu nhập gắn PO).
- Script `garage-save-and-act.e2e.mjs` (27 kiểm tra): PR Tạo mới/Cập nhật qua modal người duyệt, PO Tạo mới từ PR không còn 409, phiếu nhập Nhập kho một bước và Hoàn nhập. Chạy: `bun run e2e:garage-save-and-act`.
- Script `garage-traceability.e2e.mjs` (chỉ đọc, không ghi DB): sơ đồ Chứng từ liên kết của phiếu garage (`/garage-cases?tab=cases`), tự tìm phiếu có ≥2 cạnh qua API, kiểm số node/cạnh trên canvas khớp đồ thị backend (không nhân đôi). Đăng nhập qua `/api/v2/auth-sessions/login`. Chế độ sửa: gỡ node (hộp xác nhận phải bấm được, nằm trên drawer), mở ngăn chọn hóa đơn, rồi Hủy, không lưu. Chạy: `bun run e2e:garage-traceability`.
- Script `invoice-traceability.e2e.mjs` (chỉ đọc): drawer hóa đơn `/erp-invoices-out`, tab Chứng từ liên kết, so node/cạnh canvas với phản hồi `traceability-graph`, kiểm hộp xác nhận gỡ liên kết ở chế độ sửa rồi hủy. Chạy: `bun run e2e:invoice-traceability` (`E2E_INVOICE_ROWS` mặc định 45 dòng đầu để gặp hóa đơn có liên kết).
- Script `users-management.e2e.mjs` (16 kiểm tra): Quản lý tài khoản V2 (tạo qua drawer, ngưng/kích hoạt, đặt lại mật khẩu, kiểm đăng nhập qua auth v1). Bước G (đăng nhập dưới quyền): chỉ `admin@liouni.com` có mục này; với `ai-test-*` script kiểm nhánh âm (G0: menu dòng không có mục "Đăng nhập dưới quyền") và ghi INFO, bỏ qua G1, G2 (có unit test `userRowActions.test.tsx`); không thử đăng nhập admin. Chạy: `bun run e2e:users-management`. Dùng `E2E_PASSWORD` với `E2E_TAO_EMAIL` (ai-test-tao); tài khoản cần quyền `admin_users:manage`, thiếu quyền thì bước quản trị FAIL đúng nghĩa thiếu quyền. Dọn dữ liệu `e2e-users-*` bằng SQL. Xem skill `users-management`.
- Script `employees-management.e2e.mjs` (23 kiểm tra): Quản lý nhân viên V2 (URL `/employees-management`, URL cũ `/erp-employees`, `/v2/employees-management`; tạo/sửa qua drawer, CCCD chỉ hiện bản che, đổi trạng thái, ẩn Xóa khi còn tài khoản liên kết, xóa mềm). Chạy: `bun run e2e:employees-management`. Dùng `E2E_PASSWORD` với `E2E_TAO_EMAIL` (ai-test-tao), cần quyền `employees:*` và `admin_users:manage`; nhân viên test tự xóa mềm, dọn tài khoản `e2e-emp-*` bằng SQL. Xem skill `employees-core`.
- Script `auth-sessions.e2e.mjs`: Auth V2 (đăng nhập từ UI gọi `/api/v2/auth-sessions/login`, 401 tự refresh qua v2 và gọi lại thành công, refresh token được xoay vòng, đổi mật khẩu thu hồi phiên cũ, refresh token bị thu hồi thì UI về màn hình đăng nhập). Chạy: `bun run e2e:auth-sessions`. Dùng `E2E_PASSWORD` với `E2E_TAO_EMAIL` (ai-test-tao); dọn tài khoản `e2e-auth-*` bằng SQL. Xem skill `v2-auth`.
- Script `garage-kanban.e2e.mjs` (8 kiểm tra): tab Tiến độ công việc của drawer dashboard garage, kéo thẻ Báo giá sang Tiếp nhận (API `/progress` trả INTAKE, status bị đánh dấu ghi đè), nút Về trạng thái KGara trả QUOTED. Cần `E2E_SYNC_BRANCH` (= id chi nhánh ERP `branches_management` có xe KGARA_SYNC; từ 2026-11-25 Garage V2 dùng header `x-erp-branch-id`). Tab Kanban trong drawer V1 không gửi chi nhánh vì danh sách xe lấy từ API V1 (chưa lọc theo chi nhánh ERP). Ghi tạm DB staging, `finally` hoàn mọi phiếu bị ghi đè. Chạy: `bun run e2e:garage-kanban`.
- Script `garage-workshop-progress.e2e.mjs` (30 kiểm tra): trang Tiến độ xưởng `/garage-workshop-progress`. Chi nhánh ERP lấy từ `E2E_ERP_BRANCH_ID` hoặc chi nhánh đầu tiên có xe (không còn tra liên kết KGara), đặt `erp-app.currentBranchId` trong localStorage trước khi tải trang, tạo xe NATIVE `E2EW-*` qua API (xóa mềm ở `finally`, cả xe `E2EN-*` tạo trên UI). Desktop: xe mới chưa tự lên bảng, "Thêm xe vào bảng" giữ trạng thái hiện tại và mở drawer, đủ 5 cột status v2, thẻ hiện status v2 + công đoạn, chọn công đoạn bằng combobox (option trong `page`, không trong drawer), ô Người làm gõ có gợi ý (`[data-v2-autocomplete-panel] [role=option]`; DB staging chưa có nhân viên ACTIVE nên chỉ kiểm không còn công tắc) rồi nhập tên tự do, giờ bắt đầu bằng nút "30 phút trước" của `V2DateTimePicker` (không còn `datetime-local` hay `type="time"`; sửa giờ bằng `V2TimePicker`: bấm nút "Bắt đầu lúc – Giờ", chọn option trong listbox "Giờ" rồi "Phút" ở `page` (popover nằm ngoài drawer), phút bước 5 nên làm tròn xuống), ghi chú, sửa giờ một dòng, xóa qua hộp xác nhận, kéo thẻ sang "Đang làm" (API IN_PROGRESS, badge đổi ngay, công đoạn cũ tự đóng), tạo xe mới theo biển số (không chọn thẳng Hoàn thành, có tên khách) rồi bỏ khỏi bảng qua xác nhận. Mobile (390x844, touch): tab "Đang làm" mặc định, ô combobox công đoạn ≥ 44px, chọn công đoạn trong bottom sheet, lưu; ô Trạng thái trong drawer khóa trạng thái sai bảng chuyển, chọn Hủy hiện hộp xác nhận (chưa đổi), xác nhận thì xe sang CANCELLED. Chạy: `bun run e2e:garage-workshop-progress`. Bài học: tiêu đề cột Kanban in hoa bằng CSS nên `innerText` trả chữ hoa, so không phân biệt hoa thường; `V2ConfirmModal` mở trên drawer V2 phải có `className="z-[700]"` và `overlayClassName="z-[699]"`, thiếu thì nút xác nhận bị drawer che.
- Script `garage-workshop-branch-scope.e2e.mjs` (21 kiểm tra): trang Tiến độ xưởng theo chi nhánh ERP. Ô "Phạm vi chi nhánh" mặc định "Chi nhánh đang chọn"; chọn "Tất cả chi nhánh" thì request board không gửi `x-erp-branch-id` và thấy xe không chi nhánh; chọn GR/GN thì gửi đúng id, xe không chi nhánh không hiện; không gọi `external-links`, không còn chữ "KGara"; lọc "Xe OJ" gửi `classification=OJ`, ẩn xe chưa phân loại, hiện xe sau khi PATCH phân loại OJ. Xe `E2EB-*` tạo qua API, `finally` bỏ khỏi bảng và xóa mềm. Cần `E2E_ERP_BRANCH_IDS=<GR>,<GN>`. Chạy: `bun run e2e:garage-workshop-branch-scope`. Bài học: shell (`useEnsureValidCurrentBranch`) luôn ép `currentBranchId` về chi nhánh đầu tiên, nên đặt localStorage rỗng không cho trạng thái "không chọn"; muốn xem mọi chi nhánh phải chọn phạm vi trên trang.
- Script `garage-v1-no-branch.e2e.mjs` (8 kiểm tra, chỉ đọc): trang Vụ việc `/garage-cases?tab=cases` và Công nợ `/garage-debts` của Garage V1 không còn phụ thuộc chi nhánh KGara. Bảng có dòng; tổng phiếu UI bằng API không header; không còn ô chọn chi nhánh KGara; mọi request đọc `/api/v1/greenway/*` không gửi `x-greenway-branch-id`/`x-kgara-branch-id` (trừ `sync`, `dashboard`, `reports/gross-profit-detail` gọi thẳng KGara). Chạy: `bun run e2e:garage-v1-no-branch`.
- Script `garage-cashflow-qr.e2e.mjs` (19 kiểm tra): thông tin thanh toán và QR của phiếu thu chi garage (`/garage-cashflow?tab=vouchers`). Phiếu chi `PAID` tạo qua API (tab "Phiếu thu chi" không hiện phiếu `PENDING`), `page.route` thêm `column_filters` theo mã phiếu vào request list để bảng chỉ còn phiếu test. Kiểm: chế độ xem khóa ô số TK/nội dung và không có nút Lưu; "Chuyển sang chế độ chỉnh sửa" mở khóa, ô số tiền QR vẫn khóa; chọn ngân hàng, nhập số TK/tên/nội dung, QR xem trước là PNG (ảnh cuối có alt "VietQR"; logo VietQR phía trên cùng alt); Lưu gửi PUT 200 có field `qr*`; đọc lại qua API; mở lại thấy giá trị đã lưu và vẫn khóa; "In phiếu" ở footer dựng mẫu in có ảnh QR và số TK trong khối thẻ QR ngang (lấy chữ của tổ tiên cấp 6 của ảnh QR) (`window.print` được stub); mục F mở drawer tạo phiếu (không lưu): mặc định phiếu thu có tài khoản công ty, đổi sang "Chi (PAYMENT)" thì ô số TK về rỗng (chờ effect, không đọc ngay), số TK `0987 654-321` thành `0987654321`, `12/34` hiện lỗi tại ô. `finally` xóa phiếu. Chạy: `bun run e2e:garage-cashflow-qr` (mặc định `ai-test-admin`).
- Script `garage-cashflow-forecast.e2e.mjs` (6 kiểm tra, KINDU-2154): tab Dự thu chi (`/garage-cashflow?tab=forecast`). Phiếu chi `PENDING` tạo qua API, `page.route` thêm `column_filters` theo mã phiếu. Kiểm: trong drawer (Dialog modal) mở "Chọn ngân hàng", lăn chuột trên `role=listbox` thì `scrollTop` tăng; chọn BIDV, nhập số TK, Lưu PUT 200; **không tải lại trang**: request list `tab=forecast` được gọi lại sau khi lưu, mở lại phiếu từ bảng thấy số TK và ngân hàng vừa lưu. Trên code trước KINDU-2154 kịch bản này FAIL 4/6 (không cuộn, không làm mới). `finally` xóa phiếu. Chạy: `bun run e2e:garage-cashflow-forecast`.
- Chạy: `bun run e2e:garage-procurement` (thêm script mới trong `package.json` theo cùng mẫu).
- Biến môi trường (không hardcode mật khẩu hay URL trong repo):
  - `E2E_PASSWORD`: BẮT BUỘC, mật khẩu tài khoản test. Script thoát mã 2 nếu thiếu.
    - Nguồn: dòng `E2E_PASSWORD=` trong `erp/erp-api/.env`. Mỗi lần chạy, nếu shell chưa có biến này thì tự đọc từ file đó, không hỏi người dùng. Không in giá trị, không ghi vào repo hay log.
  - `E2E_WEB_URL`, `E2E_API_URL`: suy từ `PORT` trong `erp/erp-api/.env` theo bảng 10001→5171, 10002→5172, 10003→5173 (`e2e/e2e-ports.mjs`). Chỉ ghi đè khi cần. Không phụ thuộc workspace `repos-dev-0X`.
  - `E2E_TAO_EMAIL` (mặc định `ai-test-tao@example.com`), `E2E_ADMIN_EMAIL` (mặc định `ai-test-admin@example.com`). Đây là tài khoản chuẩn của mọi E2E; không dùng tài khoản admin.
  - `E2E_CHROME_PATH` (mặc định `/usr/bin/google-chrome`).
- Ví dụ (từ `erp-web/`, lấy mật khẩu từ API `.env`, không in ra):
  `E2E_PASSWORD="$(sed -n 's/^E2E_PASSWORD=//p' ../erp-api/.env | head -1 | tr -d "\"'")" bun run e2e:garage-procurement`.
- Ảnh chụp và báo cáo ghi vào `e2e/.artifacts/` (đã gitignore).

## 2. Điều kiện trước khi chạy

1. Vite dev server ở `E2E_WEB_URL` (`http://localhost:<web port>`, port lấy theo bảng ở skill `erp-e2e-api-smoke` mục 2): luôn chạy code mới nhất. Nếu đang nghe thì kiểm `readlink /proc/<pid>/cwd` phải là `erp/erp-web`, dừng PID đó, rồi chạy nền `bun run dev` trong `erp/erp-web` và chờ HTTP 200 (tối đa khoảng 120 giây).
2. API ở `E2E_API_URL` (`http://localhost:<PORT>` lấy từ `erp/erp-api/.env`): luôn chạy code mới nhất. Nếu đang nghe thì kiểm `readlink /proc/<pid>/cwd` phải là `erp/erp-api`, dừng PID đó, rồi chạy nền `bun run start:dev` trong `erp/erp-api` và chờ log `Server đang chạy`. Cổng bị tiến trình của repo khác chiếm thì dừng và báo người dùng. Trước khi ghi DB phải xác nhận DB bằng `SELECT current_database();` và báo cho người dùng (quy tắc chung của ERP).
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
- **Quyền của tài khoản test**: role `Test Tạo` và `Test Admin` có `delete` (xóa mềm) nhưng **không có `purge`** trên PO, PR, phiếu nhập garage. Mục H tự đọc quyền qua `GET /api/v2/auth-sessions/profile`: không có `purge` thì chỉ kiểm nhánh âm (menu thường không có "Xóa vĩnh viễn") và ghi INFO, vì dòng đã xóa mềm không có mục menu nào với người thiếu `purge`; nhánh dương (bộ lọc "Đã xóa mềm" có "Xóa vĩnh viễn") được unit test `useProcurementListTabState.test.tsx` bao phủ. Cần tài khoản có `purge` để chạy nhánh dương. Không cấp `purge` cho role test trên production.
- **Selector trong drawer**: bảng dòng của drawer cùng tồn tại với bảng danh sách phía sau, nên scope bằng `[role="dialog"]` trước khi tìm `table tbody tr` hoặc nhãn trùng tên cột (ví dụ "Nhà cung cấp").
- Nút tạo đơn mua tên "Tạo đơn mua" (không phải "Tạo mới"). Phiếu nhập garage nằm ở `/garage-stock-vouchers` (route `/garage-goods-receipts` đã gỡ ngày 2026-11-17, tham số `?fromOrder=` và `?receipt=` vẫn dùng trên trang này); nút tạo là nút chia tên "Nhập mua hàng" (không còn "Tạo phiếu nhập kho").
- **Chờ response ghi**: `waitForResponse` phải loại `table-preferences` (`!r.url().includes("table-preferences")`), vì `PUT /table-preferences/<tên>-table` chứa tên resource và khớp nhầm khi lọc theo `includes("/procurement-orders-garage")`.
- **Ô dòng hàng của drawer đơn mua**: ô mã và tên dùng placeholder "Mã..." và "Tên hàng...", lấy bằng `getByPlaceholder`, không dùng `getByRole("textbox", { name: "Mã", exact: true })`.
- **Đăng nhập API trong script**: dùng `POST /api/v2/auth-sessions/login` và đọc `data.accessToken`; `/api/v1/auth/login` đã ngừng (410), token rỗng sẽ làm mọi lệnh gọi API trả 401 và các bước đọc dữ liệu lỗi dây chuyền.

