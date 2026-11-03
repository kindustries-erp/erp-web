/** Nhãn bảng kê đối tượng và biến động của giao dịch tiền mặt (vi/en), namespace riêng `cashPartner` */
export const cashPartnerLocale = {
  vi: {
    cashPartner: {
      columns: {
        no: "STT",
        date: "Ngày GD",
        reference: "Số tham chiếu",
        description: "Diễn giải",
        cashIn: "Thu",
        cashOut: "Chi",
        source: "Nguồn tiền",
        netOff: "Đã cấn trừ",
        remaining: "Còn lại",
      },
      stats: {
        cashIn: "Tổng thu",
        cashOut: "Tổng chi",
        net: "Chênh lệch ròng",
        count: "Số giao dịch",
      },
      trend: {
        title: "Biến động theo kỳ",
        period: "Kỳ",
        net: "Thuần",
        chartIn: "Thu",
        chartOut: "Chi",
        chartLabel: "Biến động thu chi theo kỳ",
      },
      empty: "Chưa có giao dịch của đối tượng này",
      loadError: "Không tải được dữ liệu đối tượng",
    },
  },
  en: {
    cashPartner: {
      columns: {
        no: "No.",
        date: "Date",
        reference: "Reference",
        description: "Description",
        cashIn: "Receipt",
        cashOut: "Payment",
        source: "Cash source",
        netOff: "Netted off",
        remaining: "Remaining",
      },
      stats: {
        cashIn: "Total receipts",
        cashOut: "Total payments",
        net: "Net cash flow",
        count: "Transactions",
      },
      trend: {
        title: "Cash flow by period",
        period: "Period",
        net: "Net",
        chartIn: "Receipts",
        chartOut: "Payments",
        chartLabel: "Cash receipts and payments by period",
      },
      empty: "No transactions for this counterparty",
      loadError: "Could not load counterparty data",
    },
  },
};
