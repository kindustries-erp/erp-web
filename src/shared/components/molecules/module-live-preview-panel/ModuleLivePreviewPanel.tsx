import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Tag, CornerDownRight } from "lucide-react";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { cn } from "@/shared/utils";
import {
  resolveAttrName,
  resolveOptionLabel,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import { buildAttributeTree } from "@/shared/utils/buildAttributeTree";
import { NeutralCountBadge } from "@/shared/components/atoms";

export interface ModuleLivePreviewPanelProps {
  attributes?: ModuleAttributeDef[];
  globalDefs?: ModuleAttributeDef[];
  moduleKey?: string;
  resetKey?: number;
}

export function ModuleLivePreviewPanel({
  attributes,
  globalDefs = [],
  moduleKey,
  resetKey,
}: ModuleLivePreviewPanelProps) {
  const t = useT();
  const locale = useAppStore((s) => s.locale);
  const [mockValues, setMockValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setMockValues({});
  }, [resetKey, moduleKey]);

  const allDefs = useMemo(
    () => attributes || globalDefs || [],
    [attributes, globalDefs],
  );
  const activeAttrs = useMemo(
    () => allDefs.filter((d) => !d.isDeleted && d.isActive !== false),
    [allDefs],
  );

  const systemAttrs = useMemo(
    () => activeAttrs.filter((d) => Boolean(d.isSystem)),
    [activeAttrs],
  );
  const customAttrs = useMemo(
    () => activeAttrs.filter((d) => !d.isSystem),
    [activeAttrs],
  );

  const handleFieldChange = (code: string, val: any) => {
    setMockValues((prev) => {
      const next = { ...prev, [code]: val };
      const childDefs = activeAttrs.filter((d) => d.parentAttrCode === code);
      for (const child of childDefs) {
        if (next[child.code]) {
          const childOpt = (child.options || []).find(
            (o) => o.value === next[child.code],
          );
          if (childOpt?.parentValue && childOpt.parentValue !== val) {
            delete next[child.code];
          }
        }
      }
      return next;
    });
  };

  const renderSingleInput = (
    attr: ModuleAttributeDef,
    isChild = false,
    parentDef?: ModuleAttributeDef,
  ) => {
    const val = mockValues[attr.code];
    const displayName = resolveAttrName(attr, moduleKey || "", locale, t);
    const parentDisplayName = parentDef
      ? resolveAttrName(parentDef, moduleKey || "", locale, t)
      : attr.parentAttrCode;

    const childIndicator = isChild && (
      <span className="inline-flex items-center gap-1 text-[10px] text-primary/80 font-normal">
        <CornerDownRight className="w-3 h-3 text-primary shrink-0" />
        <span>
          {t("moduleConfig.childOf", "Phụ thuộc")}: {parentDisplayName}
        </span>
      </span>
    );

    if (attr.fieldType === "CHECKBOX") {
      return (
        <div
          key={attr.id}
          className={cn(
            "flex flex-col gap-0.5 select-none",
            isChild &&
              "ml-3 pl-3 border-l-2 border-primary/40 dark:border-primary/30 mt-1 py-1",
          )}
        >
          {childIndicator}
          <div className="flex items-center gap-2 py-0.5">
            <Checkbox
              id={`preview-attr-${attr.id}`}
              checked={Boolean(val)}
              onCheckedChange={(checked) =>
                handleFieldChange(attr.code, Boolean(checked))
              }
            />
            <label
              htmlFor={`preview-attr-${attr.id}`}
              className="text-xs text-foreground cursor-pointer font-medium flex items-center gap-0.5"
            >
              {displayName}
              {attr.isRequired && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </label>
          </div>
        </div>
      );
    }

    if (attr.fieldType === "SELECT") {
      let rawOptions = attr.options || [];
      const parentKey =
        attr.parentAttrCode ||
        (rawOptions.some((o) => Boolean(o.parentValue)) ? "category" : "");
      const selectedParentVal = parentKey ? mockValues[parentKey] : "";

      if (parentKey) {
        if (!selectedParentVal) {
          rawOptions = rawOptions.filter((o) => !o.parentValue);
        } else {
          rawOptions = rawOptions.filter(
            (o) => !o.parentValue || o.parentValue === selectedParentVal,
          );
        }
      }

      const opts: ComboboxOption[] = rawOptions.map((o) => ({
        value: o.value,
        label: `${resolveOptionLabel(o, locale, t)} (${o.value})`,
      }));

      const placeholderText =
        parentKey && !selectedParentVal
          ? `-- ${t("moduleConfig.selectParentFirst", "Vui lòng chọn")} ${parentDisplayName} ${t("moduleConfig.first", "trước")} --`
          : t("common.select", "Chọn giá trị");

      return (
        <div
          key={attr.id}
          className={cn(
            isChild &&
              "ml-3 pl-3 border-l-2 border-primary/40 dark:border-primary/30 mt-1 space-y-1",
          )}
        >
          {childIndicator}
          <DrawerField label={displayName} required={attr.isRequired}>
            <Combobox
              value={val || ""}
              onChange={(v) => handleFieldChange(attr.code, v)}
              options={opts}
              placeholder={placeholderText}
            />
          </DrawerField>
        </div>
      );
    }

    if (attr.fieldType === "DATE") {
      return (
        <div
          key={attr.id}
          className={cn(
            isChild &&
              "ml-3 pl-3 border-l-2 border-primary/40 dark:border-primary/30 mt-1 space-y-1",
          )}
        >
          {childIndicator}
          <DrawerField label={displayName} required={attr.isRequired}>
            <DatePicker
              value={val || ""}
              onChange={(v) => handleFieldChange(attr.code, v)}
              placeholder={t("common.dateFormat", "DD/MM/YYYY")}
            />
          </DrawerField>
        </div>
      );
    }

    return (
      <div
        key={attr.id}
        className={cn(
          isChild &&
            "ml-3 pl-3 border-l-2 border-primary/40 dark:border-primary/30 mt-1 space-y-1",
        )}
      >
        {childIndicator}
        <DrawerField label={displayName} required={attr.isRequired}>
          <input
            type={attr.fieldType === "NUMBER" ? "number" : "text"}
            className={inputCls}
            value={val || ""}
            onChange={(e) => handleFieldChange(attr.code, e.target.value)}
            placeholder={`${t("common.enter", "Nhập")} ${displayName}...`}
          />
        </DrawerField>
      </div>
    );
  };

  const renderAttributeInputs = (attrs: ModuleAttributeDef[]) => {
    const trees = buildAttributeTree(attrs);
    return (
      <div className="flex flex-col gap-2.5 pt-1">
        {trees.map((node) => (
          <div key={node.def.id} className="flex flex-col gap-2">
            {renderSingleInput(node.def, false)}
            {node.children.map((child) =>
              renderSingleInput(child.def, true, node.def),
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3.5 text-xs">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {t(
          "moduleConfig.livePreviewDesc",
          "Mô phỏng trực tiếp cách các trường tùy chỉnh sẽ hiển thị trên Drawer chứng từ thực tế.",
        )}
      </p>

      {systemAttrs.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 pb-3.5 border-b border-border/40">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>
                {t(
                  "moduleConfig.systemFieldsPreviewTitle",
                  "Thuộc tính mặc định",
                )}
              </span>
            </div>
            <NeutralCountBadge count={systemAttrs.length} />
          </div>
          {renderAttributeInputs(systemAttrs)}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-foreground">
            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>
              {t(
                "moduleConfig.customFieldsPreviewTitle",
                "Thuộc tính tùy chỉnh",
              )}
            </span>
          </div>
          <NeutralCountBadge count={customAttrs.length} />
        </div>

        {customAttrs.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-[11px] opacity-70 italic">
            {t(
              "moduleConfig.noCustomAttributes",
              "Chưa có trường tùy chỉnh nào cho phân hệ này.",
            )}
          </div>
        ) : (
          renderAttributeInputs(customAttrs)
        )}
      </div>
    </div>
  );
}
