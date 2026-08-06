import React, { useState } from "react";
import { Copy, PanelRightOpen, Check, List } from "lucide-react";
import { toast } from "react-hot-toast";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";

export interface TableTextProps {
  /** The text content to display */
  text: string;
  /** Custom class for the container */
  className?: string;
  /** Custom class for the text element */
  textClassName?: string;
  /**
   * If true, shows a tooltip.
   * If string, shows that specific string as the tooltip.
   */
  tooltip?: boolean | string | React.ReactNode;
  /** If true, shows a copy icon that copies the text to clipboard */
  enableCopy?: boolean;
  /** Callback when the drawer icon is clicked */
  onDrawerClick?: (e: React.MouseEvent) => void;
  /** Custom drawer icon, defaults to PanelRightOpen */
  drawerIcon?: React.ReactNode;
  /** Content to display in the popover */
  popoverContent?: React.ReactNode;
  /** Custom popover icon, defaults to List */
  popoverIcon?: React.ReactNode;
}

export function TableText({
  text,
  className,
  textClassName,
  tooltip,
  enableCopy,
  onDrawerClick,
  drawerIcon = <PanelRightOpen className="w-3.5 h-3.5" />,
  popoverContent,
  popoverIcon = <List className="w-3.5 h-3.5" />,
}: TableTextProps) {
  const [copied, setCopied] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    toast.success("Đã copy", { id: "table-text-copy" });
    setTimeout(() => setCopied(false), 2000);
  };

  const textNode = <div className={cn("truncate", textClassName)}>{text}</div>;

  const wrappedText = tooltip ? (
    <Tooltip content={typeof tooltip === "string" ? tooltip : text}>
      {textNode}
    </Tooltip>
  ) : (
    textNode
  );

  return (
    <div className={cn("flex items-center gap-1.5 w-full group", className)}>
      {/* Popover Icon */}
      {popoverContent && (
        <Popover
          content={popoverContent}
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          side="bottom"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0 text-slate-400 hover:text-primary transition-colors focus:ring-0 focus-visible:ring-0 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {popoverIcon}
          </Button>
        </Popover>
      )}

      {/* Drawer Icon */}
      {onDrawerClick && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-transparent hover:text-primary transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none"
          onClick={onDrawerClick}
        >
          {drawerIcon}
        </Button>
      )}

      {/* Text Container and Copy Icon */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {wrappedText}

        {enableCopy && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0 flex-shrink-0 transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none",
              copied
                ? "text-green-600 opacity-100"
                : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-primary",
            )}
            onClick={handleCopy}
            title="Copy"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
