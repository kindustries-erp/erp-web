export interface DebtAgingExplanationPopoverProps {
  className?: string;
  context?: "garage" | "invoice";
  /** Hiển thị 5 nhóm tuổi nợ garage (≤7, 8–30, 31–60, 61–90, >90). Mặc định: 4 nhóm dùng chung. */
  aging5?: boolean;
  title?: string;
  subtitle?: string;
}
