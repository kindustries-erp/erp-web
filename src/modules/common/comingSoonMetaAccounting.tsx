import { FI, SvgIcon, type PageMeta } from "./comingSoonTypes";

export const ACCOUNTING_COMING_SOON_META: Record<string, PageMeta> = {
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
};
