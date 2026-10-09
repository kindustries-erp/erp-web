import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ViewModeComboboxProps } from "./V2ViewModeCombobox.type";

type ListProps = Pick<
  V2ViewModeComboboxProps,
  "items" | "activeKey" | "onSelect" | "onEdit" | "onDelete"
> & { close: () => void };

export const V2ViewModeList: React.FC<ListProps> = ({
  items,
  activeKey,
  onSelect,
  onEdit,
  onDelete,
  close,
}) => {
  const { t } = useV2Translation();
  return (
    <ul role="listbox" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <li key={item.key} className="group flex items-center gap-1">
            <V2Button
              type="button"
              role="option"
              aria-selected={active}
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelect(item.key);
                close();
              }}
              className={cn(
                "h-7 flex-1 justify-start gap-2 px-2 text-xs",
                active && "font-semibold text-primary",
              )}
            >
              <Check className={cn("h-3.5 w-3.5", !active && "opacity-0")} />
              <span className="truncate">{item.label}</span>
            </V2Button>
            {!item.isSystem && onEdit && (
              <V2Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("v2.table.editView", "Sửa chế độ xem")}
                onClick={() => onEdit(item.key)}
                className="opacity-0 group-hover:opacity-100"
              >
                <Pencil className="h-3 w-3" />
              </V2Button>
            )}
            {!item.isSystem && onDelete && (
              <V2Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("v2.table.deleteView", "Xóa chế độ xem")}
                onClick={() => onDelete(item.key)}
                className="text-destructive opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </V2Button>
            )}
          </li>
        );
      })}
    </ul>
  );
};
