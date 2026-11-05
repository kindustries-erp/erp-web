import { Plus, Trash2 } from "lucide-react";
import {
  V2Button,
  V2Combobox,
  V2NumberInput,
  V2ReadValue,
  V2TextField,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  emptyProcurementLine,
  procurementLineAmount,
  type ProcurementLineFormValue,
} from "../../../form/procurementLine.form";

export interface ProcurementLinesEditorProps {
  lines: ProcurementLineFormValue[];
  onChange: (lines: ProcurementLineFormValue[]) => void;
  viewing: boolean;
  /** Nhãn cột đơn giá: "Đơn giá" (PO) hoặc "Đơn giá dự kiến" (PR) */
  priceLabel: string;
  /** Lỗi tổng của bảng (dòng trống, thiếu tên, số lượng sai) */
  errorText?: string;
}

const GRID =
  "md:grid-cols-[110px_120px_minmax(160px,1fr)_110px_120px_130px_36px]";

/** Bảng dòng chứng từ dùng chung của PR và PO: sửa được khi nháp, chỉ đọc khi xem. */
export function ProcurementLinesEditor({
  lines,
  onChange,
  viewing,
  priceLabel,
  errorText,
}: ProcurementLinesEditorProps) {
  const { t } = useV2Translation();

  const patch = (key: string, change: Partial<ProcurementLineFormValue>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...change } : l)));

  const typeOptions = [
    { value: "GOODS", label: t("v2.procurement.lines.goods", "Hàng hóa") },
    { value: "SERVICE", label: t("v2.procurement.lines.service", "Dịch vụ") },
  ];

  return (
    <div className="space-y-2">
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

      {lines.map((line) => (
        <div
          key={line.key}
          className={`grid gap-2 rounded-md border border-border/60 p-2 md:border-0 md:p-0 ${GRID}`}
        >
          {viewing ? (
            <V2ReadValue
              value={
                typeOptions.find((o) => o.value === line.lineType)?.label ??
                line.lineType
              }
            />
          ) : (
            <V2Combobox
              aria-label={t("v2.procurement.lines.type", "Loại")}
              options={typeOptions}
              value={line.lineType}
              searchable={false}
              onValueChange={(v) =>
                patch(line.key, {
                  lineType: v === "SERVICE" ? "SERVICE" : "GOODS",
                })
              }
            />
          )}
          <V2TextField
            viewing={viewing}
            aria-label={t("v2.procurement.lines.code", "Mã")}
            className="font-mono"
            value={line.itemCode}
            onChange={(v) => patch(line.key, { itemCode: v })}
          />
          <V2TextField
            viewing={viewing}
            aria-label={t("v2.procurement.lines.name", "Tên")}
            value={line.itemName}
            onChange={(v) => patch(line.key, { itemName: v })}
          />
          <V2NumberInput
            disabled={viewing}
            aria-label={t("v2.procurement.lines.qty", "Số lượng")}
            decimals={3}
            min={0}
            value={numberOrNull(line.qty)}
            onValueChange={(v) =>
              patch(line.key, { qty: v === null ? "" : String(v) })
            }
          />
          <V2NumberInput
            disabled={viewing}
            aria-label={priceLabel}
            decimals={3}
            min={0}
            value={numberOrNull(line.price)}
            onValueChange={(v) =>
              patch(line.key, { price: v === null ? "" : String(v) })
            }
          />
          <V2ReadValue value={formatAmount(procurementLineAmount(line))} />
          {!viewing && (
            <V2Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("v2.procurement.lines.remove", "Xóa dòng")}
              disabled={lines.length <= 1}
              onClick={() => onChange(lines.filter((l) => l.key !== line.key))}
            >
              <Trash2 className="h-4 w-4" />
            </V2Button>
          )}
        </div>
      ))}

      {errorText && <p className="text-sm text-destructive">{errorText}</p>}

      {!viewing && (
        <V2Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...lines, emptyProcurementLine()])}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("v2.procurement.lines.add", "Thêm dòng")}
        </V2Button>
      )}
    </div>
  );
}

const numberOrNull = (value: string): number | null => {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const formatAmount = (amount: number | null): string =>
  amount === null
    ? "—"
    : amount.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
