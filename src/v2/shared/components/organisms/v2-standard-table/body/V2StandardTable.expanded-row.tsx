import * as React from "react";
import { ChevronRight } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { TableCell, TableRow } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";

interface ExpandToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Nút mở rộng/thu gọn dòng với touch target phù hợp trên mobile & desktop.
 */
export function V2TableExpandToggleButton({
  isExpanded,
  onToggle,
}: ExpandToggleButtonProps) {
  const { t } = useV2Translation();
  return (
    <V2Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-expanded={isExpanded}
      aria-label={
        isExpanded
          ? t("v2.table.collapseRow", "Thu gọn dòng")
          : t("v2.table.expandRow", "Mở rộng dòng")
      }
      className="text-muted-fg hover:bg-surface-hover hover:text-foreground"
    >
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 transition-transform duration-150",
          isExpanded && "rotate-90 text-primary",
        )}
      />
    </V2Button>
  );
}

interface ExpandedRowProps {
  colSpan: number;
  children: React.ReactNode;
}

/**
 * Hàng mở rộng nằm ngay bên dưới dòng chính, dùng background tương phản để phân cấp rõ ràng.
 */
export function V2TableExpandedRow({ colSpan, children }: ExpandedRowProps) {
  return (
    <TableRow className="bg-muted/35 hover:bg-muted/45 dark:bg-muted/20 border-b border-[color:var(--border-light)] transition-colors">
      <TableCell colSpan={colSpan} className="p-0 align-top">
        <div className="border-l-4 border-l-primary/70 px-3 py-2.5">
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
}
