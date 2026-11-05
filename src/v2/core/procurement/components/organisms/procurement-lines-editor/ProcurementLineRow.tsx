import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  V2Button,
  V2Combobox,
  V2NumberInput,
  V2ReadValue,
  V2TextField,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  procurementLineAmount,
  toNumberOrNull,
  type ProcurementLineFormValue,
} from "../../../form/procurementLine.form";

export interface ProcurementLineRowProps {
  line: ProcurementLineFormValue;
  index: number;
  viewing: boolean;
  priceLabel: string;
  canRemove: boolean;
  typeOptions: { value: string; label: string }[];
  onPatch: (change: Partial<ProcurementLineFormValue>) => void;
  onRemove: () => void;
}

const GRID =
  "md:grid-cols-[110px_120px_minmax(160px,1fr)_110px_120px_130px_36px]";

const MobileLbl = ({ text }: { text: string }) => (
  <span className="mb-1 block text-[11px] font-medium text-muted-foreground md:hidden">
    {text}
  </span>
);

const fmtAmount = (amt: number | null) =>
  amt == null ? "—" : amt.toLocaleString("vi-VN", { maximumFractionDigits: 3 });

/** Dòng chi tiết nhập liệu PR/PO render bằng array config, hỗ trợ responsive mobile-first. */
export function ProcurementLineRow({
  line,
  index,
  viewing,
  priceLabel,
  canRemove,
  typeOptions,
  onPatch,
  onRemove,
}: ProcurementLineRowProps) {
  const { t } = useV2Translation();

  const fields = [
    {
      key: "lineType",
      label: `${t("v2.procurement.lines.type", "Loại")} #${index + 1}`,
      render: () =>
        viewing ? (
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
              onPatch({
                lineType: v === "SERVICE" ? "SERVICE" : "GOODS",
              })
            }
          />
        ),
    },
    {
      key: "itemCode",
      label: t("v2.procurement.lines.code", "Mã"),
      render: () => (
        <V2TextField
          viewing={viewing}
          aria-label={t("v2.procurement.lines.code", "Mã")}
          className="font-mono text-base sm:text-sm"
          value={line.itemCode}
          onChange={(v) => onPatch({ itemCode: v })}
        />
      ),
    },
    {
      key: "itemName",
      label: t("v2.procurement.lines.name", "Tên"),
      render: () => (
        <V2TextField
          viewing={viewing}
          aria-label={t("v2.procurement.lines.name", "Tên")}
          className="text-base sm:text-sm"
          value={line.itemName}
          onChange={(v) => onPatch({ itemName: v })}
        />
      ),
    },
    {
      key: "qty",
      label: t("v2.procurement.lines.qty", "Số lượng"),
      render: () => (
        <V2NumberInput
          disabled={viewing}
          aria-label={t("v2.procurement.lines.qty", "Số lượng")}
          className="text-base sm:text-sm"
          decimals={3}
          min={0}
          value={toNumberOrNull(line.qty)}
          onValueChange={(v) => onPatch({ qty: v === null ? "" : String(v) })}
        />
      ),
    },
    {
      key: "price",
      label: priceLabel,
      render: () => (
        <V2NumberInput
          disabled={viewing}
          aria-label={priceLabel}
          className="text-base sm:text-sm"
          decimals={3}
          min={0}
          value={toNumberOrNull(line.price)}
          onValueChange={(v) => onPatch({ price: v === null ? "" : String(v) })}
        />
      ),
    },
    {
      key: "amount",
      label: t("v2.procurement.lines.amount", "Thành tiền"),
      render: () => (
        <V2ReadValue value={fmtAmount(procurementLineAmount(line))} />
      ),
    },
  ];

  return (
    <div
      className={`grid gap-2 rounded-lg border border-border/70 bg-card p-3 md:border-0 md:bg-transparent md:p-0 ${GRID}`}
    >
      {fields.map((field) => (
        <div key={field.key}>
          <MobileLbl text={field.label} />
          {field.render()}
        </div>
      ))}
      {!viewing && (
        <div className="flex items-center justify-end md:justify-center">
          <V2Button
            variant="ghost"
            size="icon-sm"
            className="h-11 w-11 md:h-8 md:w-8 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
            aria-label={t("v2.procurement.lines.remove", "Xóa dòng")}
            disabled={!canRemove}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </V2Button>
        </div>
      )}
    </div>
  );
}
