/** Chế độ xem hệ thống của bảng chứng từ: cột hiển thị cho từng view */
export const stockVoucherViewVisibility = {
  overview: {
    voucherNo: true,
    type: true,
    voucherDate: true,
    partnerName: true,
    totalAmount: true,
    status: true,
    remarks: false,
  },
  all: {
    voucherNo: true,
    type: true,
    voucherDate: true,
    partnerName: true,
    totalAmount: true,
    status: true,
    remarks: true,
  },
} as const;
