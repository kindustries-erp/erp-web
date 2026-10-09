import * as React from "react";
import { Check, Copy, Eye, PanelRightOpen } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Tooltip } from "@/v2/shared/components/atoms/v2-tooltip";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";

export interface V2TableTextProps {
  text: string;
  /** Hiện nút sao chép */
  enableCopy?: boolean;
  /** Cắt chữ dài và hiện tooltip đầy đủ */
  tooltip?: boolean;
  /** Bấm vào chính text (hiển thị dạng link) để mở chi tiết; icon vẫn hiện bình thường */
  onTextClick?: (event: React.MouseEvent) => void;
  /** Bản ghi chính: hiện icon con mắt để mở chi tiết */
  onDetailClick?: (event: React.MouseEvent) => void;
  /** Dữ liệu liên kết: hiện icon ngăn kéo để mở bản ghi liên quan */
  onDrawerClick?: (event: React.MouseEvent) => void;
  className?: string;
}

const COPIED_RESET_MS = 1500;
const ICON_BUTTON =
  "h-5 w-5 shrink-0 rounded text-muted-fg opacity-0 transition-opacity hover:bg-transparent hover:text-foreground focus-visible:opacity-100 group-hover/text:opacity-100";

export const V2TableText = React.memo(function V2TableText({
  text,
  enableCopy = false,
  tooltip = true,
  onTextClick,
  onDetailClick,
  onDrawerClick,
  className,
}: V2TableTextProps) {
  const { t } = useV2Translation();
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    void navigator.clipboard?.writeText(text).then(() => setCopied(true));
  };

  const iconButton = (
    label: string,
    icon: React.ReactNode,
    onClick: (event: React.MouseEvent) => void,
  ) => (
    <V2Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      className={ICON_BUTTON}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
    >
      {icon}
    </V2Button>
  );

  return (
    <div
      className={cn(
        "group/text flex w-full min-w-0 items-center gap-1",
        className,
      )}
    >
      <V2Tooltip content={text} side="bottom" disabled={!tooltip}>
        {onTextClick ? (
          <V2Button
            variant="link"
            size="xs"
            className="h-auto min-w-0 flex-1 justify-start truncate p-0 text-left"
            onClick={(event) => {
              event.stopPropagation();
              onTextClick(event);
            }}
          >
            {text}
          </V2Button>
        ) : (
          <span className="min-w-0 flex-1 truncate">{text}</span>
        )}
      </V2Tooltip>
      {onDetailClick &&
        iconButton(
          t("v2.table.viewDetail", "Xem chi tiết"),
          <Eye className="h-3.5 w-3.5" />,
          onDetailClick,
        )}
      {onDrawerClick &&
        iconButton(
          t("v2.table.openDrawer", "Mở bản ghi liên kết"),
          <PanelRightOpen className="h-3.5 w-3.5" />,
          onDrawerClick,
        )}
      {enableCopy &&
        iconButton(
          copied
            ? t("v2.table.copied", "Đã sao chép")
            : t("v2.table.copy", "Sao chép"),
          copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          ),
          handleCopy,
        )}
    </div>
  );
});
