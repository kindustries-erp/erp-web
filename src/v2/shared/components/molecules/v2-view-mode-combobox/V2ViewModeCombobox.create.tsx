import * as React from "react";
import { Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface V2ViewModeCreateButtonProps {
  /** Nhãn đầy đủ (tooltip và tên truy cập); hiển thị ngắn "Tạo mới" */
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Nút "+ Tạo mới" dùng chung cho chế độ xem và bộ lọc tùy chỉnh, đặt cùng hàng tiêu đề nhóm */
export const V2ViewModeCreateButton: React.FC<V2ViewModeCreateButtonProps> = ({
  label,
  onClick,
  disabled,
}) => {
  const { t } = useV2Translation();
  return (
    <V2Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      leftIcon={<Plus className="h-3 w-3" />}
      className="h-6 shrink-0 px-1.5 text-[11px] font-medium text-primary hover:bg-primary/10 hover:text-primary"
    >
      {t("v2.table.createNew", "Tạo mới")}
    </V2Button>
  );
};
