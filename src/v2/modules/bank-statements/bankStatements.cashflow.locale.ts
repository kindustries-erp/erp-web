/** Nhãn phân loại/mục đích dòng tiền và lỗi lưu giao dịch tiền mặt (vi/en) */
export const cashflowLocale = {
  vi: {
    cashflow: {
      classification: {
        OPERATING: "Hoạt động kinh doanh",
        INVESTING: "Đầu tư",
        FINANCING: "Tài chính",
        OTHER: "Khác",
      },
      purpose: {
        CUSTOMER_PAYMENT: "Khách hàng thanh toán",
        SUPPLIER_PAYMENT: "Thanh toán nhà cung cấp",
        SALARY: "Lương",
        TAX: "Thuế",
        SOCIAL_INSURANCE: "BHXH",
        BANK_FEE: "Phí ngân hàng",
        RENT: "Thuê mặt bằng / kho",
        INSURANCE_CLAIM: "Bồi thường bảo hiểm",
        ADVANCE: "Tạm ứng / Hoàn ứng",
        REFUND: "Hoàn tiền khách",
        LOAN: "Vay / Trả nợ",
        OPEX: "Chi phí vận hành",
        ASSET_PURCHASE: "Mua sắm tài sản",
        ASSET_DISPOSAL: "Thanh lý tài sản",
        INVESTMENT: "Đầu tư / Thu hồi đầu tư",
        INTEREST_INCOME: "Lãi tiền gửi",
        CAPITAL: "Góp vốn / Chia lợi nhuận",
        INTERNAL_TRANSFER: "Chuyển nội bộ",
        OTHER: "Khác",
      },
    },
    cashDetail: {
      error: {
        updateInfo: "Lỗi lưu thông tin giao dịch",
        post: "Lỗi lưu hạch toán",
        unpost: "Lỗi bỏ hạch toán",
      },
    },
  },
  en: {
    cashflow: {
      classification: {
        OPERATING: "Operating activities",
        INVESTING: "Investing activities",
        FINANCING: "Financing activities",
        OTHER: "Other",
      },
      purpose: {
        CUSTOMER_PAYMENT: "Customer payment",
        SUPPLIER_PAYMENT: "Supplier payment",
        SALARY: "Salary",
        TAX: "Tax",
        SOCIAL_INSURANCE: "Social insurance",
        BANK_FEE: "Bank fee",
        RENT: "Rent (premises / warehouse)",
        INSURANCE_CLAIM: "Insurance claim",
        ADVANCE: "Advance / Settlement",
        REFUND: "Customer refund",
        LOAN: "Loan / Repayment",
        OPEX: "Operating expenses",
        ASSET_PURCHASE: "Asset purchase",
        ASSET_DISPOSAL: "Asset disposal",
        INVESTMENT: "Investment / Divestment",
        INTEREST_INCOME: "Deposit interest",
        CAPITAL: "Capital contribution / Profit distribution",
        INTERNAL_TRANSFER: "Internal transfer",
        OTHER: "Other",
      },
    },
    cashDetail: {
      error: {
        updateInfo: "Could not save transaction info",
        post: "Could not save accounting entry",
        unpost: "Could not unpost transaction",
      },
    },
  },
};
