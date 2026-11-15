export interface V2ChatComposerProps {
  /** Gửi tin nhắn chữ. Bỏ trống thì ẩn ô nhập, chỉ còn nút đính kèm */
  onSend?: (text: string) => void;
  /** Nhận file hợp lệ người dùng chọn. Bỏ trống thì ẩn nút đính kèm */
  onAttach?: (files: File[]) => void;
  /** Báo file bị loại (sai loại, quá dung lượng) để nơi dùng hiển thị lỗi */
  onReject?: (reason: "type" | "size" | "count") => void;
  /** Mime hoặc đuôi file, vd `["image/*", "application/pdf"]` */
  accept?: string[];
  maxSizeBytes?: number;
  disabled?: boolean;
  placeholder?: string;
  attachLabel: string;
  sendLabel?: string;
  className?: string;
}
