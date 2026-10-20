import React from "react";
import { Check, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import { MultilingualBadge } from "@/shared/components/MultilingualBadge";
import { CoaCombobox } from "@/shared/components/CoaCombobox";
import type { ModuleAttributeOption } from "@/core/api/moduleConfigApi";

export interface AttributeOptionRowProps {
  opt: ModuleAttributeOption;
  idx: number;
  isEditing: boolean;
  editingLabels: Record<string, string>;
  setEditingLabels: (val: Record<string, string>) => void;
  editingAccountCode: string | null;
  setEditingAccountCode: (val: string | null) => void;
  editingDefaultDebitAccountId: string | null;
  setEditingDefaultDebitAccountId: (val: string | null) => void;
  isAccountingCategory: boolean;
  onStartEdit: (idx: number, opt: ModuleAttributeOption) => void;
  onSaveEdit: (idx: number) => void;
  onCancelEdit: () => void;
  onRemove: (idx: number) => void;
  t: (key: string, fallback: string) => string;
}

export function AttributeOptionRow({
  opt,
  idx,
  isEditing,
  editingLabels,
  setEditingLabels,
  editingAccountCode,
  setEditingAccountCode,
  editingDefaultDebitAccountId,
  setEditingDefaultDebitAccountId,
  isAccountingCategory,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  t,
}: AttributeOptionRowProps) {
  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-surface rounded-lg border border-primary/40 shadow-xs">
        <span className="font-mono text-xs font-semibold px-2 py-1 bg-muted rounded shrink-0">
          {opt.value}
        </span>
        <div className="flex-1 min-w-0">
          <MultilingualInput
            values={editingLabels}
            onChange={setEditingLabels}
            placeholder={t(
              "moduleConfig.optionLabelPlaceholder",
              "Tên hiển thị...",
            )}
          />
        </div>
        {isAccountingCategory && (
          <div className="w-full sm:w-44">
            <CoaCombobox
              value={editingAccountCode || editingDefaultDebitAccountId}
              onSelectAccount={(acc) => {
                setEditingAccountCode(acc?.accountCode || null);
                setEditingDefaultDebitAccountId(acc?.id || null);
              }}
              placeholder={t("moduleConfig.coaPlaceholderShort", "TK Nợ...")}
              allowClear={true}
            />
          </div>
        )}
        <div className="flex items-center gap-1 shrink-0 justify-end">
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={() => onSaveEdit(idx)}
            className="h-8 w-8 p-0"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
            className="h-8 w-8 p-0"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-surface/80 hover:bg-muted/30 rounded-lg text-xs border border-border/40 transition-colors group">
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
        <span className="font-mono font-medium text-foreground">
          {opt.value}
        </span>
        <span className="text-muted-foreground/60">•</span>
        <MultilingualBadge
          labels={opt.labels}
          fallbackText={opt.label || opt.value}
          fallbackEnText={opt.labelEn}
        />
        {opt.parentValue && (
          <span className="text-[10px] text-muted-foreground font-mono">
            (↳ {opt.parentValue})
          </span>
        )}
        {opt.accountCode && (
          <Badge
            variant="outline"
            className="text-[10px] font-mono font-medium py-0 px-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
          >
            TK: {opt.accountCode}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2 opacity-80 group-hover:opacity-100">
        <Tooltip
          content={t("moduleConfig.editOption", "Sửa tùy chọn")}
          side="top"
        >
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(idx, opt)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-3 h-3" />
          </Button>
        </Tooltip>
        <Tooltip content={t("moduleConfig.deleteOption", "Xóa")} side="top">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onRemove(idx)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
