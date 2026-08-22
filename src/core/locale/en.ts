import type { Dict } from "./vi";
import { navEn } from "@/core/locale/system/nav/en";
import { activityLogsEn } from "@/core/locale/system/activityLogs/en";
import { breadcrumbEn } from "@/core/locale/system/breadcrumb/en";
import { topbarEn } from "@/core/locale/system/topbar/en";
import { loginEn } from "@/core/locale/system/login/en";
import { hoadondientuPageEn } from "@/core/locale/accounting/hoadondientuPage/en";
import { bankStatementEn } from "@/core/locale/accounting/bankStatement/en";
import { commonEn } from "@/core/locale/system/common/en";
import { statusEn } from "@/core/locale/system/status/en";
import { dashboardEn } from "@/core/locale/accounting/dashboard/en";
import { dongtienEn } from "@/core/locale/accounting/dongtien/en";
import { journalEntriesEn } from "@/core/locale/accounting/journalEntries/en";
import { tienmatEn } from "@/core/locale/accounting/tienmat/en";
import { tienguiEn } from "@/core/locale/accounting/tiengui/en";
import { dinhkemEn } from "@/core/locale/system/dinhkem/en";
import { nhansuEn } from "@/core/locale/hr/nhansu/en";
import { doitacEn } from "@/core/locale/sales/doitac/en";
import { inventoryMastersEn } from "@/core/locale/inventory/inventoryMasters/en";
import { inventoryEn } from "@/core/locale/inventory/inventory/en";
import { thietlapEn } from "@/core/locale/settings/thietlap/en";
import { tableEn } from "@/core/locale/system/table/en";
import { panelEn } from "@/core/locale/accounting/panel/en";
import { importModalEn } from "@/core/locale/accounting/importModal/en";
import { voucherEn } from "@/core/locale/accounting/voucher/en";
import { permissionMatrixEn } from "@/core/locale/settings/permissionMatrix/en";
import { rbacEn } from "@/core/locale/settings/rbac/en";
import { activitylogEn } from "@/core/locale/system/activitylog/en";
import { profileEn } from "@/core/locale/hr/profile/en";
import { passwordModalEn } from "@/core/locale/hr/passwordModal/en";
import { phongbanEn } from "@/core/locale/hr/phongban/en";
import { chucvuEn } from "@/core/locale/hr/chucvu/en";
import { settingsEn } from "@/core/locale/settings/settings/en";
import { confirmModalEn } from "@/core/locale/system/confirmModal/en";
import { errorPagesEn } from "@/core/locale/system/errorPages/en";
import { phaithuEn } from "@/core/locale/accounting/phaithu/en";
import { phaittraEn } from "@/core/locale/accounting/phaittra/en";
import { reportsEn } from "@/core/locale/accounting/reports/en";
import { ledgerEn } from "@/core/locale/accounting/ledger/en";
import { apiErrorsEn } from "@/core/locale/system/apiErrors/en";
import { pwaEn } from "@/core/locale/system/pwa/en";
import { apiToastEn } from "@/core/locale/system/apiToast/en";
import { connectionGraphEn } from "@/core/locale/manufacturing/connectionGraph/en";
import { accountsEn } from "@/core/locale/accounting/accounts/en";
import { globalSettingsEn } from "@/core/locale/system/globalSettings/en";
import { attachmentsEn } from "@/core/locale/system/attachments/en";
import { legacyStringsEn } from "@/core/locale/system/legacyStrings/en";
import { inventoryTrackingLotEn } from "@/core/locale/inventory/inventoryTrackingLot/en";
import { inventoryTrackingCustomEn } from "@/core/locale/inventory/inventoryTrackingCustom/en";
import { bomConfigEn } from "@/core/locale/manufacturing/bomConfig/en";
import { changelogEn } from "@/core/locale/system/changelog/en";

