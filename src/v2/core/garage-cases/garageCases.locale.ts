import {
  registerV2ModuleLocale,
  type V2ModuleLocale,
} from "@/v2/shared/locales";

/**
 * Chữ hiển thị dùng chung cho họ phiếu dịch vụ garage.
 * Khóa dạng `v2.garageCases.<nhóm>.<khóa>`; module chỉ giữ chữ riêng của trang.
 */
export const garageCasesLocale: V2ModuleLocale = {
  vi: {
    traceability: {
      rootTitle: "Sổ báo giá",
      statusProcessing: "Đang xử lý",
      partnerFallback: "Đối tác",
      internalPartner: "Nội bộ",
      invoiceNoFallback: "HĐ",
      invoiceOut: "HĐ đầu ra",
      invoiceIn: "HĐ đầu vào",
      invoiceOutEdge: "HĐ Bán ra",
      invoiceInEdge: "HĐ Mua vào",
      bankReceipt: "Thu ngân hàng",
      bankPayment: "Chi ngân hàng",
      manualReceipt: "Khoản thu ngoài ERP",
      manualPayment: "Khoản chi ngoài ERP",
      netOffReceipt: "Cấn trừ Thu",
      netOffPayment: "Cấn trừ Chi",
      manualReceiptEdge: "Thu ngoài ERP",
      manualPaymentEdge: "Chi ngoài ERP",
    },
    vehicle: {
      soKhung: "Số khung",
      hangXe: "Hãng xe",
      dongXe: "Dòng xe",
      namSanXuat: "Năm SX",
      doiTuongThanhToan: "Đối tượng thanh toán",
    },
  },
  en: {
    traceability: {
      rootTitle: "Quotation book",
      statusProcessing: "In progress",
      partnerFallback: "Partner",
      internalPartner: "Internal",
      invoiceNoFallback: "Inv.",
      invoiceOut: "Output invoice",
      invoiceIn: "Input invoice",
      invoiceOutEdge: "Sales invoice",
      invoiceInEdge: "Purchase invoice",
      bankReceipt: "Bank receipt",
      bankPayment: "Bank payment",
      manualReceipt: "Off-ERP receipt",
      manualPayment: "Off-ERP payment",
      netOffReceipt: "Receipt net-off",
      netOffPayment: "Payment net-off",
      manualReceiptEdge: "Off-ERP receipt",
      manualPaymentEdge: "Off-ERP payment",
    },
    vehicle: {
      soKhung: "VIN",
      hangXe: "Make",
      dongXe: "Model",
      namSanXuat: "Model year",
      doiTuongThanhToan: "Payer",
    },
  },
};

registerV2ModuleLocale("garageCases", garageCasesLocale);
