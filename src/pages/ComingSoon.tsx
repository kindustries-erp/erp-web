import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";

/* ── per-page meta ── */
type PageMeta = {
  icon: React.ReactNode;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  featuresVi: [React.ReactNode, string][];
  featuresEn: [React.ReactNode, string][];
  progress: number;
};

const SvgIcon = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-8 h-8"
  >
    {children}
  </svg>
);

// small monochrome icon for feature cards
const FI = (d: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-4 h-4"
  >
    {d}
  </svg>
);

const META: Record<string, PageMeta> = {
  phaithu: {
    icon: (
      <SvgIcon>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </SvgIcon>
    ),
    nameVi: "Phải thu",
    nameEn: "Accounts Receivable",
    descVi:
      "Quản lý toàn bộ khoản phải thu, theo dõi công nợ và cảnh báo quá hạn.",
    descEn: "Manage all receivables, track debt aging and overdue alerts.",
    featuresVi: [
      [
        FI(
          <>
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="12" y2="16" />
          </>,
        ),
        "Danh sách hoá đơn phải thu",
      ],
      [
        FI(
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>,
        ),
        "Báo cáo tuổi nợ chi tiết",
      ],
      [
        FI(
          <>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </>,
        ),
        "Nhắc nợ tự động qua email",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="12" y2="16" />
          </>,
        ),
        "Receivable invoice list",
      ],
      [
        FI(
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>,
        ),
        "Detailed aging report",
      ],
      [
        FI(
          <>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </>,
        ),
        "Automated overdue reminders",
      ],
    ],
    progress: 38,
  },
  phaittra: {
    icon: (
      <SvgIcon>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="14" x2="10" y2="14" />
      </SvgIcon>
    ),
    nameVi: "Phải trả",
    nameEn: "Accounts Payable",
    descVi:
      "Kiểm soát công nợ nhà cung cấp, lịch thanh toán và hạn mức chi tiêu.",
    descEn: "Control supplier payables, payment schedules and spending limits.",
    featuresVi: [
      [
        FI(
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
          </>,
        ),
        "Quản lý đơn đặt hàng",
      ],
      [
        FI(
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </>,
        ),
        "Lịch thanh toán tự động",
      ],
      [
        FI(
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>,
        ),
        "Kiểm soát hạn mức chi",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
          </>,
        ),
        "Purchase order management",
      ],
      [
        FI(
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </>,
        ),
        "Auto payment scheduling",
      ],
      [
        FI(
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>,
        ),
        "Spending limit control",
      ],
    ],
    progress: 25,
  },
  socat: {
    icon: (
      <SvgIcon>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
      </SvgIcon>
    ),
    nameVi: "Sổ cái",
    nameEn: "General Ledger",
    descVi:
      "Tổng hợp bút toán toàn hệ thống, số dư tài khoản và đối chiếu cuối kỳ.",
    descEn:
      "Consolidated journal entries, account balances and period reconciliation.",
    featuresVi: [
      [
        FI(
          <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </>,
        ),
        "Tổng hợp bút toán hệ thống",
      ],
      [
        FI(
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>,
        ),
        "Số dư & biến động tài khoản",
      ],
      [
        FI(
          <>
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </>,
        ),
        "Đối chiếu & khoá sổ kỳ",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </>,
        ),
        "System-wide journal summary",
      ],
      [
        FI(
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>,
        ),
        "Account balance & movement",
      ],
      [
        FI(
          <>
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </>,
        ),
        "Period closing & reconciliation",
      ],
    ],
    progress: 52,
  },
  nhatkyechung: {
    icon: (
      <SvgIcon>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </SvgIcon>
    ),
    nameVi: "Nhật ký chung",
    nameEn: "General Journal",
    descVi: "Ghi nhận và tra cứu toàn bộ bút toán theo thời gian thực.",
    descEn: "Record and query all journal entries in real time.",
    featuresVi: [
      [
        FI(
          <>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </>,
        ),
        "Ghi nhận bút toán nhanh",
      ],
      [
        FI(
          <>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </>,
        ),
        "Phân loại chứng từ",
      ],
      [
        FI(
          <>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </>,
        ),
        "In sổ nhật ký PDF",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </>,
        ),
        "Quick journal entry",
      ],
      [
        FI(
          <>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </>,
        ),
        "Voucher classification",
      ],
      [
        FI(
          <>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </>,
        ),
        "Export journal PDF",
      ],
    ],
    progress: 45,
  },
  nhansu: {
    icon: (
      <SvgIcon>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </SvgIcon>
    ),
    nameVi: "Nhân sự",
    nameEn: "Human Resources",
    descVi:
      "Quản lý hồ sơ nhân viên, chấm công, nghỉ phép và tính lương tự động.",
    descEn:
      "Manage employee profiles, attendance, leave and automated payroll.",
    featuresVi: [
      [
        FI(
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>,
        ),
        "Hồ sơ & hợp đồng nhân viên",
      ],
      [
        FI(
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>,
        ),
        "Chấm công & nghỉ phép",
      ],
      [
        FI(
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>,
        ),
        "Tính lương tự động",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>,
        ),
        "Employee profiles & contracts",
      ],
      [
        FI(
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>,
        ),
        "Attendance & leave tracking",
      ],
      [
        FI(
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>,
        ),
        "Automated payroll",
      ],
    ],
    progress: 18,
  },
  banhang: {
    icon: (
      <SvgIcon>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </SvgIcon>
    ),
    nameVi: "Bán hàng",
    nameEn: "Sales",
    descVi:
      "Quản lý đơn hàng, báo giá, hợp đồng và theo dõi doanh thu theo kỳ.",
    descEn: "Manage orders, quotes, contracts and track revenue by period.",
    featuresVi: [
      [
        FI(
          <>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </>,
        ),
        "Quản lý đơn hàng bán",
      ],
      [
        FI(
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </>,
        ),
        "Báo giá & hợp đồng",
      ],
      [
        FI(
          <>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </>,
        ),
        "Báo cáo doanh thu kỳ",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </>,
        ),
        "Sales order management",
      ],
      [
        FI(
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </>,
        ),
        "Quotes & contracts",
      ],
      [
        FI(
          <>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </>,
        ),
        "Period revenue reports",
      ],
    ],
    progress: 12,
  },
  khachhang: {
    icon: (
      <SvgIcon>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </SvgIcon>
    ),
    nameVi: "Khách hàng",
    nameEn: "Customers",
    descVi:
      "Danh sách khách hàng, lịch sử giao dịch và phân nhóm theo tiêu chí.",
    descEn: "Customer directory, transaction history and group segmentation.",
    featuresVi: [
      [
        FI(
          <>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </>,
        ),
        "Hồ sơ & danh mục khách hàng",
      ],
      [
        FI(
          <>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </>,
        ),
        "Lịch sử giao dịch",
      ],
      [
        FI(
          <>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </>,
        ),
        "Phân loại & nhóm khách",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </>,
        ),
        "Customer profiles & directory",
      ],
      [
        FI(
          <>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </>,
        ),
        "Transaction history",
      ],
      [
        FI(
          <>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </>,
        ),
        "Customer segmentation",
      ],
    ],
    progress: 20,
  },
  muahang: {
    icon: (
      <SvgIcon>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </SvgIcon>
    ),
    nameVi: "Mua hàng",
    nameEn: "Purchasing",
    descVi: "Lập đơn mua, đối soát nhà cung cấp và theo dõi nhập kho.",
    descEn:
      "Create purchase orders, reconcile suppliers and track stock receipts.",
    featuresVi: [
      [
        FI(
          <>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </>,
        ),
        "Lập & duyệt đơn mua",
      ],
      [
        FI(
          <>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </>,
        ),
        "Đối soát nhà cung cấp",
      ],
      [
        FI(
          <>
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </>,
        ),
        "Theo dõi nhập kho",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </>,
        ),
        "Create & approve POs",
      ],
      [
        FI(
          <>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </>,
        ),
        "Supplier reconciliation",
      ],
      [
        FI(
          <>
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </>,
        ),
        "Goods receipt tracking",
      ],
    ],
    progress: 10,
  },
  nhacungcap: {
    icon: (
      <SvgIcon>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 3H8l-2 4h12z" />
      </SvgIcon>
    ),
    nameVi: "Nhà cung cấp",
    nameEn: "Suppliers",
    descVi: "Danh mục nhà cung cấp, đánh giá chất lượng và lịch sử hợp tác.",
    descEn: "Supplier directory, quality ratings and partnership history.",
    featuresVi: [
      [
        FI(
          <>
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </>,
        ),
        "Danh mục nhà cung cấp",
      ],
      [
        FI(
          <>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </>,
        ),
        "Đánh giá & xếp hạng",
      ],
      [
        FI(
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </>,
        ),
        "Lịch sử hợp tác",
      ],
    ],
    featuresEn: [
      [
        FI(
          <>
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </>,
        ),
        "Supplier directory",
      ],
      [
        FI(
          <>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </>,
        ),
        "Ratings & evaluation",
      ],
      [
        FI(
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </>,
        ),
        "Cooperation history",
      ],
    ],
    progress: 8,
  },
};

