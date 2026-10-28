/**
 * Dữ liệu mẫu chỉ dùng cho test và storybook (không có API URL).
 * Lỗi gọi API thật KHÔNG được thay bằng dữ liệu mẫu: trả lỗi về cho UI.
 */
export const isInvoiceSampleMode = () =>
  import.meta.env.MODE === "test" || !import.meta.env.VITE_API_BASE_URL;
