/** Form có khác bản gốc (sau khi tải chi tiết hoặc điền sẵn từ PR) hay không: dùng cho cảnh báo bỏ thay đổi. */
export const isProcurementFormDirty = <T>(form: T, initial: T): boolean =>
  JSON.stringify(form) !== JSON.stringify(initial);
