export const v2Vi = {
  v2: {
    common: {
      close: "Đóng",
      save: "Lưu",
      cancel: "Hủy",
      loading: "Đang tải...",
      error: "Đã xảy ra lỗi",
      actions: "Thao tác",
      overview: "Tổng quan",
    },
    sidebar: {
      appName: "ERP",
      appSubtitle: "Hệ thống quản trị doanh nghiệp",
      collapse: "Thu gọn thanh bên",
      expand: "Mở rộng thanh bên",
      notifications: "Thông báo",
      userFallback: "Quản trị viên",
      toggleSidebar: "Thu gọn / Mở rộng",
    },
    topbar: {
      quickSearchPlaceholder: "Tìm kiếm menu, chứng từ (Ctrl K)...",
      quickSearchShortcut: "Ctrl K",
      quickSearchAria: "Tìm kiếm nhanh hệ thống",
      languageSwitchAria: "Chuyển đổi ngôn ngữ hiển thị",
      selectLanguage: "Chọn ngôn ngữ",
      branchLabel: "Chi nhánh",
      languageVi: "Tiếng Việt",
      languageEn: "English",
      mainBranch: "Chi nhánh chính",
    },
    tabBar: {
      ariaLabel: "Thanh tab đa nhiệm",
      closeTab: "Đóng tab {{name}}",
      closeTabShort: "Đóng tab",
    },
    welcome: {
      badgeReady: "Nền tảng V2 Sẵn sàng",
      heroTitle: "Khung Ứng Dụng ERP V2",
      heroSubtitle:
        "Kiến trúc giao diện mới với thiết kế 2-Card nổi (Floating Cards), Primitives Shadcn và cơ chế Dual-Run an toàn song song với V1.",
      exploreBtn: "Khám phá giao diện V2",
      backV1Btn: "Quay lại ERP V1",
      featuresTitle: "Các Trụ Cột Kiến Trúc V2",
      featureSplitTitle: "Platform Split Tự Động",
      featureSplitDesc:
        "Chuyển đổi linh hoạt giao diện chuyên biệt cho Desktop và Mobile.",
      featureAtomicTitle: "5 Tầng Atomic Design",
      featureAtomicDesc:
        "Kiến trúc mô-đun hóa nghiêm ngặt, khống chế kích thước file < 180 LoC.",
      featureDualRunTitle: "Dual-Run Song Song",
      featureDualRunDesc:
        "Hoạt động độc lập tại /v2/*, bảo vệ 100% độ ổn định của hệ thống V1.",
      featureTestingTitle: "Co-located Testing",
      featureTestingDesc:
        "100% thành phần đều có unit test tự động bảo đảm chất lượng code.",
      badgeResponsive: "Responsive",
      badgeArchitecture: "Architecture",
      badgeStability: "Stability",
      badgeQuality: "Quality Gate",
    },
    modal: {
      close: "Đóng",
      defaultTitle: "Hộp thoại",
      dragHandleAria: "Kéo để đóng hộp thoại",
    },
    confirmModal: {
      defaultTitle: "Xác nhận hành động",
      defaultConfirm: "Xác nhận",
      defaultCancel: "Hủy",
      processing: "Đang xử lý...",
    },
  },
};

export type V2Dictionary = typeof v2Vi;
