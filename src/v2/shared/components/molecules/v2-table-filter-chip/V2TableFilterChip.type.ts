export interface V2TableFilterChipProps {
  /** Số lượng bộ lọc đang kích hoạt */
  count: number;
  /** Callback xóa tất cả bộ lọc */
  onClear: () => void;
  /** Callback mở / đóng filter panel khi bấm vào phần thông tin bộ lọc */
  onToggleFilter?: () => void;
  /** Có hiển thị chữ 'Bộ lọc' hay không (mặc định false vì đã có AppTooltip) */
  showLabel?: boolean;
  /** ClassName bổ sung */
  className?: string;
}
