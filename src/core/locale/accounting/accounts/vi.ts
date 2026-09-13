export const accountsVi = {
  title: "Hệ thống tài khoản",
  description: "Danh mục tài khoản kế toán và quản lý phân cấp tài khoản",
  code: "Mã TK",
  name: "Tên tài khoản",
  type: "Loại tài khoản",
  parent: "Tài khoản mẹ",
  status: "Trạng thái",
  index: "#",
  createdAt: "Ngày tạo",

  // Types
  asset: "Tài sản",
  liability: "Nợ phải trả",
  equity: "Vốn chủ sở hữu",
  revenue: "Doanh thu",
  expense: "Chi phí",
  other: "Khác",
  ASSET: "Tài sản",
  LIABILITY: "Nợ phải trả",
  EQUITY: "Vốn chủ sở hữu",
  REVENUE: "Doanh thu",
  EXPENSE: "Chi phí",
  OTHER: "Khác",

  // Status
  active: "Đang hoạt động",
  inactive: "Ngừng hoạt động",

  // Table & Filters
  searchPlaceholder: "Tìm theo mã hoặc tên tài khoản...",
  typePlaceholder: "Lọc theo loại tài khoản",
  statusPlaceholder: "Lọc theo trạng thái",
  allTypes: "Tất cả loại",
  allStatuses: "Tất cả trạng thái",
  noData: "Không có dữ liệu tài khoản",
  noDataDesc: "Thử điều chỉnh bộ lọc tìm kiếm hoặc thêm mới tài khoản",

  // Actions
  actions: {
    create: "Thêm mới tài khoản",
    edit: "Chỉnh sửa",
    delete: "Xóa tài khoản",
    viewDetail: "Chi tiết",
  },

  // Drawer
  drawer: {
    titleCreate: "Thêm mới tài khoản kế toán",
    titleEdit: "Chỉnh sửa tài khoản kế toán",
    titleView: "Chi tiết tài khoản: {code}",
    subtitle: "Thông tin chi tiết tài khoản kế toán",
    sectionGeneral: "Thông tin cơ bản",
    sectionSettings: "Trạng thái & Thiết lập",
    codeLabel: "Mã tài khoản",
    codePlaceholder: "Ví dụ: 1111, 1121...",
    nameLabel: "Tên tài khoản",
    namePlaceholder: "Ví dụ: Tiền Việt Nam...",
    typeLabel: "Loại tài khoản",
    typePlaceholder: "Chọn loại tài khoản...",
    parentLabel: "Tài khoản mẹ",
    parentPlaceholder: "Chọn tài khoản mẹ (nếu có)...",
    parentNone: "Không có (Tài khoản gốc cấp 1)",
    statusLabel: "Trạng thái",
    statusActive: "Đang hoạt động",
    statusInactive: "Ngừng hoạt động",
    codeRequired: "Vui lòng nhập mã tài khoản",
    nameRequired: "Vui lòng nhập tên tài khoản",
    typeRequired: "Vui lòng chọn loại tài khoản",
  },

  // Toasts & Dialogs
  toast: {
    createSuccess: "Đã tạo tài khoản kế toán thành công",
    updateSuccess: "Đã cập nhật tài khoản kế toán thành công",
    deleteSuccess: "Đã xóa tài khoản kế toán thành công",
    saveError: "Không thể lưu tài khoản",
    deleteError: "Không thể xóa tài khoản",
  },
  confirm: {
    deleteTitle: "Xác nhận xóa tài khoản",
    deleteMessage:
      'Bạn có chắc chắn muốn xóa tài khoản "{code} - {name}"? Thao tác này không thể hoàn tác.',
    deleteConfirm: "Xóa tài khoản",
    deleteCancel: "Hủy bỏ",
  },
};