export const en: Dict = {
  nav: navEn,
  activityLogs: activityLogsEn,
  breadcrumb: breadcrumbEn,
  topbar: topbarEn,
  login: loginEn,
  hoadondientuPage: hoadondientuPageEn,
  bankStatement: bankStatementEn,
  common: commonEn,
  status: statusEn,
  dashboard: dashboardEn,
  dongtien: dongtienEn,
  journalEntries: journalEntriesEn,
  tienmat: tienmatEn,
  tiengui: tienguiEn,
  dinhkem: dinhkemEn,
  nhansu: nhansuEn,
  doitac: doitacEn,
  inventoryMasters: inventoryMastersEn,
  inventory: inventoryEn,
  thietlap: thietlapEn,
  table: tableEn,
  panel: panelEn,
  importModal: importModalEn,
  voucher: voucherEn,
  permissionMatrix: permissionMatrixEn,
  rbac: rbacEn,
  activitylog: activitylogEn,
  profile: profileEn,
  passwordModal: passwordModalEn,
  phongban: phongbanEn,
  chucvu: chucvuEn,
  settings: settingsEn,
  confirmModal: confirmModalEn,
  errorPages: errorPagesEn,
  phaithu: phaithuEn,
  phaittra: phaittraEn,
  reports: reportsEn,
  ledger: ledgerEn,
  apiErrors: apiErrorsEn,
  pwa: pwaEn,
  apiToast: apiToastEn,
  "Đơn mua hàng": legacyStringsEn["Đơn mua hàng"],
  "Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.":
    legacyStringsEn[
      "Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho."
    ],
  "Nhà cung cấp": legacyStringsEn["Nhà cung cấp"],
  "Tất cả nhà cung cấp": legacyStringsEn["Tất cả nhà cung cấp"],
  "Linh kiện": legacyStringsEn["Linh kiện"],
  "Tất cả linh kiện": legacyStringsEn["Tất cả linh kiện"],
  "Số PO": legacyStringsEn["Số PO"],
  "Ngày đặt": legacyStringsEn["Ngày đặt"],
  "Ngày nhập DK": legacyStringsEn["Ngày nhập DK"],
  "Tải lại": legacyStringsEn["Tải lại"],
  "Bộ lọc": legacyStringsEn["Bộ lọc"],
  "Chi tiết": legacyStringsEn["Chi tiết"],
  "Nhập kho": legacyStringsEn["Nhập kho"],
  Xóa: legacyStringsEn["Xóa"],
  Hủy: legacyStringsEn["Hủy"],
  "Hủy phiếu": legacyStringsEn["Hủy phiếu"],
  "Tạo mới": legacyStringsEn["Tạo mới"],
  "Tìm số CT, đối tượng...": legacyStringsEn["Tìm số CT, đối tượng..."],
  "Chọn kỳ...": legacyStringsEn["Chọn kỳ..."],
  "Từ ngày": legacyStringsEn["Từ ngày"],
  "Đến ngày": legacyStringsEn["Đến ngày"],
  "Tất cả": legacyStringsEn["Tất cả"],
  "Lệnh Sản Xuất": legacyStringsEn["Lệnh Sản Xuất"],
  "Quản lý và theo dõi tiến độ lệnh sản xuất.":
    legacyStringsEn["Quản lý và theo dõi tiến độ lệnh sản xuất."],
  "Chưa có lệnh sản xuất nào": legacyStringsEn["Chưa có lệnh sản xuất nào"],
  "Reference No": legacyStringsEn["Reference No"],
  "Trạng thái": legacyStringsEn["Trạng thái"],
  "Thành phẩm": legacyStringsEn["Thành phẩm"],
  "Tiến độ": legacyStringsEn["Tiến độ"],
  "Ngày bắt đầu": legacyStringsEn["Ngày bắt đầu"],
  "Ngày kết thúc": legacyStringsEn["Ngày kết thúc"],
  "Tiến hành sản xuất": legacyStringsEn["Tiến hành sản xuất"],
  "Tiếp tục sản xuất": legacyStringsEn["Tiếp tục sản xuất"],
  "Cập nhật": legacyStringsEn["Cập nhật"],
  "Xem chi tiết": legacyStringsEn["Xem chi tiết"],
  "Xóa lệnh": legacyStringsEn["Xóa lệnh"],
  "Hủy lệnh": legacyStringsEn["Hủy lệnh"],
  "Chi tiết Lệnh Sản Xuất": legacyStringsEn["Chi tiết Lệnh Sản Xuất"],
  "Cập nhật Lệnh Sản Xuất": legacyStringsEn["Cập nhật Lệnh Sản Xuất"],
  "Tạo mới Lệnh Sản Xuất": legacyStringsEn["Tạo mới Lệnh Sản Xuất"],
  "Nhập thông tin lệnh": legacyStringsEn["Nhập thông tin lệnh"],
  "Số lượng kế hoạch": legacyStringsEn["Số lượng kế hoạch"],
  "Đã sản xuất": legacyStringsEn["Đã sản xuất"],
  "Ngày bắt đầu (kế hoạch)": legacyStringsEn["Ngày bắt đầu (kế hoạch)"],
  "Ngày hoàn thành (kế hoạch)": legacyStringsEn["Ngày hoàn thành (kế hoạch)"],
  "Tự động nếu để trống": legacyStringsEn["Tự động nếu để trống"],

  "Thông tin quản lý": legacyStringsEn["Thông tin quản lý"],
  "Tiến trình sản xuất": legacyStringsEn["Tiến trình sản xuất"],
  "Chọn thành phẩm": legacyStringsEn["Chọn thành phẩm"],
  "Tìm SKU / tên thành phẩm": legacyStringsEn["Tìm SKU / tên thành phẩm"],
  "CHI TIẾT BOM": legacyStringsEn["CHI TIẾT BOM"],
  "Tìm kiếm mã / tên...": legacyStringsEn["Tìm kiếm mã / tên..."],
  "Không có dữ liệu BOM hoặc chưa chọn thành phẩm":
    legacyStringsEn["Không có dữ liệu BOM hoặc chưa chọn thành phẩm"],
  "Mã kho": legacyStringsEn["Mã kho"],
  "Tự động theo tháng (MO-YYYYMMXXXX)":
    legacyStringsEn["Tự động theo tháng (MO-YYYYMMXXXX)"],
  "Lưu Nháp": legacyStringsEn["Lưu Nháp"],
  "Tạo Lệnh Sản Xuất": legacyStringsEn["Tạo Lệnh Sản Xuất"],
  "Phiên bản BOM": legacyStringsEn["Phiên bản BOM"],
  "Chọn ngày": legacyStringsEn["Chọn ngày"],
  "Chọn phiên bản BOM": legacyStringsEn["Chọn phiên bản BOM"],
  "Tìm BOM": legacyStringsEn["Tìm BOM"],
  "Mã Linh Kiện": legacyStringsEn["Mã Linh Kiện"],
  "Chỉ hiện NVL thiếu": legacyStringsEn["Chỉ hiện NVL thiếu"],
  "Nguyên vật liệu (BOM)": legacyStringsEn["Nguyên vật liệu (BOM)"],
  "Mã NVL": legacyStringsEn["Mã NVL"],
  "Tên NVL": legacyStringsEn["Tên NVL"],
  "Định mức": legacyStringsEn["Định mức"],
  "Tồn kho": legacyStringsEn["Tồn kho"],
  "Đơn vị": legacyStringsEn["Đơn vị"],
  "Mã hàng thay thế": legacyStringsEn["Mã hàng thay thế"],
  "Chọn hàng thay thế": legacyStringsEn["Chọn hàng thay thế"],
  "Tìm hàng thay thế": legacyStringsEn["Tìm hàng thay thế"],
  "Xóa thay thế": legacyStringsEn["Xóa thay thế"],
  "Chưa có nguyên vật liệu nào": legacyStringsEn["Chưa có nguyên vật liệu nào"],
  "Xóa lệnh sản xuất nháp": legacyStringsEn["Xóa lệnh sản xuất nháp"],
  "Hủy lệnh sản xuất": legacyStringsEn["Hủy lệnh sản xuất"],
  "Xác nhận xóa": legacyStringsEn["Xác nhận xóa"],
  "Xác nhận hủy": legacyStringsEn["Xác nhận hủy"],
  "Đã hủy lệnh sản xuất": legacyStringsEn["Đã hủy lệnh sản xuất"],
  "Đã xóa lệnh sản xuất nháp": legacyStringsEn["Đã xóa lệnh sản xuất nháp"],
  "Không thể tải danh sách lệnh sản xuất":
    legacyStringsEn["Không thể tải danh sách lệnh sản xuất"],
  "Không thể hủy lệnh": legacyStringsEn["Không thể hủy lệnh"],
  "Không thể xóa lệnh": legacyStringsEn["Không thể xóa lệnh"],
  "Lỗi tải chi tiết lệnh": legacyStringsEn["Lỗi tải chi tiết lệnh"],
  "Lỗi tải chi tiết": legacyStringsEn["Lỗi tải chi tiết"],
  "Đang tải chi tiết lệnh...": legacyStringsEn["Đang tải chi tiết lệnh..."],
  "Tiến độ sản xuất": legacyStringsEn["Tiến độ sản xuất"],
  "Thông tin chung": legacyStringsEn["Thông tin chung"],
  "Hành động": legacyStringsEn["Hành động"],
  "Mã lệnh": legacyStringsEn["Mã lệnh"],
  "Kho sản xuất": legacyStringsEn["Kho sản xuất"],
  "Bắt đầu sản xuất tất cả": legacyStringsEn["Bắt đầu sản xuất tất cả"],
  "Bắt đầu sản xuất thành công": legacyStringsEn["Bắt đầu sản xuất thành công"],
  "Không thể bắt đầu sản xuất": legacyStringsEn["Không thể bắt đầu sản xuất"],
  "Sản xuất hàng loạt": legacyStringsEn["Sản xuất hàng loạt"],
  "Còn lại": legacyStringsEn["Còn lại"],
  "Hoàn thành nhiều đơn vị": legacyStringsEn["Hoàn thành nhiều đơn vị"],
  "Nhập số lượng thành phẩm hoàn thành":
    legacyStringsEn["Nhập số lượng thành phẩm hoàn thành"],
  "Số lượng hoàn thành": legacyStringsEn["Số lượng hoàn thành"],
  "Đơn giá nhập kho": legacyStringsEn["Đơn giá nhập kho"],
  "Đã hoàn thành sản xuất hàng loạt":
    legacyStringsEn["Đã hoàn thành sản xuất hàng loạt"],
  "Hoàn thành từng đơn vị": legacyStringsEn["Hoàn thành từng đơn vị"],
  "còn lại": legacyStringsEn["còn lại"],
  "Hoàn thành 1 đơn vị": legacyStringsEn["Hoàn thành 1 đơn vị"],
  "Đã hoàn thành 1 đơn vị": legacyStringsEn["Đã hoàn thành 1 đơn vị"],
  "Lệnh sản xuất đã hoàn thành": legacyStringsEn["Lệnh sản xuất đã hoàn thành"],
  "Số lượng không hợp lệ": legacyStringsEn["Số lượng không hợp lệ"],
  "Không thể hoàn thành": legacyStringsEn["Không thể hoàn thành"],
  "Đang xử lý...": legacyStringsEn["Đang xử lý..."],
  Đóng: legacyStringsEn["Đóng"],
  "Xác nhận": legacyStringsEn["Xác nhận"],
  Huỷ: legacyStringsEn["Huỷ"],
  connectionGraph: connectionGraphEn,
  accounts: accountsEn,
  "Quản lý đơn bán hàng và reserve tồn kho.":
    legacyStringsEn["Quản lý đơn bán hàng và reserve tồn kho."],
  "Chưa có đơn bán hàng nào": legacyStringsEn["Chưa có đơn bán hàng nào"],
  "Số SO": legacyStringsEn["Số SO"],
  "Khách hàng": legacyStringsEn["Khách hàng"],
  "Ngày đơn": legacyStringsEn["Ngày đơn"],
  Reserve: legacyStringsEn["Reserve"],
  Unreserve: legacyStringsEn["Unreserve"],
  "Chỉnh sửa": legacyStringsEn["Chỉnh sửa"],
  globalSettings: globalSettingsEn,
  attachments: attachmentsEn,
  inventoryTrackingLot: inventoryTrackingLotEn,
  inventoryTrackingCustom: inventoryTrackingCustomEn,
  bomConfig: bomConfigEn,
  changelog: changelogEn,
};
