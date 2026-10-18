import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { CoaCombobox } from "@/shared/components/CoaCombobox";
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import { inputCls } from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";

export interface AttributeOptionAddFormProps {
  newOptionKey: string;
  setNewOptionKey: (val: string) => void;
  newOptionLabels: Record<string, string>;
  setNewOptionLabels: (val: Record<string, string>) => void;
  newOptionParentValue: string;
  setNewOptionParentValue: (val: string) => void;
  newOptionAccountCode: string | null;
  setNewOptionAccountCode: (val: string | null) => void;
  newOptionDefaultDebitAccountId: string | null;
  setNewOptionDefaultDebitAccountId: (val: string | null) => void;
  hasParentConstraint?: boolean;
  parentCategoryOptions?: ComboboxOption[];
  isAccountingCategory: boolean;
  onAddOption: () => void;
  t: (key: string, fallback: string) => string;
}

export function AttributeOptionAddForm({
  newOptionKey,
  setNewOptionKey,
  newOptionLabels,
  setNewOptionLabels,
  newOptionParentValue,
  setNewOptionParentValue,
  newOptionAccountCode,
  setNewOptionAccountCode,
  newOptionDefaultDebitAccountId,
  setNewOptionDefaultDebitAccountId,
  hasParentConstraint,
  parentCategoryOptions = [],
  isAccountingCategory,
  onAddOption,
  t,
}: AttributeOptionAddFormProps) {
  return (
    <div
      className={cn(
        "grid gap-2 items-center bg-muted/20 p-2.5 rounded-lg border border-border/40",
        hasParentConstraint && isAccountingCategory
          ? "grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.2fr_1.5fr_auto]"
          : hasParentConstraint
            ? "grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.5fr_auto]"
            : isAccountingCategory
              ? "grid-cols-1 sm:grid-cols-[1fr_1.8fr_1.5fr_auto]"
              : "grid-cols-1 sm:grid-cols-[1fr_2fr_auto]",
      )}
    >
      <input
        type="text"
        className={`${inputCls} w-full font-mono text-xs`}
        placeholder={t("moduleConfig.optionKeyPlaceholder", "MÃ_OPT")}
        value={newOptionKey}
        onChange={(e) => setNewOptionKey(e.target.value.toUpperCase())}
      />
      <div className="min-w-0">
        <MultilingualInput
          values={newOptionLabels}
          onChange={setNewOptionLabels}
          placeholder={t(
            "moduleConfig.optionLabelPlaceholder",
            "Tên hiển thị tùy chọn...",
          )}
        />
      </div>
      {hasParentConstraint && (
        <div>
          <Combobox
            options={parentCategoryOptions}
            value={newOptionParentValue}
            onChange={(val) => setNewOptionParentValue(val || "")}
            placeholder={t(
              "moduleConfig.parentOptionPlaceholder",
              "Thuộc cha...",
            )}
            allowClear={true}
          />
        </div>
      )}
      {isAccountingCategory && (
        <div>
          <CoaCombobox
            value={newOptionAccountCode || newOptionDefaultDebitAccountId}
            onSelectAccount={(acc) => {
              setNewOptionAccountCode(acc?.accountCode || null);
              setNewOptionDefaultDebitAccountId(acc?.id || null);
            }}
            placeholder={t(
              "moduleConfig.coaPlaceholderShort",
              "TK Nợ (vd: 1561)...",
            )}
            allowClear={true}
          />
        </div>
      )}
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={onAddOption}
        className="h-8 gap-1 shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t("common.add", "Thêm")}</span>
      </Button>
    </div>
  );
}
