import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

export interface V2ViewModeRowActionsProps {
  itemKey: string;
  onEdit?: (key: string) => void;
  onDelete?: (key: string) => void;
  editLabel: string;
  deleteLabel: string;
}

/** Nút sửa/xóa hiện khi hover một hàng; dùng chung cho chế độ xem và bộ lọc custom */
export const V2ViewModeRowActions: React.FC<V2ViewModeRowActionsProps> = ({
  itemKey,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}) => (
  <>
    {onEdit && (
      <V2Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={editLabel}
        onClick={() => onEdit(itemKey)}
        className="opacity-0 group-hover:opacity-100"
      >
        <Pencil className="h-3 w-3" />
      </V2Button>
    )}
    {onDelete && (
      <V2Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={deleteLabel}
        onClick={() => onDelete(itemKey)}
        className="text-destructive opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </V2Button>
    )}
  </>
);
