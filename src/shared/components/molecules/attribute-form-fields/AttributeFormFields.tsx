import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/Combobox";
import { DrawerField } from "@/shared/components/DrawerModal";
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import type { ModuleAttributeFieldType } from "@/core/api/moduleConfigApi";
import { AttributeOptionBuilder } from "../attribute-option-builder";
import type { AttributeFormFieldsProps } from "./types";

export function AttributeFormFields({
  editingAttr,
  attrCode,
  setAttrCode,
  attrNames,
  setAttrNames,
  attrFieldType,
  setAttrFieldType,
  attrRequired,
  setAttrRequired,
  attrParentAttrCode,
  setAttrParentAttrCode,
  attrOptions,
  setAttrOptions,
  fieldTypeOptions,
  parentSelectAttrOptions,
  parentCategoryOptions,
  activeModuleKey,
  domainKey,
  locale,
  isSaving,
  t,
  onSave,
  onCancel,
}: AttributeFormFieldsProps) {
  const isEditing = Boolean(editingAttr);

  return (
    <div className="space-y-3.5 bg-muted/20 p-3.5 rounded-lg border border-border/50">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <span className="text-xs font-semibold text-foreground">
          {isEditing
            ? t("moduleConfig.editAttributeTitle", "Chỉnh sửa thuộc tính")
            : t("moduleConfig.addAttributeTitle", "Thêm thuộc tính mới")}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DrawerField
          label={t("moduleConfig.attrCodeLabel", "Mã thuộc tính (Code)")}
          required={true}
        >
          <input
            type="text"
            className="w-full font-mono text-xs px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            placeholder="MA_THUOC_TINH"
            value={attrCode}
            disabled={isEditing}
            onChange={(e) => setAttrCode(e.target.value.toUpperCase())}
          />
        </DrawerField>

        <DrawerField
          label={t("moduleConfig.attrTypeLabel", "Loại dữ liệu")}
          required={true}
        >
          <Combobox
            options={fieldTypeOptions}
            value={attrFieldType}
            onChange={(val) =>
              setAttrFieldType((val as ModuleAttributeFieldType) || "TEXT")
            }
            placeholder={t(
              "moduleConfig.selectTypePlaceholder",
              "Chọn loại...",
            )}
            disabled={isEditing}
          />
        </DrawerField>
      </div>

      <DrawerField
        label={t("moduleConfig.attrNameLabel", "Tên hiển thị (Song ngữ)")}
        required={true}
      >
        <MultilingualInput
          values={attrNames}
          onChange={setAttrNames}
          placeholder={t(
            "moduleConfig.attrNamePlaceholder",
            "Nhập tên hiển thị...",
          )}
        />
      </DrawerField>

      {attrFieldType === "SELECT" && parentSelectAttrOptions.length > 0 && (
        <DrawerField
          label={t(
            "moduleConfig.parentSelectLabel",
            "Phụ thuộc thuộc tính SELECT cha",
          )}
        >
          <Combobox
            options={parentSelectAttrOptions}
            value={attrParentAttrCode}
            onChange={(val) => setAttrParentAttrCode(val || "")}
            placeholder={`-- ${t("moduleConfig.noParentSelect", "Không phụ thuộc")} --`}
            allowClear={true}
          />
        </DrawerField>
      )}

      {attrFieldType === "SELECT" && (
        <DrawerField
          label={t(
            "moduleConfig.optionsListLabel",
            "Danh sách tùy chọn (Options)",
          )}
          required={true}
        >
          <AttributeOptionBuilder
            options={attrOptions}
            onChange={setAttrOptions}
            hasParentConstraint={Boolean(attrParentAttrCode)}
            parentCategoryOptions={parentCategoryOptions}
            activeModuleKey={activeModuleKey}
            attrCode={attrCode}
            domainKey={domainKey}
            locale={locale}
            t={t}
          />
        </DrawerField>
      )}

      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="attr-required-checkbox"
          checked={attrRequired}
          onCheckedChange={(checked) => setAttrRequired(Boolean(checked))}
        />
        <label
          htmlFor="attr-required-checkbox"
          className="text-xs font-medium cursor-pointer select-none text-foreground"
        >
          {t(
            "moduleConfig.requiredFieldCheckbox",
            "Bắt buộc nhập khi tạo mới / cập nhật",
          )}
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t("common.cancel", "Hủy")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
          className="gap-1.5"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>
            {isEditing
              ? t("common.update", "Cập nhật")
              : t("common.save", "Lưu")}
          </span>
        </Button>
      </div>
    </div>
  );
}
