/** Nhãn modal cấn trừ hóa đơn của giao dịch tiền mặt (vi/en), namespace riêng để không đè `cashDetail` */
export const cashNetOffLocale = {
  vi: {
    cashNetOff: {
      title: "Cấn trừ hóa đơn",
      description: "Chọn hóa đơn và nhập số tiền cấn trừ cho từng hóa đơn.",
      confirm: "Xác nhận cấn trừ",
      summary: "Đã chọn {{total}} / tối đa {{max}}",
      exceeds: "Tổng cấn trừ vượt số tiền còn lại của giao dịch",
      empty: "Không có hóa đơn còn số dư để cấn trừ",
      loadError: "Không tải được danh sách hóa đơn",
      columns: {
        invoiceNo: "Số hóa đơn",
        partner: "Đối tượng",
        invoiceDate: "Ngày",
        total: "Tổng tiền",
        remaining: "Còn lại",
        netOff: "Cấn trừ",
      },
    },
  },
  en: {
    cashNetOff: {
      title: "Net off invoices",
      description: "Select invoices and enter the amount to net off for each.",
      confirm: "Confirm net off",
      summary: "Selected {{total}} / up to {{max}}",
      exceeds: "Total net off exceeds the remaining transaction amount",
      empty: "No invoices with remaining balance to net off",
      loadError: "Could not load invoices",
      columns: {
        invoiceNo: "Invoice no.",
        partner: "Counterparty",
        invoiceDate: "Date",
        total: "Total",
        remaining: "Remaining",
        netOff: "Net off",
      },
    },
  },
};
