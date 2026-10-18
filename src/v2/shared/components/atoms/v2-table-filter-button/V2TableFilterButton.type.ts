export interface V2TableFilterButtonProps {
  /** Số cột đang lọc; > 0 hiện badge và trạng thái active */
  activeCount?: number;
  onClick?: () => void;
  className?: string;
}
