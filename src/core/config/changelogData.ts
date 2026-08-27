export interface ChangelogItem {
  type: "feature" | "enhancement" | "fix";
  textVi: string;
  textEn: string;
}

export interface ChangelogRelease {
  version: string;
  buildTag?: string;
  date: string;
  titleVi: string;
  titleEn: string;
  isLatest?: boolean;
  tag?: string;
  items: ChangelogItem[];
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: "v2026.08.22",
    buildTag: "20260822",
    date: "22/08/2026",
    titleVi:
      "Nâng cấp cơ chế Cache-Busting, Tự động Cập nhật & Changelog Drawer",
    titleEn: "Enhanced Cache-Busting, Auto-Update Polling & Changelog Drawer",
    isLatest: true,
    tag: "Core & UX",
    items: [
      {
        type: "feature",
        textVi:
          "Ra mắt Drawer Nhật ký phát hành (Changelog Timeline) chuẩn 1-column responsive và đa ngôn ngữ.",
        textEn:
          "Introduced standardized 1-column responsive Changelog Timeline Drawer with full i18n.",
      },
      {
        type: "enhancement",
        textVi:
          "Tối ưu phân vùng Cache Nginx, cấm cache Service Worker (sw.js) và index.html để F5 nhận ngay bản mới.",
        textEn:
          "Optimized Nginx cache headers, strictly preventing caching on Service Worker (sw.js) and index.html.",
      },
      {
        type: "enhancement",
        textVi:
          "Bổ sung cơ chế tự động kiểm tra Service Worker mỗi 60s và khi người dùng focus trở lại tab.",
        textEn:
          "Added periodic 60s SW update check and auto-detection on tab focus / visibility change.",
      },
      {
        type: "fix",
        textVi:
          "Tích hợp lazyWithRetry tự động bắt lỗi ChunkLoadError và reload trang an toàn khi máy chủ deploy bản build mới.",
        textEn:
          "Integrated lazyWithRetry to seamlessly catch dynamic ChunkLoadErrors and auto-refresh on new deployments.",
      },
    ],
  },
  {
    version: "v2026.08.19",
    date: "19/08/2026",
    titleVi: "Báo cáo & Dashboard Phân tích Phụ tùng VinFast",
    titleEn: "VinFast Parts Analytics Dashboard & Stock Reporting",
    tag: "VinFast & Reports",
    items: [
      {
        type: "feature",
        textVi:
          "Ra mắt Dashboard phân tích mua bán, lợi nhuận gộp phụ tùng ô tô & xe máy VinFast.",
        textEn:
          "Launched VinFast auto & motorbike parts trading dashboard with gross profit analytics.",
      },
      {
        type: "feature",
        textVi:
          "Tích hợp tính năng xuất báo cáo Excel đa sheet chạy ngầm với thanh tiến trình thời gian thực.",
        textEn:
          "Integrated multi-sheet background Excel export with real-time progress bubble.",
      },
      {
        type: "enhancement",
        textVi:
          "Cải tiến giao diện Danh mục đơn vị tính (UOM) và Loại mặt hàng kho.",
        textEn:
          "Polished Unit of Measure (UOM) and Inventory Item Types master data interface.",
      },
    ],
  },
  {
    version: "v2026.08.15",
    date: "15/08/2026",
    titleVi: "Quản lý Vụ việc Dịch vụ Garage & Sổ Công nợ Khách hàng",
    titleEn: "Garage Service Cases Management & Customer Debt Ledger",
    tag: "Garage Operations",
    items: [
      {
        type: "feature",
        textVi:
          "Quản lý vụ việc dịch vụ, báo giá sửa chữa, phiếu dịch vụ và tỷ suất lợi nhuận gộp.",
        textEn:
          "Comprehensive garage service cases, repair quotations, service vouchers, and profit margin analysis.",
      },
      {
        type: "feature",
        textVi:
          "Phân tích tuổi nợ công nợ khách hàng garage theo từng phân tầng thời gian (Aging Buckets).",
        textEn:
          "Multi-tier aging buckets analysis for garage customer receivables and settlements.",
      },
      {
        type: "enhancement",
        textVi:
          "Tự động đồng bộ 2 chiều dữ liệu vụ việc dịch vụ và đối soát hóa đơn thuế VAT.",
        textEn:
          "Two-way auto-synchronization for garage service cases and VAT tax invoice reconciliation.",
      },
    ],
  },
  {
    version: "v2026.08.08",
    date: "08/08/2026",
    titleVi: "Phân tích Dòng tiền & Sao kê Ngân hàng Tự động",
    titleEn: "Cashflow Analytics & Automated Bank Statement Parsing",
    tag: "Finance & Accounting",
    items: [
      {
        type: "feature",
        textVi:
          "Dashboard dự báo dòng tiền, đối soát tự động sao kê Vietcombank, BIDV, Techcombank và sổ quỹ tiền mặt.",
        textEn:
          "Cashflow forecasting dashboard and automated bank statement parsing (VCB, BIDV, TCB) & cash books.",
      },
      {
        type: "enhancement",
        textVi:
          "Định khoản kế toán kép tự động và cấn trừ thông minh giữa các chứng từ công nợ.",
        textEn:
          "Automated double-entry accounting posting and smart multi-hop settlement matching.",
      },
      {
        type: "fix",
        textVi:
          "Tối ưu truy vấn hạch toán sổ cái phẳng và khắc phục trùng lặp giao dịch sao kê.",
        textEn:
          "Optimized flat ledger journal query performance and prevented duplicate bank transactions.",
      },
    ],
  },
  {
    version: "v2026.08.01",
    date: "01/08/2026",
    titleVi: "Vòng đời Serial Xe/Linh kiện, Bàn giao & Bảo hành Điện tử",
    titleEn: "Vehicle/Serial Lifecycle, Handover & E-Warranty",
    tag: "After-Sales & Inventory",
    items: [
      {
        type: "feature",
        textVi:
          "Quản lý định danh Serial/VIN, lịch sử luân chuyển từ nhập kho -> lắp ráp -> xuất bán -> bảo hành.",
        textEn:
          "End-to-end Serial/VIN lifecycle tracking from goods receipt -> assembly -> sales -> warranty.",
      },
      {
        type: "feature",
        textVi:
          "Kích hoạt bảo hành điện tử và cổng tra cứu công khai thông tin xe.",
        textEn:
          "Electronic warranty activation flow and public vehicle lookup portal integration.",
      },
      {
        type: "enhancement",
        textVi:
          "Khóa bi quan (pessimistic lock) chống xuất trùng Serial khi nhiều nhân viên thao tác cùng lúc.",
        textEn:
          "Pessimistic write locking to prevent duplicate serial reservation across concurrent sessions.",
      },
    ],
  },
  {
    version: "v2026.07.25",
    date: "25/07/2026",
    titleVi: "Định mức Vật tư BOM Đa cấp & Lệnh Sản xuất",
    titleEn: "Multi-level Bill of Materials (BOM) & Production Orders",
    tag: "Manufacturing",
    items: [
      {
        type: "feature",
        textVi:
          "Cấu hình phân rã BOM định mức vật tư đa cấp (Explode BOM) theo từng dòng xe điện và phụ tùng.",
        textEn:
          "Multi-level Bill of Materials (BOM) explosion tree for electric vehicles and components.",
      },
      {
        type: "feature",
        textVi:
          "Quy trình Lệnh sản xuất 2 giai đoạn: Xuất kho nguyên vật liệu và Nhập kho thành phẩm lắp ráp.",
        textEn:
          "Two-stage manufacturing workflow: raw materials issue and finished goods receipt.",
      },
    ],
  },
];
