export interface V2SearchInputProps {
  /** Giá trị đã áp dụng; đổi từ bên ngoài (ví dụ xóa bộ lọc) thì ô nhập cập nhật theo */
  value?: string;
  onChange: (text: string) => void;
  placeholder?: string;
  /** Độ trễ (ms) trước khi gọi `onChange` lúc đang gõ. Enter hoặc nút xóa gọi ngay */
  debounceMs?: number;
  className?: string;
}
