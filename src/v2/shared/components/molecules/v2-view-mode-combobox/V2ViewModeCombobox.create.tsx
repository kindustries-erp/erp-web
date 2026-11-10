import * as React from "react";
import { Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

export interface V2ViewModeCreateButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Nút "+ Tạo ..." dùng chung cho chế độ xem và bộ lọc tùy chỉnh (cùng class, cùng đường kẻ trên) */
export const V2ViewModeCreateButton: React.FC<V2ViewModeCreateButtonProps> = ({
  label,
  onClick,
  disabled,
}) => (
  <V2Button
    type="button"
    variant="ghost"
    size="sm"
    disabled={disabled}
    onClick={onClick}
    leftIcon={<Plus className="h-3.5 w-3.5" />}
    className="mt-1 h-7 w-full justify-start border-t border-border/60 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors"
  >
    {label}
  </V2Button>
);
