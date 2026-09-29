import React, { useState, useMemo } from "react";
import { Plus, Check, X, Pencil, Database } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { CoaCombobox } from "@/shared/components/CoaCombobox";
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import { MultilingualBadge } from "@/shared/components/MultilingualBadge";
import { inputCls } from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";
import {
  resolveOptionLabel,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";
import type { ErpModuleDomain } from "../../domains/types";
import {
  resolveOptionAccountCode,
  cleanOptionDisplayLabel,
} from "../../utils/accountCodeHelper";

export interface AttributeOptionBuilderProps {
  options: ModuleAttributeOption[];
  onChange: (options: ModuleAttributeOption[]) => void;
  hasParentConstraint?: boolean;
  parentCategoryOptions?: ComboboxOption[];
  activeModuleKey: string;
  attrCode?: string;
  domainKey?: ErpModuleDomain;
  locale: string;
  t: (key: string, fallback: string) => string;
}

export function AttributeOptionBuilder({
  options,
  onChange,
  hasParentConstraint,
  parentCategoryOptions = [],
  activeModuleKey,
  attrCode,
  domainKey,
  locale,
  t,
}: AttributeOptionBuilderProps) {
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabels, setNewOptionLabels] = useState<
    Record<string, string>
  >({
    vi: "",
    en: "",
  });
  const [newOptionParentValue, setNewOptionParentValue] = useState("");
  const [newOptionAccountCode, setNewOptionAccountCode] = useState<
    string | null
  >(null);
  const [newOptionDefaultDebitAccountId, setNewOptionDefaultDebitAccountId] =
    useState<string | null>(null);

  const [editingOptionIdx, setEditingOptionIdx] = useState<number | null>(null);
  const [editingOptionLabels, setEditingOptionLabels] = useState<
    Record<string, string>
  >({});
  const [editingOptionParentValue, setEditingOptionParentValue] = useState("");
  const [editingOptionAccountCode, setEditingOptionAccountCode] = useState<
    string | null
  >(null);
  const [
    editingOptionDefaultDebitAccountId,
    setEditingOptionDefaultDebitAccountId,
  ] = useState<string | null>(null);

  const isAccountingCategoryAttribute = useMemo(() => {
    const key = (activeModuleKey || "").toUpperCase();
    const code = (attrCode || "").toLowerCase();
    return (
      code === "category" ||
      key.includes("INVOICE") ||
      key.includes("BANK_TXN") ||
      key.includes("JOURNAL") ||
      domainKey === "FINANCE"
    );
  }, [attrCode, activeModuleKey, domainKey]);

  const handleAddOption = () => {
    const key = newOptionKey.trim();
    const rawLabelVi = newOptionLabels.vi?.trim() || key;
    if (!key) return;

    if (options.some((o) => o.value === key)) {
      alert(t("moduleConfig.optionKeyExists", "Mã tùy chọn đã tồn tại!"));
      return;
    }

    const resolvedAccountCode =
      newOptionAccountCode ||
      resolveOptionAccountCode({
        value: key,
        label: rawLabelVi,
        labels: newOptionLabels,
      }) ||
      undefined;

    const cleanVi = cleanOptionDisplayLabel(rawLabelVi) || key;
    const cleanEn = newOptionLabels.en?.trim()
      ? cleanOptionDisplayLabel(newOptionLabels.en.trim())
      : undefined;

    const newOpt: ModuleAttributeOption = {
      value: key,
      label: cleanVi,
      labelEn: cleanEn,
      labels: {
        ...newOptionLabels,
        vi: cleanVi,
        en: cleanEn || "",
      },
      parentValue: newOptionParentValue || undefined,
      accountCode: resolvedAccountCode,
      defaultDebitAccountId: newOptionDefaultDebitAccountId || undefined,
    };

    onChange([...options, newOpt]);
    setNewOptionKey("");
    setNewOptionLabels({ vi: "", en: "" });
    setNewOptionParentValue("");
    setNewOptionAccountCode(null);
    setNewOptionDefaultDebitAccountId(null);
  };

  const handleStartEdit = (idx: number, opt: ModuleAttributeOption) => {
    setEditingOptionIdx(idx);
    const resolvedCode = resolveOptionAccountCode(opt);
    setEditingOptionAccountCode(resolvedCode);
    setEditingOptionDefaultDebitAccountId(opt.defaultDebitAccountId || null);
    setEditingOptionParentValue(opt.parentValue || "");

    const rawVi = opt.label || opt.labels?.vi || "";
    const rawEn = opt.labelEn || opt.labels?.en || "";
    const cleanVi = cleanOptionDisplayLabel(rawVi);
    const cleanEn = cleanOptionDisplayLabel(rawEn);

    const initialLabels: Record<string, string> = {
      vi: cleanVi,
      en: cleanEn,
      ...(opt.labels || {}),
    };
    if (cleanVi) initialLabels.vi = cleanVi;
    if (cleanEn) initialLabels.en = cleanEn;

    setEditingOptionLabels(initialLabels);
  };

  const handleSaveEdit = (idx: number) => {
    const next = [...options];
    const target = next[idx];
    if (target) {
      const rawVi = editingOptionLabels.vi || target.value;
      const rawEn = editingOptionLabels.en || undefined;
      const cleanVi = cleanOptionDisplayLabel(rawVi);
      const cleanEn = rawEn ? cleanOptionDisplayLabel(rawEn) : undefined;

      target.labels = {
        ...editingOptionLabels,
        vi: cleanVi,
        en: cleanEn || "",
      };
      target.label = cleanVi || target.value;
      target.labelEn = cleanEn;
      target.parentValue = editingOptionParentValue || undefined;
      target.accountCode = editingOptionAccountCode || undefined;
      target.defaultDebitAccountId =
        editingOptionDefaultDebitAccountId || undefined;
    }
    onChange(next);
    setEditingOptionIdx(null);
  };

  const handleRemoveOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2.5">
      {/* Add new option bar */}
      <div
        className={cn(
          "grid gap-2 items-center bg-muted/20 p-2.5 rounded-lg border border-border/40",
          hasParentConstraint && isAccountingCategoryAttribute
            ? "grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.2fr_1.5fr_auto]"
            : hasParentConstraint
              ? "grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.5fr_auto]"
              : isAccountingCategoryAttribute
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
        {isAccountingCategoryAttribute && (
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
          onClick={handleAddOption}
          className="h-8 gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t("common.add", "Thêm")}</span>
        </Button>
      </div>

      {/* Options list */}
      {options.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/10 rounded-lg border border-border/30 max-h-48 overflow-y-auto">
          {options.map((opt, idx) => {
            const isEditing = editingOptionIdx === idx;
            const optUsage = (opt as any).usageCount || 0;
            const isOptionInUse = optUsage > 0;
            const usedCount = optUsage;
            const resolvedAccountCode = resolveOptionAccountCode(opt);
            const rawLabel = resolveOptionLabel(opt, locale, t);
            const currentLabel = cleanOptionDisplayLabel(rawLabel) || rawLabel;

            if (isEditing) {
              return (
                <div
                  key={opt.value}
                  className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface border border-primary/40 rounded-lg w-full"
                >
                  <span className="font-mono text-xs font-bold text-foreground px-2 py-1 bg-muted/60 rounded">
                    {opt.value}
                  </span>
                  <div className="flex-1 min-w-[160px]">
                    <MultilingualInput
                      values={editingOptionLabels}
                      onChange={setEditingOptionLabels}
                    />
                  </div>
                  {hasParentConstraint && (
                    <div className="w-32">
                      <Combobox
                        options={parentCategoryOptions}
                        value={editingOptionParentValue}
                        onChange={(val) =>
                          setEditingOptionParentValue(val || "")
                        }
                        placeholder={t(
                          "moduleConfig.parentOptionPlaceholder",
                          "Thuộc cha...",
                        )}
                        allowClear={true}
                      />
                    </div>
                  )}
                  {isAccountingCategoryAttribute && (
                    <div className="w-full sm:w-44">
                      <CoaCombobox
                        value={
                          editingOptionAccountCode ||
                          editingOptionDefaultDebitAccountId
                        }
                        onSelectAccount={(acc) => {
                          setEditingOptionAccountCode(acc?.accountCode || null);
                          setEditingOptionDefaultDebitAccountId(
                            acc?.id || null,
                          );
                        }}
                        placeholder={t(
                          "moduleConfig.coaPlaceholderShort",
                          "TK Nợ (vd: 1561)...",
                        )}
                        allowClear={true}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      className="text-emerald-600 hover:bg-emerald-100 p-1 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingOptionIdx(null)}
                      className="text-muted-foreground hover:bg-muted p-1 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <Badge
                key={opt.value}
                variant="secondary"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border/40 shadow-2xs group/opt"
              >
                <span className="font-mono text-[10px] font-semibold">
                  {opt.value}
                </span>
                <span className="text-muted-foreground text-[10px]">•</span>
                <span>{currentLabel}</span>

                {resolvedAccountCode && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    title={t(
                      "moduleConfig.defaultDebitAccountBadge",
                      "Tài khoản Nợ mặc định: {{code}}",
                    ).replace("{{code}}", resolvedAccountCode)}
                  >
                    TK {resolvedAccountCode}
                  </span>
                )}

                {opt.parentValue && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {opt.parentValue}
                  </span>
                )}

                <MultilingualBadge
                  labels={opt.labels}
                  fallbackText={opt.label}
                  fallbackEnText={opt.labelEn}
                  itemKey={opt.value}
                />

                {isOptionInUse && (
                  <Tooltip
                    content={t(
                      "moduleConfig.optionInUseTooltip",
                      "Đang có {{count}} bản ghi sử dụng tùy chọn này, không thể xóa",
                    ).replace("{{count}}", String(usedCount))}
                  >
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded text-muted-foreground bg-black/5 dark:bg-white/5 border border-border/40">
                      <Database className="w-2.5 h-2.5 text-muted-foreground/80 shrink-0" />
                      <span>{usedCount}</span>
                    </span>
                  </Tooltip>
                )}

                <button
                  type="button"
                  onClick={() => handleStartEdit(idx, opt)}
                  className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded cursor-pointer"
                  title={t("common.edit", "Sửa")}
                  aria-label={t("common.edit", "Sửa")}
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>

                {isOptionInUse ? (
                  <span className="text-muted-foreground/30 p-0.5 cursor-not-allowed">
                    <X className="w-3 h-3" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      ) : (
        <span className="text-[11px] text-muted-foreground italic px-1">
          {t(
            "moduleConfig.noOptionsHint",
            "Chưa có tùy chọn nào. Nhập Mã & Tên ở trên rồi bấm Thêm.",
          )}
        </span>
      )}
    </div>
  );
}
