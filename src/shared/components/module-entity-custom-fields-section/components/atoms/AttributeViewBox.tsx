import { Badge } from "@/shared/components/ui/badge";
import { resolveOptionLabel } from "@/core/api/moduleConfigApi";
import { formatGMT7 } from "@/shared/utils/format";
import type { AttributeViewBoxProps } from "../../domains/types";

export function AttributeViewBox({
  attr,
  value,
  locale,
  t,
}: AttributeViewBoxProps) {
  let displayVal: React.ReactNode = value || "—";

  if (attr.fieldType === "CHECKBOX") {
    const isChecked = value === true || value === "true";
    displayVal = isChecked ? (
      <Badge variant="default" className="text-[10px]">
        {t("common.yes", "Có")}
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-[10px]">
        {t("common.no", "Không")}
      </Badge>
    );
  } else if (attr.fieldType === "SELECT") {
    const matchedOpt = (attr.options || []).find((o) => o.value === value);
    if (matchedOpt) {
      displayVal = resolveOptionLabel(matchedOpt, locale, t);
    }
  } else if (attr.fieldType === "DATE" && value) {
    displayVal = formatGMT7(value, "date") || value;
  }

  return (
    <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent min-h-[38px] flex items-center">
      {displayVal}
    </div>
  );
}
