export interface V2CopyButtonProps {
  /** Chuỗi được sao chép vào clipboard */
  value: string;
  /** Nhãn truy cập (mặc định "Sao chép") */
  label?: string;
  /** Gọi sau khi sao chép thành công */
  onCopy?: (value: string) => void;
  /** Thời gian hiện dấu tích trước khi trở lại biểu tượng sao chép (ms) */
  timeoutMs?: number;
  className?: string;
}
