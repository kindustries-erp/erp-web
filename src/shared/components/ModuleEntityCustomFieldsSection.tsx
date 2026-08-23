import { useMemo } from "react";
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
import {
  moduleConfigApi,
  type ModuleKey,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import { formatGMT7 } from "@/shared/utils/format";
import { Tag, Layers } from "lucide-react";

export interface ModuleEntityCustomFieldsSectionProps {
  moduleKey: ModuleKey;
  entityId?: string | null;
  editMode: boolean;
  categoryId?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
  attributes?: Record<string, any>;
  onAttributesChange?: (attributes: Record<string, any>) => void;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  readOnly?: boolean;
  className?: string;
}

export function ModuleEntityCustomFieldsSection({
  moduleKey,
  entityId,
  editMode,
  categoryId,
  onCategoryChange,
  attributes = {},
  onAttributesChange,
  title,
  collapsible = true,
  defaultCollapsed = false,
  readOnly = false,
  className,
}: ModuleEntityCustomFieldsSectionProps) {
  const t = useT();

  // 1. Fetch categories for this moduleKey
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["module-config-categories", moduleKey],
    queryFn: () => moduleConfigApi.getCategories(moduleKey),
    enabled: !!moduleKey,
  });

  // 2. Fetch saved values for entity if entityId is present
  const { data: savedEntityData, isLoading: loadingValues } = useQuery({
    queryKey: ["module-entity-values", moduleKey, entityId],
    queryFn: () => moduleConfigApi.getEntityValues(moduleKey, entityId!),
    enabled: !!entityId && !readOnly,
  });

  // Category ID resolution (prop takes precedence over query data)
  const effectiveCategoryId =
    categoryId !== undefined ? categoryId : savedEntityData?.categoryId || null;

  // Attributes resolution (prop takes precedence over query data)
  const effectiveAttributes = useMemo(() => {
    if (attributes && Object.keys(attributes).length > 0) {
      return attributes;
    }
    return savedEntityData?.attributes || {};
  }, [attributes, savedEntityData?.attributes]);

  // Selected category object
  const selectedCategory = useMemo(() => {
    if (!effectiveCategoryId) return null;
    return categories.find((c) => c.id === effectiveCategoryId) || null;
  }, [categories, effectiveCategoryId]);

  // Active attribute definitions for selected category
  const activeAttributeDefs: ModuleAttributeDef[] = useMemo(() => {
    if (!selectedCategory?.attributeDefs) return [];
    return selectedCategory.attributeDefs
      .filter((d) => !d.isDeleted && d.isActive !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [selectedCategory]);

  // Category dropdown options
  const categoryOptions: ComboboxOption[] = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      }));
  }, [categories]);

  // Handlers
  const handleCategorySelect = (newCatId: string | null) => {
    if (onCategoryChange) {
      onCategoryChange(newCatId);
    }
    // If category changed, clear attributes
    if (onAttributesChange) {
      onAttributesChange({});
    }
  };

  const handleAttributeChange = (attrDefId: string, value: any) => {
    if (onAttributesChange) {
      onAttributesChange({
        ...effectiveAttributes,
        [attrDefId]: value,
      });
    }
  };

  const isEditable = editMode && !readOnly;
  const sectionTitle =
    title || t("moduleConfig.customFieldsSection", "Danh mục & Thuộc tính");

  return (
    <DrawerSection
      title={sectionTitle}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      className={className}
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
                  {selectedCategory.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedCategory.code}
                </span>
              </div>
            </div>
          ) : (
            <div className="font-medium text-muted-foreground text-xs px-3 py-2 bg-muted/30 rounded-lg border border-transparent">
              {t("moduleConfig.noCategorySelected", "— Chưa chọn danh mục —")}
            </div>
          )}
        </DrawerField>

        {/* Dynamic Attributes */}
        {selectedCategory && (
          <div className="pt-2 border-t border-border/50 space-y-3">
            {activeAttributeDefs.length === 0 ? (
              <div className="p-2.5 text-center text-muted-foreground text-xs bg-muted/20 rounded-lg border border-dashed border-border/50">
                {t(
                  "moduleConfig.noAttributesInCategory",
                  "Danh mục này chưa có thuộc tính nào được cấu hình.",
                )}
              </div>
            ) : (
              activeAttributeDefs.map((attr) => {
                const val = effectiveAttributes[attr.id];

                if (isEditable) {
                  if (attr.fieldType === "CHECKBOX") {
                    return (
                      <div
                        key={attr.id}
                        className="flex items-center gap-2 pt-1"
                      >
                        <Checkbox
                          id={`attr-field-${attr.id}`}
                          checked={val === true || val === "true"}
                          onCheckedChange={(checked) =>
                            handleAttributeChange(
                              attr.id,
                              checked ? "true" : "false",
                            )
                          }
                        />
                        <label
                          htmlFor={`attr-field-${attr.id}`}
                          className="text-xs font-medium cursor-pointer select-none text-foreground"
                        >
                          {attr.name}
                          {attr.isRequired && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </label>
                      </div>
                    );
                  }

                  if (attr.fieldType === "SELECT") {
                    const optList: ComboboxOption[] = (attr.options || []).map(
                      (opt) => ({
                        value: opt.value,
                        label: `${opt.label} [${opt.value}]`,
                      }),
                    );

                    return (
                      <DrawerField
                        key={attr.id}
                        label={attr.name}
                        required={attr.isRequired}
                      >
                        <Combobox
                          options={optList}
                          value={val || ""}
                          onChange={(v) =>
                            handleAttributeChange(attr.id, v || null)
                          }
                          placeholder={`-- Chọn ${attr.name} --`}
                          allowClear={!attr.isRequired}
                        />
                      </DrawerField>
                    );
                  }

                  if (attr.fieldType === "NUMBER") {
                    return (
                      <DrawerField
                        key={attr.id}
                        label={attr.name}
                        required={attr.isRequired}
                      >
                        <input
                          type="number"
                          className={inputCls}
                          value={val !== undefined && val !== null ? val : ""}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          placeholder={`Nhập ${attr.name}...`}
                        />
                      </DrawerField>
                    );
                  }

                  if (attr.fieldType === "DATE") {
                    return (
                      <DrawerField
                        key={attr.id}
                        label={attr.name}
                        required={attr.isRequired}
                      >
                        <DatePicker
                          value={val || null}
                          onChange={(d) => handleAttributeChange(attr.id, d)}
                          placeholder="DD/MM/YYYY"
                        />
                      </DrawerField>
                    );
                  }

                  // Default: TEXT
                  return (
                    <DrawerField
                      key={attr.id}
                      label={attr.name}
                      required={attr.isRequired}
                    >
                      <input
                        type="text"
                        className={inputCls}
                        value={val !== undefined && val !== null ? val : ""}
                        onChange={(e) =>
                          handleAttributeChange(attr.id, e.target.value)
                        }
                        placeholder={`Nhập ${attr.name}...`}
                      />
                    </DrawerField>
                  );
                }

                // View Mode
                let displayVal = val || "—";
                if (attr.fieldType === "CHECKBOX") {
                  const isChecked = val === true || val === "true";
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
                  const matchedOpt = (attr.options || []).find(
                    (o) => o.value === val,
                  );
                  if (matchedOpt) {
                    displayVal = `${matchedOpt.label} [${matchedOpt.value}]`;
                  }
                } else if (attr.fieldType === "DATE" && val) {
                  displayVal = formatGMT7(val, "date") || val;
                }

                return (
                  <div
                    key={attr.id}
                    className="flex flex-col gap-0.5 text-xs pb-1.5 border-b border-border/30 last:border-0"
                  >
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3 opacity-60" />
                      {attr.name}
                    </span>
                    <div className="font-medium text-foreground px-1">
                      {displayVal}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DrawerSection>
  );
}
