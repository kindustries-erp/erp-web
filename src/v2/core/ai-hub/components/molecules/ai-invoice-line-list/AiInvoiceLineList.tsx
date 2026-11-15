import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  V2Badge,
  V2Button,
  V2Input,
  V2NumberInput,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { AiInvoiceDraftLine } from "../../../aiHub.type";

export interface AiInvoiceLineListProps {
  lines: AiInvoiceDraftLine[];
  disabled?: boolean;
  onChange: (key: string, patch: Partial<AiInvoiceDraftLine>) => void;
  onRemove: (key: string) => void;
}

/** Danh sách dòng hàng AI đọc được, dạng thẻ để vừa khung chat hẹp; sửa được mã và số lượng. */
export const AiInvoiceLineList: React.FC<AiInvoiceLineListProps> = ({
  lines,
  disabled = false,
  onChange,
  onRemove,
}) => {
  const { t } = useV2Translation();

  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line) => {
        const matched = line.match.status === "MATCHED";
        const codeLabel = t("v2.aiHub.line.code", "Mã hàng");
        const qtyLabel = t("v2.aiHub.line.qty", "Số lượng");
        return (
          <li
            key={line.key}
            data-testid="ai-invoice-line"
            className="rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {line.itemName}
                </p>
                {line.match.catalogItemName &&
                  line.match.catalogItemName !== line.itemName && (
                    <p className="truncate text-xs text-muted-fg">
                      {t("v2.aiHub.line.catalogName", {
                        defaultValue: "Trong danh mục: {{name}}",
                        name: line.match.catalogItemName,
                      })}
                    </p>
                  )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <V2Badge variant={matched ? "success" : "warning"}>
                  {matched
                    ? t("v2.aiHub.line.matched", "Đã có mã")
                    : t("v2.aiHub.line.isNew", "Mã mới")}
                </V2Badge>
                <V2Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  aria-label={t("v2.aiHub.line.remove", {
                    defaultValue: "Bỏ dòng {{name}}",
                    name: line.itemName,
                  })}
                  onClick={() => onRemove(line.key)}
                  className="h-11 w-11 sm:h-9 sm:w-9"
                >
                  <Trash2 aria-hidden className="h-4 w-4" />
                </V2Button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
              <V2Input
                size="lg"
                aria-label={codeLabel}
                value={line.itemCode}
                disabled={disabled}
                placeholder={t("v2.aiHub.line.codeAuto", "Tự sinh mã")}
                onChange={(event) =>
                  onChange(line.key, { itemCode: event.target.value })
                }
              />
              <V2NumberInput
                size="lg"
                aria-label={qtyLabel}
                value={line.qtyRequested}
                disabled={disabled}
                decimals={3}
                min={0}
                onValueChange={(value) =>
                  onChange(line.key, { qtyRequested: value })
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted-fg">
              {[
                line.unit,
                line.estUnitPrice !== null
                  ? `${t("v2.aiHub.line.unitPrice", "Đơn giá")}: ${formatAmount(line.estUnitPrice)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </li>
        );
      })}
    </ul>
  );
};
AiInvoiceLineList.displayName = "AiInvoiceLineList";
