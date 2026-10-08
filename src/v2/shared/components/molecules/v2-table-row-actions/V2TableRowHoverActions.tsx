import * as React from "react";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Tooltip } from "@/v2/shared/components/atoms/v2-tooltip";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { V2RowActionList } from "./V2RowActionList";
import { getQuickActions } from "./V2TableRowActions.helper";

const DEFAULT_ICONS = [
  <Eye key="view" className="h-3.5 w-3.5" />,
  <Pencil key="edit" className="h-3.5 w-3.5" />,
];

export interface V2TableRowHoverActionsProps {
  groups: V2RowActionGroup[];
}

export const V2TableRowHoverActions = React.memo(
  function V2TableRowHoverActions({ groups }: V2TableRowHoverActionsProps) {
    const { t } = useV2Translation();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const quickActions = getQuickActions(groups);

    return (
      <div
        className={cn(
          "pointer-events-auto absolute right-3.5 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-[color:var(--popup-border,rgba(226,232,240,0.8))] bg-[var(--popup-bg,rgba(246,248,252,0.72))] p-0.5 opacity-0 shadow-md backdrop-blur-xl transition-opacity focus-within:opacity-100 group-hover:opacity-100",
          menuOpen && "opacity-100",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {quickActions.map((action, index) => (
          <V2Tooltip key={action.label} content={action.label} side="bottom">
            <V2Button
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6 rounded-lg"
              disabled={action.disabled}
              aria-label={action.label}
              onClick={action.onClick}
            >
              {action.icon ?? DEFAULT_ICONS[index]}
            </V2Button>
          </V2Tooltip>
        ))}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <V2Button
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6 rounded-lg"
              aria-label={t("v2.table.moreActions", "Thao tác khác")}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </V2Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-auto min-w-[170px] max-w-[280px] p-1"
          >
            <V2RowActionList
              groups={groups}
              onAction={() => setMenuOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
