export const budgetVi = {
  pageTitle: "Chi phí vận hành",
  pageDesc:
    "Quản lý các khoản chi phí vận hành, chi phí định kỳ và dự báo dòng tiền toàn công ty",
  colIndex: "#",
  colPeriod: "Kỳ báo cáo",
  colCostGroup: "Nhóm chi phí",
  colCategoryKey: "Loại chi phí",
  colDocNo: "Mã chi phí",
  colTitle: "Nội dung / Diễn giải",
  colCategory: "Danh mục",
  colType: "Loại khoản chi",
  colCycle: "Chu kỳ lặp",
  colRecurrenceUntil: "Hạn kết thúc",
  colDocDate: "Ngày phát sinh",
  colNextDueDate: "Hạn thanh toán",
  colAmount: "Số tiền",
  colPaymentStatus: "Thanh toán",
  colStatus: "Trạng thái",
  colNotes: "Ghi chú",
  colSupplier: "Nhà cung cấp / Đối tác",

  // Toolbar Tabs
  tabs: {
    all: "Tất cả",
    opex: "CP Vận hành",
    cogs: "Giá vốn (COGS)",
    commission: "Hoa hồng & Bán hàng",
  },

  // Cost Groups
  costGroups: {
    OPEX: "CP Vận hành",
    COGS: "Giá vốn (COGS)",
    COMMISSION: "Hoa hồng",
  },

  // Categories
  categories: {
    NHAN_SU_LUONG: "Nhân sự & Tiền lương",
    THUE_MAT_BANG: "Thuê văn phòng / Mặt bằng",
    DIEN_NUOC_NET: "Điện, Nước & Viễn thông",
    DUNG_CU_VP: "Dụng cụ & Văn phòng phẩm",
    PHAN_MEM_IT: "Phần mềm, Server & IT",
    BAO_TRI: "Bảo trì & Sửa chữa",
    KHAU_HAO: "Khấu hao tài sản & Thiết bị",
    CONG_TAC_PHI: "Công tác phí & Tiếp khách",
    KHAC: "Chi phí vận hành khác",
    THAU_PHU_GIA_CONG: "Thuê ngoài & Gia công phụ trợ",
    VAN_CHUYEN_LOGISTICS: "Vận chuyển, Giao nhận & Logistics",
    CHI_PHI_TRUC_TIEP_KHAC: "Chi phí trực tiếp khác",
    HOA_HONG_KINH_DOANH: "Hoa hồng kinh doanh / Sale",
    MARKETING_QC: "Marketing & Quảng cáo",
    CHIET_KHAU_TM: "Chiết khấu thương mại & Khuyến mãi",
    HOA_HONG_KHAC: "Thưởng & Hoa hồng khác",
  },

  // Drawer
  drawer: {
    createTitle: "Thêm khoản chi vận hành",
    viewTitle: "Chi tiết khoản chi vận hành",
    editTitle: "Chỉnh sửa khoản chi vận hành",
    duplicateTitle: "Nhân đôi khoản chi phí",
    sectionInfo: "Thông tin chi phí",
    periodMonth: "Tháng",
    periodYear: "Năm",
    costGroupLabel: "Nhóm chi phí (*)",
    selectCostGroup: "— Chọn nhóm chi phí —",
    categoryKeyLabel: "Loại chi phí chi tiết (*)",
    selectCategory: "— Chọn loại chi phí —",
    titleLabel: "Nội dung / Diễn giải (*)",
    titlePlaceholder: "Nhập mô tả chi tiết khoản chi...",
    amountLabel: "Số tiền (VND) (*)",
    paymentStatusLabel: "Trạng thái thanh toán",
    notesLabel: "Ghi chú",
    notesPlaceholder: "Ghi chú bổ sung nếu có...",
    sectionRecurring: "Phát sinh chi phí định kỳ",
    enableRecurring: "Lặp lại định kỳ hàng tháng",
    enableRecurringDesc:
      "Tự động áp dụng và đồng bộ số tiền cho các kỳ tháng tiếp theo",
    recurringConfigHeader: "Cấu hình chu kỳ & thời hạn lặp lại",
    recurrenceType: "Chu kỳ lặp lại",
    untilMonth: "Áp dụng đến Tháng",
    untilYear: "Năm kết thúc",
  },

  // Recurring Modal
  recurringModal: {
    title: "Áp dụng thay đổi định kỳ",
    desc: "Khoản chi phí này thuộc chuỗi định kỳ lặp lại hàng tháng của doanh nghiệp. Vui lòng chọn phạm vi áp dụng thay đổi:",
    scopeThis: "Chỉ áp dụng cho phiếu tháng này",
    scopeThisDesc:
      "Chỉ thay đổi số tiền / thông tin của kỳ hiện tại. Các tháng khác giữ nguyên.",
    scopeThisAndFuture: "Phiếu này và tất cả các phiếu về sau",
    scopeThisAndFutureDesc:
      "Cập nhật từ {{from}} đến {{to}} (tổng cộng {{count}} kỳ định kỳ).",
    category: "Khoản chi",
    newAmount: "Số tiền áp dụng",
    confirmApply: "Xác nhận áp dụng",
  },

  // Actions
  actionView: "Xem chi tiết",
  actionEdit: "Chỉnh sửa",
  actionDuplicate: "Nhân đôi",
  actionDelete: "Xóa",
  actionAdd: "Thêm",
  actionSave: "Lưu thay đổi",
  actionCancel: "Hủy",
  close: "Đóng",
  saving: "Đang lưu...",
  createExpense: "Thêm khoản chi",

  // Alerts & Messages
  deleteSuccess: "Đã xóa khoản chi thành công",
  deleteError: "Xóa khoản chi thất bại",
  createSuccess: "Đã thêm khoản chi phí mới",
  createRecurringSuccess:
    "Đã tạo khoản chi và phát sinh định kỳ đến {{month}}/{{year}}",
  updateSuccess: "Đã cập nhật khoản chi phí",
  applyScopeThisSuccess: "Đã cập nhật chi phí cho phiếu tháng này",
  applyScopeFutureSuccess: "Đã cập nhật chuỗi chi phí định kỳ ({{count}} kỳ)",
  invalidAmount: "Số tiền phải là số hợp lệ và lớn hơn hoặc bằng 0",
  missingTitle: "Vui lòng nhập nội dung / diễn giải khoản chi",

  confirmDeleteTitle: "Xác nhận xóa khoản chi",
  confirmDeleteDesc:
    "Bạn có chắc chắn muốn xóa khoản chi này không? Thao tác này không thể hoàn tác.",

  emptyList: "Không có khoản chi phí nào.",
  emptyListHint:
    "Bấm 'Thêm khoản chi' để tạo mới khoản chi phí vận hành doanh nghiệp.",

  cycleOneTime: "Một lần",
  cycleMonthly: "Hàng tháng",
  cycleQuarterly: "Hàng quý",
  cycleYearly: "Hàng năm",

  statusDraft: "Nháp",
  statusConfirmed: "Đã xác nhận",
  statusCancelled: "Đã hủy",

  paymentUnpaid: "Chưa TT",
  paymentPartial: "TT 1 phần",
  paymentPaid: "Đã TT",

  allPayment: "Tất cả thanh toán",
  allCycle: "Tất cả chu kỳ",
  monthLabel: "Tháng",
  yearLabel: "Năm",
  countSuffix: "khoản chi",
  summaryTotal: "Tổng cộng",

  // Action Groups
  groupTraCuu: "TRA CỨU",
  groupThaoTac: "THAO TÁC",
};
