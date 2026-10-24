import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

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
    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-950">
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="select-all truncate font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
          {value}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onCopy(value)}
        aria-label={t("lookupCopy", "Sao chép") + ` ${label}`}
        title={t("lookupCopy", "Sao chép")}
        className="h-6 shrink-0 px-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span className="ml-1 text-[11px]">
          {copied ? t("lookupCopied", "Đã chép") : t("lookupCopy", "Chép")}
        </span>
      </Button>
    </div>
  );
}
