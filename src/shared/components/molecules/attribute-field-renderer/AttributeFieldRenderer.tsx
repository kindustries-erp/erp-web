import React from "react";
import { useAppStore } from "@/core/config/appStore";
import { resolveAttrName } from "@/core/api/moduleConfigApi";
import { DrawerField } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  BufferedTextInput,
  AttributeFieldLabel,
  AttributeViewBox,
  AttributeTreeBranch,
} from "@/shared/components/atoms";
import { useCascadingSelectOptions } from "@/shared/hooks/useCascadingSelectOptions";
import type { AttributeFieldRendererProps } from "@/shared/types/customFields";

export function AttributeFieldRenderer({
  attr,
  value,
  isEditable,
  moduleKey,
  categoryCode,
  allAttributes,
  onChange,
  t,
  isChild,
  parentDef,
}: AttributeFieldRendererProps) {
  const { locale } = useAppStore();
  const displayName = resolveAttrName(attr, moduleKey, categoryCode, t);
  const parentDisplayName = parentDef
    ? resolveAttrName(parentDef, moduleKey, categoryCode, t)
    : attr.parentAttrCode;

  const { optList, selectPlaceholder, disabled } = useCascadingSelectOptions({
    attr,
    parentDef,
    allAttributes,
    categoryCode,
    displayName,
    parentDisplayName,
    locale,
    t,
  });

  const fieldLabel = (
    <AttributeFieldLabel
      displayName={displayName}
      isSystem={attr.isSystem}
      isChild={isChild}
      parentDisplayName={parentDisplayName}
      parentCode={parentDef?.code}
      t={t}
    />
  );

  const renderFieldContent = () => {
    if (isEditable) {
      if (attr.fieldType === "CHECKBOX") {
        return (
          <div className="flex items-center space-x-2 pt-1 pb-1">
            <Checkbox
              id={`attr-edit-${attr.id}`}
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(Boolean(checked))}
            />
            <label
              htmlFor={`attr-edit-${attr.id}`}
              className="text-xs font-medium cursor-pointer select-none text-foreground"
            >
              {displayName}
            </label>
          </div>
        );
      }

      if (attr.fieldType === "SELECT") {
        return (
          <Combobox
            options={optList}
            value={value || ""}
            onChange={(val) => onChange(val || "")}
            placeholder={selectPlaceholder}
            disabled={disabled}
            allowClear={!attr.isRequired}
          />
        );
      }

      if (attr.fieldType === "DATE") {
        return (
          <DatePicker
            value={value || ""}
            onChange={(val) => onChange(val || "")}
            placeholder={`-- ${t("common.selectDate", "Chọn ngày")} --`}
          />
        );
      }

      return (
        <BufferedTextInput
          value={value}
          onChange={onChange}
          type={attr.fieldType === "NUMBER" ? "number" : "text"}
          placeholder={`-- ${t("common.enter", "Nhập")} ${displayName}... --`}
        />
      );
    }

    return <AttributeViewBox attr={attr} value={value} locale={locale} t={t} />;
  };

  const content =
    attr.fieldType === "CHECKBOX" && isEditable ? (
      renderFieldContent()
    ) : (
      <DrawerField label={fieldLabel} required={attr.isRequired && isEditable}>
        {renderFieldContent()}
      </DrawerField>
    );

  if (isChild) {
    return <AttributeTreeBranch>{content}</AttributeTreeBranch>;
  }

  return content;
}
