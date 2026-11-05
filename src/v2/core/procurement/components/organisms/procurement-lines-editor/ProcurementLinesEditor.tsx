import { Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  emptyProcurementLine,
  type ProcurementLineFormValue,
} from "../../../form/procurementLine.form";
import { ProcurementLineRow } from "./ProcurementLineRow";

export interface ProcurementLinesEditorProps {
  lines: ProcurementLineFormValue[];
  onChange: (lines: ProcurementLineFormValue[]) => void;
  viewing: boolean;
  priceLabel: string;
  errorText?: string;
}

const GRID =
  "md:grid-cols-[110px_120px_minmax(160px,1fr)_110px_120px_130px_36px]";

/** Bảng dòng chứng từ PR/PO chuẩn V2: responsive mobile-first và touch target >= 44px. */
export function ProcurementLinesEditor({
  lines,
  onChange,
  viewing,
  priceLabel,
  errorText,
}: ProcurementLinesEditorProps) {
  const { t } = useV2Translation();
  const patch = (key: string, ch: Partial<ProcurementLineFormValue>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...ch } : l)));

  const typeOptions = [
    { value: "GOODS", label: t("v2.procurement.lines.goods", "Hàng hóa") },
    { value: "SERVICE", label: t("v2.procurement.lines.service", "Dịch vụ") },
  ];

  return (
    <div className="space-y-3">
      <div
        className={`hidden gap-2 px-1 text-xs font-medium text-muted-foreground md:grid ${GRID}`}
      >
        <span>{t("v2.procurement.lines.type", "Loại")}</span>
        <span>{t("v2.procurement.lines.code", "Mã")}</span>
        <span>{t("v2.procurement.lines.name", "Tên")}</span>
        <span>{t("v2.procurement.lines.qty", "Số lượng")}</span>
        <span>{priceLabel}</span>
        <span>{t("v2.procurement.lines.amount", "Thành tiền")}</span>
        <span />
      </div>

      {lines.map((line, idx) => (
        <ProcurementLineRow
          key={line.key}
          line={line}
          index={idx}
          viewing={viewing}
          priceLabel={priceLabel}
          canRemove={lines.length > 1}
          typeOptions={typeOptions}
          onPatch={(ch) => patch(line.key, ch)}
          onRemove={() => onChange(lines.filter((l) => l.key !== line.key))}
        />
      ))}

      {errorText && <p className="text-sm text-destructive">{errorText}</p>}

      {!viewing && (
        <V2Button
          variant="outline"
          size="sm"
          className="h-11 md:h-9 min-h-[44px] md:min-h-0"
          onClick={() => onChange([...lines, emptyProcurementLine()])}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("v2.procurement.lines.add", "Thêm dòng")}
        </V2Button>
      )}
    </div>
  );
}
