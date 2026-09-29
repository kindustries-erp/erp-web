import { useAppStore } from "@/core/config/appStore";
import { resolveAttrName } from "@/core/api/moduleConfigApi";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/DatePicker";
import { AttributeTypeBadge } from "@/shared/components/AttributeTypeBadge";
import { CornerDownRight } from "lucide-react";
import { BufferedTextInput } from "../atoms/BufferedTextInput";
import { AttributeFieldLabel } from "../atoms/AttributeFieldLabel";
import { AttributeViewBox } from "../atoms/AttributeViewBox";
import { AttributeTreeBranch } from "../atoms/AttributeTreeBranch";
import { useCascadingSelectOptions } from "../../hooks/useCascadingSelectOptions";
import type { AttributeFieldRendererProps } from "../../domains/types";

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
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`attr-field-${attr.id}`}
                checked={value === true || value === "true"}
                onCheckedChange={(checked) =>
                  onChange(checked ? "true" : "false")
                }
              />
              <label
                htmlFor={`attr-field-${attr.id}`}
                className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-1"
              >
                {isChild && (
                  <CornerDownRight className="w-3 h-3 text-primary/70 shrink-0 inline-block mr-0.5" />
                )}
                <span>{displayName}</span>
                {attr.isRequired && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </label>
            </div>
            {attr.isSystem ? (
              <AttributeTypeBadge type="system" />
            ) : (
              <AttributeTypeBadge type="custom" />
            )}
          </div>
        );
      }

      if (attr.fieldType === "SELECT") {
        return (
          <DrawerField label={fieldLabel} required={attr.isRequired}>
            <Combobox
              options={optList}
              value={value || ""}
              onChange={(v) => onChange(v || null)}
              placeholder={selectPlaceholder}
              allowClear={!attr.isRequired}
              disabled={disabled}
            />
          </DrawerField>
        );
      }

      if (attr.fieldType === "NUMBER") {
        return (
          <DrawerField label={fieldLabel} required={attr.isRequired}>
            <BufferedTextInput
              type="number"
              className={inputCls}
              value={value !== undefined && value !== null ? value : ""}
              onChange={onChange}
              placeholder={`${t("common.enter", "Nhập")} ${displayName}...`}
            />
          </DrawerField>
        );
      }

      if (attr.fieldType === "DATE") {
        return (
          <DrawerField label={fieldLabel} required={attr.isRequired}>
            <DatePicker
              value={value || ""}
              onChange={onChange}
              placeholder={t("common.dateFormat", "DD/MM/YYYY")}
            />
          </DrawerField>
        );
      }

      // Default: TEXT
      return (
        <DrawerField label={fieldLabel} required={attr.isRequired}>
          <BufferedTextInput
            type="text"
            className={inputCls}
            value={value !== undefined && value !== null ? value : ""}
            onChange={onChange}
            placeholder={`${t("common.enter", "Nhập")} ${displayName}...`}
          />
        </DrawerField>
      );
    }

    // View Mode
    return (
      <DrawerField label={fieldLabel} required={attr.isRequired}>
        <AttributeViewBox attr={attr} value={value} locale={locale} t={t} />
      </DrawerField>
    );
  };

  if (isChild) {
    return <AttributeTreeBranch>{renderFieldContent()}</AttributeTreeBranch>;
  }

  return renderFieldContent();
}
