import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import { V2Button } from "@/v2/shared/components";

interface LookupHintRowProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: (value: string) => void;
}

export function LookupHintRow({
  label,
  value,
  copied,
  onCopy,
}: LookupHintRowProps) {
  const { t } = useTranslation("erpInvoices");
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-surface/80 px-2.5 py-1.5 dark:border-white/[0.06] dark:bg-zinc-900/60">
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="select-all truncate font-mono text-xs font-semibold text-foreground">
          {value}
        </div>
      </div>
      <V2Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => onCopy(value)}
        aria-label={t("lookupCopy", "Sao chép") + ` ${label}`}
        title={t("lookupCopy", "Sao chép")}
        className="h-6 shrink-0 px-1.5 text-xs text-muted-foreground hover:text-foreground"
        leftIcon={
          copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )
        }
      >
        <span className="text-[11px]">
          {copied ? t("lookupCopied", "Đã chép") : t("lookupCopy", "Chép")}
        </span>
      </V2Button>
    </div>
  );
}
