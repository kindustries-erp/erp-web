export const moduleConfigVi = {
  title: "Cấu hình trường tùy chỉnh",
  subtitleUnified:
    "Quản lý danh mục & các thuộc tính động cấu hình theo từng phân hệ",
  livePreviewTitle: "Xem trước Form thực tế",
  livePreviewDesc:
    "Mô phỏng trực tiếp cách các trường tùy chỉnh sẽ hiển thị trên Drawer chứng từ thực tế.",
  selectCategoryPreview: "Chọn danh mục thử nghiệm:",
  selectCatPlaceholder: "Chọn danh mục",
  noActiveCategoriesPreview:
    "Chưa có danh mục nào được tạo. Hãy thêm danh mục ở cột trái.",
  noAttrsToPreview: "Danh mục này chưa có thuộc tính nào.",
  attrsCount: "thuộc tính",
  categoriesCount: "danh mục",
  optionsCount: "tùy chọn",
  addCategory: "Thêm danh mục",
  newCategory: "Tạo danh mục mới",
  editCategory: "Chỉnh sửa danh mục",
  catCode: "Mã danh mục",
  catName: "Tên danh mục",
  catDescription: "Mô tả",
  creatingCategoryHint: "Đang tạo danh mục mới...",
  editingCategoryHint: "Đang sửa: {{name}}",
  noCategories: "Chưa có danh mục nào được định nghĩa.",
  noCategoriesHint: "Bấm 'Thêm danh mục' ở trên để bắt đầu cấu hình.",
  noAttrs: "Chưa có thuộc tính nào trong danh mục này.",
  addAttr: "Thêm thuộc tính",
  editAttr: "Chỉnh sửa thuộc tính",
  attrCode: "Mã thuộc tính",
  attrName: "Tên hiển thị",
  attrFieldType: "Kiểu dữ liệu",
  attrConstraint: "Ràng buộc dữ liệu",
  isRequired: "Bắt buộc nhập",
  requiredHint: "Required",
  requiredBadge: "Bắt buộc",
  used: "đang dùng",
  selectTypePlaceholder: "Chọn kiểu dữ liệu",
  selectOptionsTitle: "Danh sách tùy chọn (Dropdown Options)",
  noOptionsHint:
    "Chưa có tùy chọn nào. Nhập Mã & Tên ở trên rồi bấm Thêm (hoặc nhấn phím Enter).",
  deleteCatTitle: "Xóa danh mục",
  deleteCatMsg:
    'Bạn có chắc chắn muốn xóa danh mục "{{name}}"? Nếu có dữ liệu đang sử dụng, hệ thống sẽ yêu cầu chuyển sang Ngừng hoạt động.',
  deleteAttrTitle: "Xóa thuộc tính",
  deleteAttrMsg:
    'Bạn có chắc chắn muốn xóa thuộc tính "{{name}}"? Nếu đã có dữ liệu sử dụng, vui lòng chuyển sang trạng thái Ngừng hoạt động.',
  catCreated: "Tạo danh mục thành công",
  catUpdated: "Cập nhật danh mục thành công",
  catDeleted: "Xóa danh mục thành công",
  catCreateError: "Lỗi tạo danh mục",
  catUpdateError: "Lỗi cập nhật danh mục",
  catDeleteDeleteError: "Lỗi xóa danh mục",
  catValidation: "Vui lòng nhập đầy đủ mã và tên danh mục",
  catCodeDuplicate: 'Mã danh mục "{{code}}" đã tồn tại. Vui lòng chọn mã khác.',
  attrCreated: "Tạo thuộc tính thành công",
  attrUpdated: "Cập nhật thuộc tính thành công",
  attrDeleted: "Xóa thuộc tính thành công",
  attrCreateError: "Lỗi tạo thuộc tính",
  attrUpdateError: "Lỗi cập nhật thuộc tính",
  attrDeleteError: "Lỗi xóa thuộc tính",
  attrValidation: "Vui lòng nhập đầy đủ mã và tên thuộc tính",
  attrCodeDuplicate: 'Mã thuộc tính "{{code}}" đã tồn tại trong danh mục này.',
  selectOptionsRequired: "Kiểu Combobox yêu cầu ít nhất 1 option lựa chọn.",
  optionRequired: "Vui lòng nhập cả Mã (Key) và Tên hiển thị (Label)",
  optionLabelRequired: "Tên hiển thị không được để trống",
  optionKeyDuplicate: 'Mã option "{{key}}" đã tồn tại. Vui lòng chọn mã khác.',
  optionInUseTooltip:
    "Đang có {{count}} bản ghi sử dụng tùy chọn này, không thể xóa",
  optionInUseBadge: "{{count}} bản ghi",
  confirmDeleteOptionTitle: "Xóa tùy chọn",
  confirmDeleteOptionMsg:
    'Bạn có chắc chắn muốn xóa tùy chọn "{{label}}" ({{value}})?',
  systemAttributesTitle: "THUỘC TÍNH MẶC ĐỊNH",
  systemAttributes: "Thuộc tính mặc định",
  editSystemAttr: "Chỉnh sửa thuộc tính mặc định",
  systemAttrNotice:
    "Thuộc tính mặc định: Mã và Kiểu dữ liệu được cố định để bảo vệ tính toàn vẹn dữ liệu. Bạn có thể tùy chỉnh Tên hiển thị, Ràng buộc bắt buộc và Danh sách các lựa chọn (Options).",
  systemFieldsPreviewTitle: "Thuộc tính mặc định",
  customFieldsPreviewTitle: "Thuộc tính tùy chỉnh",
  loadError: "Không thể tải danh sách cấu hình danh mục & thuộc tính.",

  domains: {
    finance: "Kế toán & Tài chính",
    production: "Sản xuất & Kỹ thuật",
    commerce: "Mua hàng & Bán hàng",
    inventory: "Kho vận & Tồn kho",
    garage: "Garage & Dịch vụ",
  },

  modules: {
    invoice: {
      name: "Hóa đơn & Thuế",
      desc: "Hóa đơn mua vào/bán ra, chi phí thuế & khấu trừ",
    },
    bankTxn: {
      name: "Sao kê & Sổ quỹ",
      desc: "Giao dịch ngân hàng, sổ quỹ tiền mặt, định khoản hạch toán",
    },
    bom: {
      name: "Định mức (BOM)",
      desc: "Định mức vật tư linh kiện, phụ tùng và cụm chi tiết lắp ráp",
    },
    production: {
      name: "Lệnh sản xuất",
      desc: "Tiến độ lắp ráp xe, cấp phát linh kiện & bàn giao thành phẩm",
    },
    po: {
      name: "Mua hàng (PO)",
      desc: "Đơn mua hàng, theo dõi tiến độ nhập và đối chiếu nhà cung cấp",
    },
    so: {
      name: "Bán hàng (SO)",
      desc: "Đơn đặt hàng khách lẻ, đại lý phân phối & giao hàng",
    },
    item: {
      name: "Mặt hàng & SKU",
      desc: "Danh mục master data mặt hàng, quy cách và đơn vị tính",
    },
    adjustment: {
      name: "Kiểm kê kho",
      desc: "Biên bản kiểm kê kho, xử lý chênh lệch thừa/thiếu tồn kho",
    },
    garageCase: {
      name: "Vụ việc Garage",
      desc: "Hồ sơ tiếp nhận xe, lệnh dịch vụ sửa chữa & báo giá",
    },
    afterSales: {
      name: "Bảo hành & Bàn giao",
      desc: "Vòng đời serial xe/pin, bàn giao xe và kích hoạt bảo hành điện tử",
    },
  },

  fieldTypes: {
    text: {
      label: "Văn bản (Text)",
      subLabel: "Chuỗi ký tự tự do, ghi chú, mã hiệu",
      short: "Văn bản",
    },
    number: {
      label: "Số (Number)",
      subLabel: "Số lượng, kích thước, thông số kỹ thuật",
      short: "Số",
    },
    select: {
      label: "Danh sách chọn (Combobox)",
      subLabel: "Danh sách tùy chọn dropdown cố định",
      short: "Danh sách",
    },
    date: {
      label: "Ngày tháng (Date)",
      subLabel: "Thời gian, ngày cấp, hạn sử dụng",
      short: "Ngày",
    },
    checkbox: {
      label: "Đúng / Sai (Boolean)",
      subLabel: "Công tắc bật/tắt (True/False)",
      short: "Đúng/Sai",
    },
  },
};
