# Enhance Page `tools/loans` (Loan Simulator Layout): Kế Hoạch Triển Khai (`erp-web`)

Tối ưu không gian hiển thị và thao tác cho trang Mô Phỏng & Tính Toán Khoản Vay (`/tools/loans`, áp dụng cho cả chế độ Khách chưa đăng nhập qua `V2PublicToolView` và tab *Mô Phỏng & Tính Nhanh* trong `LoansListPage`): gom hàng nút hành động lên thanh header trên cùng (bỏ trùng lặp nút *Mặc định*), gỡ bỏ card wrapper *Danh Mục Khoản Vay* bên ngoài để giữ trực tiếp các card khoản vay bên trong, và sắp xếp toàn bộ 6 field input trong mỗi card trên 1 hàng duy nhất ở màn hình desktop.

- **Repo / Branch**: `erp/erp-web` (`erp-master`)
- **Track**: `T2` (Module V2 hiện có trong `src/v2/modules/loans/`)
- **Structure**: `/ui-structure` (tuân thủ giới hạn `< 180` LoC, Mobile-First, i18n `v2.loans.*`, No Blue)
- **Consistency Check**: `đạt` (5/5 AC đều ánh xạ tới task cụ thể và lệnh verify thu hẹp)
- **Plane**: không theo dõi (session hiện tại không nạp `plane` MCP và user đã chọn Proceed thực thi trực tiếp)

## 📝 Spec

- **Mục tiêu**: Giảm khoảng trống thừa và bỏ thao tác phân tán ở màn hình `/tools/loans` bằng cách gộp toàn bộ action vào thanh header trên cùng, loại bỏ card lồng card ở danh sách khoản vay, và hiển thị 6 trường thông số trên cùng 1 hàng ngang trên desktop.
- **Tiêu chí chấp nhận**:
  - `AC-1`: Thanh nút trên cùng gom `Mặc định` (`variant="outline"`, duy nhất 1 nút), `+ Thêm khoản vay` (`variant="outline"`), và `Lưu danh mục vào hệ thống ERP` (`variant="primary"`). Giữ bộ đếm `(activeCount/total khoản đang bật)` cạnh subtitle header.
  - `AC-2`: Bỏ hoàn toàn card wrapper và tiêu đề `"Danh Mục Khoản Vay"` bên ngoài; render trực tiếp danh sách `PortfolioLoanCard`.
  - `AC-3`: Trên desktop (`lg:` $\ge 1024\text{px}$), 6 field input trong `PortfolioLoanCard` nằm trên **1 hàng duy nhất** (`grid-cols-[1.35fr_0.95fr_1.05fr_2fr_1.3fr_2fr]`).
  - `AC-4`: Giữ nguyên toàn bộ hành vi thêm/xóa/bật-tắt/cập nhật/đặt lại và lưu draft/ERP.
  - `AC-5`: Mỗi file sửa $< 180$ LoC, 100% i18n, 0 `blue-*`, pass `tsc --noEmit`, ESLint, Prettier và Vitest scoped.

## 📋 Task Breakdown 3 Cấp & DoD

- [x] **Task 2.1.1: Gỡ bỏ wrapper & toolbar khỏi `PortfolioLoanList`** (`34` LoC)
- [x] **Task 2.1.2: Sắp xếp 6 field input trên 1 hàng trong `PortfolioLoanCard` & tách `PortfolioLoanCardFields`** (`76` & `134` LoC)
- [x] **Task 2.2.1: Gom nút và bỏ wrapper ngoài trên `LoanSimulatorPage.desktop.tsx`** (`108` LoC)
- [x] **Task 2.2.2: Gom nút và bỏ wrapper ngoài trên `LoanSimulatorPage.mobile.tsx`** (`115` LoC)
- [x] **Task 4.1.1: Cập nhật Unit Tests cho `LoanSimulatorPage`** (`106` LoC)
- [x] **Task 4.1.2: Kiểm tra quy chuẩn Web (Typecheck, Lint, Prettier, No Blue, LoC)**
- [x] **Task 4.2.1: Đồng bộ Module Skill `loans` & lưu bản plan chốt**

