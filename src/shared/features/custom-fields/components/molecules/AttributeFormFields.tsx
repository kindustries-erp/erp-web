import React from "react";
import { AlertCircle, Tag, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { DrawerField } from "@/shared/components/DrawerModal";
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type {
  ModuleAttributeDef,
  ModuleAttributeFieldType,
  ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";
import type { ErpModuleDomain } from "../../domains/types";
import { AttributeOptionBuilder } from "./AttributeOptionBuilder";

export interface AttributeFormFieldsProps {
  editingAttr: ModuleAttributeDef | null;
  attrCode: string;
  setAttrCode: (val: string) => void;
  attrNames: Record<string, string>;
  setAttrNames: (val: Record<string, string>) => void;
  setAttrName: (val: string) => void;
  setAttrNameEn: (val: string) => void;
  attrFieldType: ModuleAttributeFieldType;
  setAttrFieldType: (val: ModuleAttributeFieldType) => void;
  attrRequired: boolean;
  setAttrRequired: (val: boolean) => void;
  attrParentAttrCode: string;
  setAttrParentAttrCode: (val: string) => void;
  attrOptions: ModuleAttributeOption[];
  setAttrOptions: (options: ModuleAttributeOption[]) => void;
  fieldTypeOptions: ComboboxOption[];
  parentSelectAttrOptions: ComboboxOption[];
  parentCategoryOptions: ComboboxOption[];
  activeModuleKey: string;
  domainKey?: ErpModuleDomain;
  locale: string;
  isSaving: boolean;
  t: (key: string, fallback: string) => string;
  onSave: () => void;
  onCancel: () => void;
}

export function AttributeFormFields({
  editingAttr,
  attrCode,
  setAttrCode,
  attrNames,
  setAttrNames,
  setAttrName,
  setAttrNameEn,
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
  const isCodeLocked = Boolean(
    editingAttr?.isSystem || (editingAttr && (editingAttr.usageCount || 0) > 0),
  );

  return (
    <div className="p-3.5 bg-muted/25 dark:bg-muted/10 rounded-xl flex flex-col gap-3 transition-all border border-border/40">
      <div className="flex items-center justify-between pb-1 border-b border-border/30">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {editingAttr
              ? editingAttr.isSystem
                ? t(
                    "moduleConfig.editSystemAttr",
                    "Chỉnh sửa thuộc tính mặc định",
                  )
                : t("moduleConfig.editAttr", "Chỉnh sửa thuộc tính")
              : t("moduleConfig.addAttr", "Thêm thuộc tính tùy chỉnh")}
          </span>
          {editingAttr?.isSystem && (
            <Tooltip
              content={t(
                "moduleConfig.systemAttrNotice",
                "Thuộc tính mặc định: Mã và Kiểu dữ liệu được cố định để bảo vệ tính toàn vẹn dữ liệu.",
              )}
            >
              <span className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground cursor-help ml-0.5 p-0.5 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </Tooltip>
          )}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          onClick={onCancel}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        <div className="sm:col-span-3">
          <DrawerField
            label={t("moduleConfig.attrCode", "Mã thuộc tính")}
            required
          >
            <input
              type="text"
              className={cn(
                "w-full text-xs rounded-lg px-3 py-2 outline-none transition-all",
                isCodeLocked
                  ? "bg-muted/50 text-muted-foreground border border-border/40 cursor-not-allowed font-mono text-[11px]"
                  : "text-foreground bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20",
              )}
              value={attrCode}
              onChange={(e) => setAttrCode(e.target.value)}
              placeholder={t(
                "moduleConfig.attrCodePlaceholder",
                "VD: color, payment_status",
              )}
              disabled={isCodeLocked}
            />
          </DrawerField>
        </div>

        <div className="sm:col-span-5">
          <DrawerField
            label={t("moduleConfig.attrName", "Tên hiển thị")}
            required
          >
            <MultilingualInput
              values={attrNames}
              onChange={(newValues) => {
                setAttrNames(newValues);
                setAttrName(newValues.vi || "");
                setAttrNameEn(newValues.en || "");
              }}
              placeholder={t(
                "moduleConfig.attrNamePlaceholder",
                "VD: Màu sắc, Loại nhập...",
              )}
            />
          </DrawerField>
        </div>

        <div className="sm:col-span-2">
          <DrawerField
            label={t("moduleConfig.attrFieldType", "Kiểu dữ liệu")}
            required
          >
            <Combobox
              options={fieldTypeOptions}
              value={attrFieldType}
              onChange={(v) => setAttrFieldType(v as ModuleAttributeFieldType)}
              disabled={isCodeLocked}
              placeholder={t(
                "moduleConfig.selectTypePlaceholder",
                "Chọn kiểu dữ liệu",
              )}
              allowClear={false}
            />
          </DrawerField>
        </div>

        <div className="sm:col-span-2">
          <DrawerField label={t("moduleConfig.attrConstraint", "Ràng buộc")}>
            <div className="flex items-center gap-1.5 h-9 select-none">
              <Checkbox
                id="attr-required-cb"
                checked={attrRequired}
                onCheckedChange={(c) => setAttrRequired(Boolean(c))}
              />
              <label
                htmlFor="attr-required-cb"
                className="text-xs text-foreground font-medium cursor-pointer whitespace-nowrap"
              >
                {t("moduleConfig.requiredBadge", "Bắt buộc")}
              </label>
            </div>
          </DrawerField>
        </div>

        {attrFieldType === "SELECT" && (
          <div className="sm:col-span-12 pt-1 border-t border-border/20">
            <DrawerField
              label={
                <div className="flex items-center gap-1.5">
                  <span>
                    {t(
                      "moduleConfig.parentAttrLabel",
                      "Thuộc tính cha (Phụ thuộc vào)",
                    )}
                  </span>
                  <Tooltip
                    content={t(
                      "moduleConfig.parentAttrTooltip",
                      "Nếu thuộc tính này phụ thuộc vào một thuộc tính SELECT khác, hãy chọn thuộc tính cha tại đây.",
                    )}
                  >
                    <AlertCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                  </Tooltip>
                </div>
              }
            >
              <Combobox
                options={parentSelectAttrOptions}
                value={attrParentAttrCode}
                onChange={(v) => setAttrParentAttrCode(v || "")}
                placeholder={t(
                  "moduleConfig.noParentAttr",
                  "— Không phụ thuộc (Thuộc tính độc lập) —",
                )}
                allowClear={true}
              />
            </DrawerField>
          </div>
        )}
      </div>

      {attrFieldType === "SELECT" && (
        <div className="flex flex-col gap-2 pt-1 border-t border-border/30 mt-1">
          <AttributeOptionBuilder
            options={attrOptions}
            onChange={setAttrOptions}
            hasParentConstraint={parentCategoryOptions.length > 0}
            parentCategoryOptions={parentCategoryOptions}
            activeModuleKey={activeModuleKey}
            attrCode={attrCode}
            domainKey={domainKey}
            locale={locale}
            t={t}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30 mt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-xs h-8"
        >
          {t("common.cancel", "Hủy")}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
          {editingAttr
            ? t("common.save", "Lưu")
            : t("common.create", "Tạo mới")}
        </Button>
      </div>
    </div>
  );
}
