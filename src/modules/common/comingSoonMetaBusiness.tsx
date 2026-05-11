import { FI, SvgIcon, type PageMeta } from "./comingSoonTypes";

export const BUSINESS_COMING_SOON_META: Record<string, PageMeta> = {
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
