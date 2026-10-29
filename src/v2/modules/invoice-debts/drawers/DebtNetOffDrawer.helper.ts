/** Hiển thị số tiền VND theo locale vi-VN, không có phần thập phân */
export const formatNetOffAmount = (value: number): string =>
  Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });
