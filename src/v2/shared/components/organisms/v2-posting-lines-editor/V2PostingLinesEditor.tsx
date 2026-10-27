import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import "./V2PostingLinesEditor.locale";
import {
  addPostingLine,
  removePostingLine,
  totalsOf,
  updatePostingLine,
} from "./postingLines.helper";
import type { V2PostingLinesEditorProps } from "./V2PostingLinesEditor.type";

/** Bảng nhập bút toán Nợ/Có: chọn tài khoản, nhập Nợ hoặc Có cho từng dòng, và tổng cân bằng */
export function V2PostingLinesEditor({
  lines,
  accounts,
  onChange,
  disabled = false,
  autoBalance = false,
  className,
}: V2PostingLinesEditorProps) {
  const { t } = useV2Translation();
  const totals = totalsOf(lines);

  return (
    <div className={cn("space-y-2", className)}>
      {lines.length === 0 && (
        <p className="text-xs text-muted-fg">
          {t("v2.postingLines.empty", "Chưa có dòng hạch toán")}
        </p>
      )}

      {lines.map((line) => (
        <div
          key={line.id}
          className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2"
        >
          <V2Combobox
            aria-label={t("v2.postingLines.account", "Tài khoản")}
            options={accounts}
            value={line.accountId || null}
            placeholder={t(
              "v2.postingLines.accountPlaceholder",
              "Chọn tài khoản",
            )}
            onValueChange={(value) =>
              onChange(
                updatePostingLine(lines, line.id, { accountId: value ?? "" }),
              )
            }
            disabled={disabled}
          />
          <V2NumberInput
            aria-label={t("v2.postingLines.debit", "Nợ")}
            value={line.debit || null}
            min={0}
            disabled={disabled}
            onValueChange={(value) =>
              onChange(updatePostingLine(lines, line.id, { debit: value ?? 0 }))
            }
          />
          <V2NumberInput
            aria-label={t("v2.postingLines.credit", "Có")}
            value={line.credit || null}
            min={0}
            disabled={disabled}
            onValueChange={(value) =>
              onChange(
                updatePostingLine(lines, line.id, { credit: value ?? 0 }),
              )
            }
          />
          <V2Input
            aria-label={t("v2.postingLines.description", "Diễn giải dòng")}
            value={line.description}
            disabled={disabled}
            onChange={(e) =>
              onChange(
                updatePostingLine(lines, line.id, {
                  description: e.target.value,
                }),
              )
            }
          />
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("v2.postingLines.removeLine", "Xóa dòng")}
            disabled={disabled}
            onClick={() => onChange(removePostingLine(lines, line.id))}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </V2Button>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <V2Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={() => onChange(addPostingLine(lines, { autoBalance }))}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("v2.postingLines.addLine", "Thêm dòng")}
        </V2Button>

        <div
          className={cn(
            "text-xs font-medium tabular-nums",
            totals.balanced
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          {t("v2.postingLines.totalDebit", "Tổng Nợ")}:{" "}
          {formatAmount(totals.totalDebit)} ·{" "}
          {t("v2.postingLines.totalCredit", "Tổng Có")}:{" "}
          {formatAmount(totals.totalCredit)} ·{" "}
          {totals.balanced
            ? t("v2.postingLines.balanced", "Đã cân bằng")
            : t("v2.postingLines.unbalanced", "Chưa cân bằng")}
        </div>
      </div>
    </div>
  );
}
