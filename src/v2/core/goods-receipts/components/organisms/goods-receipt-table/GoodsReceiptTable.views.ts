/** Chế độ xem hệ thống: cột hiển thị cho từng view. Chỉnh theo nhu cầu của module. */
export const goodsReceiptViewVisibility = {
  overview: {
    receiptNo: true,
    receiptDate: true,
    supplierName: true,
    branchName: true,
    totalAmount: true,
    status: true,
    remarks: false,
  },
  all: {
    receiptNo: true,
    receiptDate: true,
    supplierName: true,
    branchName: true,
    totalAmount: true,
    status: true,
    remarks: true,
  },
} as const;
