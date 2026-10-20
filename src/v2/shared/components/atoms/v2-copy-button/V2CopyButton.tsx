import * as React from "react";
import { Check, Copy } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { copyTextToClipboard } from "./V2CopyButton.helper";
import type { V2CopyButtonProps } from "./V2CopyButton.type";

export const V2CopyButton: React.FC<V2CopyButtonProps> = ({
  value,
  label,
  onCopy,
  timeoutMs = 1500,
  className,
}) => {
  const { t } = useV2Translation();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!(await copyTextToClipboard(value))) return;
    setCopied(true);
    onCopy?.(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), timeoutMs);
  };

  const text = copied
    ? t("v2.form.copied", "Đã sao chép")
    : (label ?? t("v2.form.copy", "Sao chép"));

  return (
    <V2Button
      type="button"
      variant="ghost"
      size="xs"
      aria-label={text}
      title={text}
      className={cn("h-6 w-6 p-0", className)}
      onClick={handleClick}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </V2Button>
  );
};
V2CopyButton.displayName = "V2CopyButton";
