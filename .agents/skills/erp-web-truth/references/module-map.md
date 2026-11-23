<!-- GENERATED FILE - DO NOT EDIT. Sinh bởi .agents/scripts/gen-module-map.sh từ frontmatter modules/*/SKILL.md. Muốn đổi dòng nào: sửa `description` trong frontmatter của module đó rồi chạy /sync-agents. -->
# Bản đồ module

Tra module cần sửa ở bảng dưới, rồi đọc `../../modules/<module>/SKILL.md` của module đó (đường dẫn tính từ thư mục chứa file này).

| Module | Mô tả |
| :--- | :--- |
| `ai-hub` | Tri thức AI Hub phía erp-web V2 (core/ai-hub, bộ component chat nổi dùng chung trong v2/shared, trợ lý AI đọc hóa đơn gắn vào trang garage-p… |
| `app-store` | Module tri thức Quản lý App State, Multi-tab Navigation, Routing, Themes & Core Stores (useAppStore) trong erp-web (core/config/appStore) |
| `audit-logs` | Module tri thức Nhật ký hoạt động V2 trong erp-web gồm lõi src/v2/core/audit và module src/v2/modules/audit-logs (route /v2/admin/audit-logs… |
| `bank-statements` | Tri thức frontend cho drawer xuất Excel sao kê ngân hàng / sổ quỹ tiền mặt (bản V2 trong src/v2/modules/bank-statements) |
| `bom-core` | Module tri thức Định mức vật tư (BOM - Bill of Materials) trong erp-web |
| `business-partners` | Module tri thức Đối tác (Khách hàng & Nhà cung cấp) bản V2 trong erp-web gồm V2 Core (src/v2/core/business-partners) và 2 thin modules (src/… |
| `cash-vouchers` | Tri thức frontend cho drawer tạo mới phiếu thu/chi tiền mặt (bản V2 trong src/v2/modules/cash-vouchers), được cầu nối V1 mở từ tab Sao kê ti… |
| `employees-core` | Module tri thức Nhân viên V2 trong erp-web gồm lõi src/v2/core/employees và thin module src/v2/modules/employees-management (route /v2/emplo… |
| `erp-inventory-adjustments` | Module tri thức Quản lý Kiểm kê & Điều chỉnh Kho trong ERP |
| `erp-inventory-items` | Module tri thức Danh mục Mặt hàng & Master Data Kho trong ERP |
| `erp-inventory-stock` | Module tri thức Sổ Tồn kho Thực tế & Định giá Tồn kho trong ERP |
| `erp-inventory-tracking` | Module tri thức Quản lý Định danh & Truy xuất Nguồn gốc Tồn kho (Serials, VINs, Lots, Custom Barcodes, Serial Lifecycle) trong ERP |
| `erp-inventory-transactions` | Module tri thức Sổ Nhật ký Giao dịch Kho & Sổ cái Phẳng (Inventory Flat Ledger) trong ERP |
| `erp-inventory-vouchers` | Module tri thức Trung tâm Tra cứu Chứng từ Kho Tổng hợp (Warehouse Vouchers Hub) trong ERP |
| `erp-invoice` | Module tri thức Quản lý Hóa đơn Điện tử & Dashboard Hóa đơn (ERP Invoices & Dashboard) trong erp-web |
| `erp-suppliers` | Module tri thức Quản lý Đối Tác Kinh Doanh (Khách Hàng & Nhà Cung Cấp / Business Partners) trong erp-web |
| `file-attachments` | Module web V2 file đính kèm dùng chung - client/hook src/v2/shared/files, organism V2AttachmentsPanel, tab "Tài liệu" ở drawer hóa đơn V2 và… |
| `garage-cases` | Module tri thức Quản lý Vụ việc Dịch vụ Garage & Sửa chữa xe trên erp-web (Frontend) |
| `garage-dashboard` | Module tri thức Dashboard, Báo cáo Hiệu quả Garage, Quản lý Chi phí vận hành (OPEX) & Báo cáo Lợi nhuận (P&L) trong erp-api (kgara-api-core)… |
| `garage-procurement-requests` | Module tri thức Frontend V2 cho Quản lý Đề nghị Mua hàng Garage (Garage Procurement Requests) trong erp-web |
| `inventory-dashboard` | Module tri thức Dashboard Phân tích & Báo cáo Tồn kho Tổng quan trong ERP |
| `inventory-movements-garage` | Module tri thức Frontend V2 cho Chứng từ kho Garage (danh sách gộp nhập mua hàng, nhập khác, xuất, điều chỉnh; thay trang Nhập kho Garage cũ… |
| `items-garage` | Gợi ý mã hàng từ danh mục garage cho bảng dòng chứng từ (PR, PO, phiếu nhận hàng) trong erp-web, gồm LineItemCodeFieldProvider và GarageItem… |
| `loans-tool` | Module tri thức Frontend Quản lý Khoản Vay & Mô Phỏng Dòng Tiền (Loans & Cashflow Simulator V2) trong erp-web (v2/core/loans và v2/modules/l… |
| `production-core` | Module tri thức Quản lý Lệnh sản xuất (Production Orders / Manufacturing Orders) trong erp-web |
| `rbac-core` | Module tri thức Quản lý Phân quyền, Vai trò & RBAC Core (Roles, Permissions & User Role Assignments) trong erp-api (rbac-core) và erp-web |
| `transfer-qr` | Tri thức frontend cho drawer tạo mã QR chuyển khoản VietQR (lõi transfer-qr-core, module transfer-qr-bank-statements, nối vào dropdown Thao … |
| `users-management` | Module tri thức Quản lý tài khoản V2 trong erp-web gồm lõi src/v2/core/users và thin module src/v2/modules/users-management (route /v2/users… |
| `v2-admin-layout` | Module tri thức Kiến trúc Cổng Quản trị & Điều hành ERP V2 (/v2/admin/*) và phân tách hai luồng định tuyến (Nghiệp vụ thường /v2/* vs Cổng q… |
| `v2-auth` | Module tri thức Đăng nhập V2 (V2LoginPage) theo kiến trúc ERP Web v2 (Atomic Design 5 tầng, Platform Split Desktop/Mobile, < 180 LoC, No Blu… |
| `v2-foundation` | Module tri thức nền tảng V2 để dựng một module hoàn chỉnh (lấy erp-invoice làm chuẩn đối chiếu) trong erp-web: router và guard quyền, hook U… |
| `v2-layout` | Module tri thức Kiến trúc Layout V2 (Floating 2-Cards, Platform Split Desktop/Mobile, Topbar 36px, Right Panel, TabBar, Sidebar) trong erp-w… |
| `vinfast-parts-dashboard` | Module tri thức Giao diện Dashboard Tổng quan Phụ tùng VinFast trong erp-web |
| `vinfast-parts-stock` | Module tri thức Giao diện Kho Phụ tùng VinFast (Tổng quan, Ô tô & Xe máy) trong erp-web |
