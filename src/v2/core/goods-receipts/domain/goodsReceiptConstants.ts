/** Đơn vị tính mặc định khi thêm dòng mới hoặc khi dữ liệu thiếu đơn vị */
export const GOODS_RECEIPT_DEFAULT_UNIT = "Cái";

let clientKeySeq = 0;

/** Sinh khóa React ổn định cho dòng mới ở phía client (không cần gửi lên API) */
export const createGoodsReceiptClientKey = (): string => {
  clientKeySeq += 1;
  return `line-${Date.now().toString(36)}-${clientKeySeq}`;
};
