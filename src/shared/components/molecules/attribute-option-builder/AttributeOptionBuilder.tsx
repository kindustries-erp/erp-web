import React, { useState, useMemo } from "react";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { ModuleAttributeOption } from "@/core/api/moduleConfigApi";
import type { ErpModuleDomain } from "@/shared/types/customFields";
import {
  resolveOptionAccountCode,
  cleanOptionDisplayLabel,
} from "@/shared/utils/accountCodeHelper";
import { AttributeOptionRow } from "./components/AttributeOptionRow";
import { AttributeOptionAddForm } from "./components/AttributeOptionAddForm";

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
  t,
}: AttributeOptionBuilderProps) {
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabels, setNewOptionLabels] = useState<
    Record<string, string>
  >({ vi: "", en: "" });
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
  const [editingOptionAccountCode, setEditingOptionAccountCode] = useState<
    string | null
  >(null);
  const [
    editingOptionDefaultDebitAccountId,
    setEditingOptionDefaultDebitAccountId,
  ] = useState<string | null>(null);

  const isAccountingCategory = useMemo(() => {
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
      labels: { ...newOptionLabels, vi: cleanVi, en: cleanEn || "" },
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
    setEditingOptionAccountCode(resolveOptionAccountCode(opt));
    setEditingOptionDefaultDebitAccountId(opt.defaultDebitAccountId || null);

    const rawVi = opt.label || opt.labels?.vi || "";
    const rawEn = opt.labelEn || opt.labels?.en || "";
    setEditingOptionLabels({
      vi: cleanOptionDisplayLabel(rawVi),
      en: cleanOptionDisplayLabel(rawEn),
      ...(opt.labels || {}),
    });
  };

  const handleSaveEdit = (idx: number) => {
    const next = [...options];
    const target = next[idx];
    if (target) {
      const cleanVi = cleanOptionDisplayLabel(
        editingOptionLabels.vi || target.value,
      );
      const cleanEn = editingOptionLabels.en
        ? cleanOptionDisplayLabel(editingOptionLabels.en)
        : undefined;
      target.labels = {
        ...editingOptionLabels,
        vi: cleanVi,
        en: cleanEn || "",
      };
      target.label = cleanVi || target.value;
      target.labelEn = cleanEn;
      target.accountCode = editingOptionAccountCode || undefined;
      target.defaultDebitAccountId =
        editingOptionDefaultDebitAccountId || undefined;
    }
    onChange(next);
    setEditingOptionIdx(null);
  };

  return (
    <div className="space-y-2.5">
      <AttributeOptionAddForm
        newOptionKey={newOptionKey}
        setNewOptionKey={setNewOptionKey}
        newOptionLabels={newOptionLabels}
        setNewOptionLabels={setNewOptionLabels}
        newOptionParentValue={newOptionParentValue}
        setNewOptionParentValue={setNewOptionParentValue}
        newOptionAccountCode={newOptionAccountCode}
        setNewOptionAccountCode={setNewOptionAccountCode}
        newOptionDefaultDebitAccountId={newOptionDefaultDebitAccountId}
        setNewOptionDefaultDebitAccountId={setNewOptionDefaultDebitAccountId}
        hasParentConstraint={hasParentConstraint}
        parentCategoryOptions={parentCategoryOptions}
        isAccountingCategory={isAccountingCategory}
        onAddOption={handleAddOption}
        t={t}
      />

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {options.map((opt, idx) => (
          <AttributeOptionRow
            key={opt.value || idx}
            opt={opt}
            idx={idx}
            isEditing={editingOptionIdx === idx}
            editingLabels={editingOptionLabels}
            setEditingLabels={setEditingOptionLabels}
            editingAccountCode={editingOptionAccountCode}
            setEditingAccountCode={setEditingOptionAccountCode}
            editingDefaultDebitAccountId={editingOptionDefaultDebitAccountId}
            setEditingDefaultDebitAccountId={
              setEditingOptionDefaultDebitAccountId
            }
            isAccountingCategory={isAccountingCategory}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditingOptionIdx(null)}
            onRemove={(i) => onChange(options.filter((_, idx) => idx !== i))}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
