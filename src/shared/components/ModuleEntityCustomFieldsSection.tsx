import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import {
  moduleConfigApi,
  resolveAttrName,
  resolveCategoryName,
  resolveOptionLabel,
  type ModuleKey,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import { formatGMT7 } from "@/shared/utils/format";
import { Tag, Layers, X, Globe } from "lucide-react";
import { cn } from "@/shared/utils";

export interface ModuleEntityCustomFieldsSectionProps {
  moduleKey: ModuleKey;
  entityId?: string | null;
  editMode: boolean;
  categoryId?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
  attributes?: Record<string, any>;
  onAttributesChange?: (attributes: Record<string, any>) => void;
  globalAttributes?: Record<string, any>;
  onGlobalAttributesChange?: (globalAttributes: Record<string, any>) => void;
  title?: string;
  globalTitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  globalCollapsible?: boolean;
  globalDefaultCollapsed?: boolean;
  readOnly?: boolean;
  hideGlobalSection?: boolean;
  hideCategorySection?: boolean;
  className?: string;
}

/**
 * Pure helper validate các trường required cho Module Custom Fields
 * Trả về danh sách tên hiển thị của các trường bắt buộc bị thiếu
 */
export function validateModuleRequiredFields({
  globalDefs = [],
  globalAttributes = {},
  categoryDefs = [],
  attributes = {},
  hasCategory = false,
  moduleKey = "",
  categoryCode = null,
  t,
}: {
  globalDefs?: ModuleAttributeDef[];
  globalAttributes?: Record<string, any>;
  categoryDefs?: ModuleAttributeDef[];
  attributes?: Record<string, any>;
  hasCategory?: boolean;
  moduleKey?: string;
  categoryCode?: string | null;
  t?: (key: string, fallback: string) => string;
}): string[] {
  const missingNames: string[] = [];

  // 1. Validate global required fields
  const requiredGlobalDefs = globalDefs.filter(
    (d) =>
      !d.isDeleted &&
      d.isActive !== false &&
      d.isGlobal &&
      !d.isSystem &&
      d.isRequired,
  );
  for (const def of requiredGlobalDefs) {
    const val = globalAttributes[def.id];
    if (
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim() === "")
    ) {
      const name = resolveAttrName(def, moduleKey, undefined, t);
      missingNames.push(name);
    }
  }

  // 2. Validate category required fields if category is selected
  if (hasCategory) {
    const requiredCategoryDefs = categoryDefs.filter(
      (d) =>
        !d.isDeleted && d.isActive !== false && !d.isGlobal && d.isRequired,
    );
    for (const def of requiredCategoryDefs) {
      const val = attributes[def.id];
      if (
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "")
      ) {
        const name = resolveAttrName(def, moduleKey, categoryCode, t);
        missingNames.push(name);
      }
    }
  }

  return missingNames;
}

function BufferedTextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  className = inputCls,
  debounceMs = 500,
  allowClear = true,
}: {
  type?: "text" | "number";
  value: any;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  allowClear?: boolean;
}) {
  const [localValue, setLocalValue] = useState<string>(
    value !== undefined && value !== null ? String(value) : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestOnChangeRef = useRef(onChange);
  latestOnChangeRef.current = onChange;

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value !== undefined && value !== null ? String(value) : "");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      latestOnChangeRef.current(val);
    }, debounceMs);
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestOnChangeRef.current(localValue);
  };

  const handleClear = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalValue("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestOnChangeRef.current("");
    inputRef.current?.focus();
  };

  const hasValue =
    localValue !== undefined &&
    localValue !== null &&
    String(localValue).length > 0;

  return (
    <div className="relative w-full flex items-center">
      <input
        ref={inputRef}
        type={type}
        className={cn(className, allowClear && hasValue && "pr-8")}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {allowClear && hasValue && (
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={handleClear}
          onTouchStart={handleClear}
          onClick={handleClear}
          className="absolute right-2 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer select-none"
          title="Xóa nhanh"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

interface AttributeFieldRendererProps {
  attr: ModuleAttributeDef;
  value: any;
  isEditable: boolean;
  moduleKey: string;
  categoryCode?: string | null;
  onChange: (val: any) => void;
  t: (key: string, fallback: string) => string;
}

function AttributeFieldRenderer({
  attr,
  value,
  isEditable,
  moduleKey,
  categoryCode,
  onChange,
  t,
}: AttributeFieldRendererProps) {
  const { locale } = useAppStore();
  const displayName = resolveAttrName(attr, moduleKey, categoryCode, t);

  if (isEditable) {
    if (attr.fieldType === "CHECKBOX") {
      return (
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id={`attr-field-${attr.id}`}
            checked={value === true || value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
          />
          <label
            htmlFor={`attr-field-${attr.id}`}
            className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-0.5"
          >
            {displayName}
            {attr.isRequired && (
              <span className="text-destructive ml-0.5">*</span>
            )}
          </label>
        </div>
      );
    }

    if (attr.fieldType === "SELECT") {
      const optList: ComboboxOption[] = (attr.options || []).map((opt) => ({
        value: opt.value,
        label: `${resolveOptionLabel(opt, locale, t)} [${opt.value}]`,
      }));

      return (
        <DrawerField label={displayName} required={attr.isRequired}>
          <Combobox
            options={optList}
            value={value || ""}
            onChange={(v) => onChange(v || null)}
            placeholder={`-- ${t("common.select", "Chọn")} ${displayName} --`}
            allowClear={!attr.isRequired}
          />
        </DrawerField>
      );
    }

    if (attr.fieldType === "NUMBER") {
      return (
        <DrawerField label={displayName} required={attr.isRequired}>
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
        <DrawerField label={displayName} required={attr.isRequired}>
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
      <DrawerField label={displayName} required={attr.isRequired}>
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
  let displayVal = value || "—";
  if (attr.fieldType === "CHECKBOX") {
    const isChecked = value === true || value === "true";
    displayVal = isChecked ? (
      <Badge variant="default" className="text-[10px]">
        {t("common.yes", "Có")}
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-[10px]">
        {t("common.no", "Không")}
      </Badge>
    );
  } else if (attr.fieldType === "SELECT") {
    const matchedOpt = (attr.options || []).find((o) => o.value === value);
    if (matchedOpt) {
      displayVal = `${resolveOptionLabel(matchedOpt, locale, t)} [${matchedOpt.value}]`;
    }
  } else if (attr.fieldType === "DATE" && value) {
    displayVal = formatGMT7(value, "date") || value;
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs pb-1.5 border-b border-border/30 last:border-0">
      <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
        {attr.isGlobal ? (
          <Globe className="w-3 h-3 text-muted-foreground opacity-80 shrink-0" />
        ) : (
          <Tag className="w-3 h-3 opacity-60 shrink-0" />
        )}
        <span>{displayName}</span>
        {attr.isRequired && <span className="text-destructive">*</span>}
      </span>
      <div className="font-medium text-foreground px-1">{displayVal}</div>
    </div>
  );
}

export function ModuleEntityCustomFieldsSection({
  moduleKey,
  entityId,
  editMode,
  categoryId,
  onCategoryChange,
  attributes,
  onAttributesChange,
  globalAttributes,
  onGlobalAttributesChange,
  title,
  globalTitle,
  collapsible = true,
  defaultCollapsed = false,
  globalCollapsible = true,
  globalDefaultCollapsed = false,
  readOnly = false,
  hideGlobalSection = false,
  hideCategorySection = false,
  className,
}: ModuleEntityCustomFieldsSectionProps) {
  const t = useT();

  // 1. Fetch categories for this moduleKey
  const { data: categories = [] } = useQuery({
    queryKey: ["module-config-categories", moduleKey],
    queryFn: () => moduleConfigApi.getCategories(moduleKey),
    enabled: !!moduleKey && !hideCategorySection,
  });

  // 2. Fetch global attribute defs for this moduleKey
  const { data: globalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", moduleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(moduleKey),
    enabled: !!moduleKey && !hideGlobalSection,
  });

  // 3. Fetch saved values for entity if entityId is present
  const { data: savedEntityData } = useQuery({
    queryKey: ["module-entity-values", moduleKey, entityId],
    queryFn: () => moduleConfigApi.getEntityValues(moduleKey, entityId!),
    enabled: !!entityId && !readOnly,
  });

  // Category ID resolution (prop takes precedence over query data)
  const effectiveCategoryId =
    categoryId !== undefined ? categoryId : savedEntityData?.categoryId || null;

  // Category Attributes resolution (prop takes precedence over query data)
  const effectiveAttributes = useMemo(() => {
    if (attributes !== undefined && attributes !== null) {
      return attributes;
    }
    return savedEntityData?.attributes || {};
  }, [attributes, savedEntityData?.attributes]);

  // Global Attributes resolution (prop takes precedence over query data)
  const effectiveGlobalAttributes = useMemo(() => {
    if (globalAttributes !== undefined && globalAttributes !== null) {
      return globalAttributes;
    }
    return savedEntityData?.globalAttributes || {};
  }, [globalAttributes, savedEntityData?.globalAttributes]);

  // Selected category object
  const selectedCategory = useMemo(() => {
    if (!effectiveCategoryId) return null;
    return categories.find((c) => c.id === effectiveCategoryId) || null;
  }, [categories, effectiveCategoryId]);

  // Active category attribute definitions
  const activeCategoryAttributeDefs: ModuleAttributeDef[] = useMemo(() => {
    if (!selectedCategory?.attributeDefs) return [];
    return selectedCategory.attributeDefs
      .filter((d) => !d.isDeleted && d.isActive !== false && !d.isGlobal)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [selectedCategory]);

  // Active global attribute definitions (excluding system attributes handled elsewhere)
  const activeGlobalAttributeDefs: ModuleAttributeDef[] = useMemo(() => {
    const list =
      globalDefs.length > 0
        ? globalDefs
        : savedEntityData?.globalAttributeDefs || [];
    return list
      .filter(
        (d) =>
          !d.isDeleted && d.isActive !== false && d.isGlobal && !d.isSystem,
      )
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [globalDefs, savedEntityData?.globalAttributeDefs]);

  // Category dropdown options (with i18n resolution)
  const categoryOptions: ComboboxOption[] = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        value: c.id,
        label: `${resolveCategoryName(c, t)} (${c.code})`,
      }));
  }, [categories, t]);

  // Handlers
  const handleCategorySelect = useCallback(
    (newCatId: string | null) => {
      if (onCategoryChange) {
        onCategoryChange(newCatId);
      }
      if (onAttributesChange) {
        onAttributesChange({});
      }
    },
    [onCategoryChange, onAttributesChange],
  );

  const handleCategoryAttributeChange = useCallback(
    (attrDefId: string, value: any) => {
      if (onAttributesChange) {
        onAttributesChange({
          ...effectiveAttributes,
          [attrDefId]: value,
        });
      }
    },
    [onAttributesChange, effectiveAttributes],
  );

  const handleGlobalAttributeChange = useCallback(
    (attrDefId: string, value: any) => {
      if (onGlobalAttributesChange) {
        onGlobalAttributesChange({
          ...effectiveGlobalAttributes,
          [attrDefId]: value,
        });
      }
    },
    [onGlobalAttributesChange, effectiveGlobalAttributes],
  );

  const isEditable = editMode && !readOnly;
  const globalSectionTitle =
    globalTitle ||
    t("moduleConfig.globalAttributesSection", "Thuộc tính chung");
  const categorySectionTitle =
    title || t("moduleConfig.customFieldsSection", "Danh mục & Thuộc tính");

  const showGlobalSection =
    !hideGlobalSection && (activeGlobalAttributeDefs.length > 0 || isEditable);

  const showCategorySection = !hideCategorySection;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 1. GLOBAL ATTRIBUTES SECTION (Auto-loaded without Category selection) */}
      {showGlobalSection && (
        <DrawerSection
          title={globalSectionTitle}
          collapsible={globalCollapsible}
          defaultCollapsed={globalDefaultCollapsed}
        >
          <div className="space-y-3">
            {activeGlobalAttributeDefs.length === 0 ? (
              <div className="p-2.5 text-center text-muted-foreground text-xs bg-muted/20 rounded-lg border border-dashed border-border/50">
                {t(
                  "moduleConfig.noGlobalAttributes",
                  "Phân hệ này chưa cấu hình thuộc tính chung nào.",
                )}
              </div>
            ) : (
              activeGlobalAttributeDefs.map((attr) => (
                <AttributeFieldRenderer
                  key={attr.id}
                  attr={attr}
                  value={effectiveGlobalAttributes[attr.id]}
                  isEditable={isEditable}
                  moduleKey={moduleKey}
                  categoryCode={undefined}
                  onChange={(v) => handleGlobalAttributeChange(attr.id, v)}
                  t={t}
                />
              ))
            )}
          </div>
        </DrawerSection>
      )}

      {/* 2. CATEGORY & CATEGORY ATTRIBUTES SECTION */}
      {showCategorySection && (
        <DrawerSection
          title={categorySectionTitle}
          collapsible={collapsible}
          defaultCollapsed={defaultCollapsed}
        >
          <div className="space-y-3">
            {/* Category Field */}
            <DrawerField label={t("moduleConfig.categoryLabel", "Danh mục")}>
              {isEditable ? (
                <Combobox
                  options={categoryOptions}
                  value={effectiveCategoryId || ""}
                  onChange={(val) => handleCategorySelect(val || null)}
                  placeholder={t(
                    "moduleConfig.selectCategoryPlaceholder",
                    "-- Chọn danh mục --",
                  )}
                  allowClear={true}
                  searchPlaceholder={t(
                    "moduleConfig.searchCategory",
                    "Tìm kiếm danh mục...",
                  )}
                />
              ) : selectedCategory ? (
                <div className="flex items-center gap-2 p-2 bg-surface rounded-lg border border-border/60">
                  <Layers className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {resolveCategoryName(selectedCategory, t)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {selectedCategory.code}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="font-medium text-muted-foreground text-xs px-3 py-2 bg-muted/30 rounded-lg border border-transparent">
                  {t(
                    "moduleConfig.noCategorySelected",
                    "— Chưa chọn danh mục —",
                  )}
                </div>
              )}
            </DrawerField>

            {/* Dynamic Category Attributes */}
            {selectedCategory && (
              <div className="pt-2 border-t border-border/50 space-y-3">
                {activeCategoryAttributeDefs.length === 0 ? (
                  <div className="p-2.5 text-center text-muted-foreground text-xs bg-muted/20 rounded-lg border border-dashed border-border/50">
                    {t(
                      "moduleConfig.noAttributesInCategory",
                      "Danh mục này chưa có thuộc tính nào được cấu hình.",
                    )}
                  </div>
                ) : (
                  activeCategoryAttributeDefs.map((attr) => (
                    <AttributeFieldRenderer
                      key={attr.id}
                      attr={attr}
                      value={effectiveAttributes[attr.id]}
                      isEditable={isEditable}
                      moduleKey={moduleKey}
                      categoryCode={selectedCategory.code}
                      onChange={(v) =>
                        handleCategoryAttributeChange(attr.id, v)
                      }
                      t={t}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </DrawerSection>
      )}
    </div>
  );
}