const DEFAULT_META: PageMeta = {
  icon: (
    <SvgIcon>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </SvgIcon>
  ),
  nameVi: "Sắp ra mắt",
  nameEn: "Coming Soon",
  descVi: "Tính năng đang được phát triển.",
  descEn: "This feature is under development.",
  featuresVi: [],
  featuresEn: [],
  progress: 15,
};

export function ComingSoon() {
  const t = useT();
  const { currentPage, locale } = useAppStore();
  const meta = META[currentPage] ?? DEFAULT_META;
  const isVi = locale === "vi";
  const name = isVi ? meta.nameVi : meta.nameEn;
  const desc = isVi ? meta.descVi : meta.descEn;
  const features = isVi ? meta.featuresVi : meta.featuresEn;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-112px)] overflow-hidden px-6 py-10">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          opacity: 0.7,
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 42%, rgba(15,23,42,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-xl w-full cs-fade-up">
        {/* ── Orbiting icon ── */}
        <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
          <div
            className="cs-spin-slow absolute inset-0 rounded-full"
            style={{
              border: "1px dashed var(--border)",
              borderTopColor: "var(--faint)",
            }}
          />
          <div
            className="cs-spin-rev absolute"
            style={{
              inset: 16,
              borderRadius: "50%",
              border: "1px solid var(--border-light)",
              borderBottomColor: "var(--faint)",
            }}
          />
          {/* Floating icon */}
          <div
            className="cs-float relative w-16 h-16 rounded-2xl flex items-center justify-center text-[color:var(--primary-fg)]"
            style={{
              background: "var(--primary)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            {meta.icon}
          </div>
          {/* Orbit dot */}
          <div
            className="cs-spin-slow absolute"
            style={{ inset: 2, borderRadius: "50%" }}
          >
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: "var(--primary)",
                top: "50%",
                left: -4,
                marginTop: -4,
              }}
            />
          </div>
        </div>

        {/* ── Badge + title ── */}
        <div className="flex flex-col items-center gap-3">
          <span
            className="inline-flex items-center gap-[6px] px-3 py-[5px] rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{
              background: "var(--warn-bg)",
              color: "var(--warn-fg)",
              border: "1px solid var(--warn-fg)",
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full animate-pulse flex-shrink-0"
              style={{ background: "var(--warn-fg)" }}
            />
            {t("common.comingSoon")}
          </span>
          <h2 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
            {name}
          </h2>
          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: "var(--muted-fg)" }}
          >
            {desc}
          </p>
        </div>

        {/* ── Feature cards ── */}
        {features.length > 0 && (
          <div className="grid grid-cols-3 gap-3 w-full max-[480px]:grid-cols-1">
            {features.map(([icon, label], i) => (
              <div
                key={i}
                className="cs-fade-up flex flex-col items-center gap-3 rounded-xl p-4 text-center"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--card-shadow)",
                  animationDelay: `${0.15 + i * 0.08}s`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-fg)",
                  }}
                >
                  {icon}
                </div>
                <span
                  className="text-xs font-medium leading-snug"
                  style={{ color: "var(--foreground)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
