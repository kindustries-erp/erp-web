/**
 * Dữ liệu giả có hình dạng giống erp-invoice, chỉ để chứng minh khung V2 đáp ứng được
 * một module hoàn chỉnh. Không gọi API và không import module thật.
 */
export type InvoiceDirection = "IN" | "OUT";
export type TaxTab = "all" | "new" | "replacement" | "adjustment";
export type PostingStatus = "POSTED" | "UNPOSTED";

export interface FakeInvoice {
  id: string;
  direction: InvoiceDirection;
  invoiceNo: string;
  serialNo: string;
  /** yyyy-MM-dd */
  invoiceDate: string;
  partner: string;
  taxCode: string;
  taxTab: Exclude<TaxTab, "all">;
  branchId: string;
  preVat: number;
  vat: number;
  total: number;
  paid: number;
  posting: PostingStatus;
  note: string;
}

export const BRANCHES = [
  { value: "hn", label: "Chi nhánh Hà Nội" },
  { value: "hcm", label: "Chi nhánh TP.HCM" },
  { value: "dn", label: "Chi nhánh Đà Nẵng" },
];

export const POSTING_OPTIONS = [
  { value: "POSTED", label: "Đã hạch toán" },
  { value: "UNPOSTED", label: "Chưa hạch toán" },
];

const PARTNERS = [
  ["Công ty TNHH Phụ tùng An Phát", "0100109106"],
  ["Công ty CP Thương mại Hòa Bình", "0301234567"],
  ["Doanh nghiệp tư nhân Minh Quân", "0401987654"],
  ["Công ty TNHH Vận tải Sao Việt", "0102345678"],
  ["Công ty CP Điện máy Tân Tiến", "0309876543"],
] as const;

const TAX_TABS: FakeInvoice["taxTab"][] = [
  "new",
  "new",
  "new",
  "replacement",
  "adjustment",
];

/** Sinh dữ liệu xác định theo chỉ số, nên test và story luôn thấy cùng kết quả */
export const makeInvoices = (
  direction: InvoiceDirection,
  count = 60,
): FakeInvoice[] =>
  Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const [partner, taxCode] = PARTNERS[i % PARTNERS.length]!;
    const preVat = (((i * 37) % 90) + 10) * 100000;
    const vat = Math.round(preVat * 0.1);
    const total = preVat + vat;
    const posting: PostingStatus = i % 3 === 0 ? "POSTED" : "UNPOSTED";
    return {
      id: `${direction}-${n}`,
      direction,
      invoiceNo: String(1000 + n),
      serialNo: direction === "IN" ? "C26TGA" : "C26TAA",
      invoiceDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      partner,
      taxCode,
      taxTab: TAX_TABS[i % TAX_TABS.length]!,
      branchId: BRANCHES[i % BRANCHES.length]!.value,
      preVat,
      vat,
      total,
      paid: posting === "POSTED" ? total : Math.round(total * ((i % 4) / 4)),
      posting,
      note: "",
    };
  });

export const MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

export const CASH_TREND = [
  {
    key: "in",
    label: "Mua vào",
    data: [120, 150, 90, 180, 140, 200, 170, 160, 190, 210, 180, 230],
  },
  {
    key: "out",
    label: "Bán ra",
    data: [200, 170, 210, 260, 230, 300, 280, 250, 310, 330, 290, 360],
  },
];

export const VAT_BY_MONTH = [
  {
    key: "vat-in",
    label: "VAT đầu vào",
    data: [12, 15, 9, 18, 14, 20, 17, 16, 19, 21, 18, 23],
  },
  {
    key: "vat-out",
    label: "VAT đầu ra",
    data: [20, 17, 21, 26, 23, 30, 28, 25, 31, 33, 29, 36],
  },
];

export const PARTNER_SHARE = {
  labels: PARTNERS.map(([name]) => name),
  values: [34, 24, 18, 14, 10],
};

export const formatMoney = (value: number): string =>
  `${value.toLocaleString("vi-VN")} ₫`;

export const sampleInvoiceXml = (invoice: FakeInvoice): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<HDon>\n  <SHDon>${invoice.invoiceNo}</SHDon>\n  <KHHDon>${invoice.serialNo}</KHHDon>\n  <NLap>${invoice.invoiceDate}</NLap>\n  <TgTCThue>${invoice.preVat}</TgTCThue>\n  <TgTThue>${invoice.vat}</TgTThue>\n  <TgTTTBSo>${invoice.total}</TgTTTBSo>\n</HDon>`;
