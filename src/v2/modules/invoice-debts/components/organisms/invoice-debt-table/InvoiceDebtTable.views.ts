/** Chế độ xem hệ thống: cột hiển thị cho từng view. Chỉnh theo nhu cầu của module. */
export const invoiceDebtsViewVisibility = {
  overview: {
    search: true,
    partnerType: true,
    createdAt: false,
  },
  all: {
    search: true,
    partnerType: true,
    createdAt: true,
  },
} as const;
