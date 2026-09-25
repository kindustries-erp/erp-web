import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CornerDownRight } from "lucide-react";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { AttributeTypeBadge } from "@/shared/components/AttributeTypeBadge";
import {
  moduleConfigApi,
  resolveOptionLabel,
  resolveAttrName,
} from "@/core/api/moduleConfigApi";
import { useAppStore } from "@/core/config/appStore";
import {
  type CreateErpInvoicePayload,
  ErpInvoice,
  erpInvoicesCoreApi,
} from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";

export interface ErpInvoiceDefaultAttributesSectionProps {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  onRefreshDetail?: () => void;
}

export function ErpInvoiceDefaultAttributesSection({
  form,
  editMode,
  fieldSet,
  direction,
  detailInvoice,
  onRefreshDetail,
}: ErpInvoiceDefaultAttributesSectionProps) {
  const { t } = useTranslation("erpInvoices");
  const locale = useAppStore((s) => s.locale);

  const moduleKey = direction === "OUT" ? "INVOICE_OUT" : "INVOICE_IN";
  const { data: globalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", moduleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(moduleKey),
    staleTime: 60000,
  });

  const typeDef = useMemo(() => {
    const targetCode =
      direction === "OUT" ? "type_invoice_out" : "type_invoice_in";
    return Array.isArray(globalDefs)
      ? globalDefs.find(
          (d) =>
            (d.code === "category" ||
              d.code === targetCode ||
              d.code === "invoice_type" ||
              d.code === "type") &&
            !d.isDeleted,
        )
      : undefined;
  }, [globalDefs, direction]);

  const subcategoryDef = useMemo(() => {
    return Array.isArray(globalDefs)
      ? globalDefs.find((d) => d.code === "subcategory" && !d.isDeleted)
      : undefined;
  }, [globalDefs]);

  const invoiceTypeOptions = useMemo(() => {
    if (typeDef?.options && typeDef.options.length > 0) {
      return typeDef.options.map((opt) => ({
        label: resolveOptionLabel(opt, locale, t),
        value: opt.value,
        code: opt.value,
      }));
    }
    if (direction === "OUT") {
      return [
        {
          label: t(
            "moduleConfig.options.saleGoods",
            "Bán hàng hóa / Xe / Phụ tùng",
          ),
          value: "SALE_GOODS",
          code: "SALE_GOODS",
        },
        {
          label: t(
            "moduleConfig.options.saleService",
            "Dịch vụ sửa chữa & Garage",
          ),
          value: "SALE_SERVICE",
          code: "SALE_SERVICE",
        },
        {
          label: t(
            "moduleConfig.options.saleFinancial",
            "Doanh thu hoạt động tài chính",
          ),
          value: "SALE_FINANCIAL",
          code: "SALE_FINANCIAL",
        },
        {
          label: t("moduleConfig.options.otherIncome", "Thu nhập khác"),
          value: "OTHER_INCOME",
          code: "OTHER_INCOME",
        },
      ];
    }
    return [
      {
        label: t("moduleConfig.options.purchaseGoods", "Mua hàng hóa / NVL"),
        value: "PURCHASE_GOODS",
        code: "PURCHASE_GOODS",
      },
      {
        label: t(
          "moduleConfig.options.expenseOpex",
          "Chi phí quản lý & Vận hành (OPEX)",
        ),
        value: "EXPENSE_OPEX",
        code: "EXPENSE_OPEX",
      },
      {
        label: t("moduleConfig.options.serviceFee", "Dịch vụ & Gia công ngoài"),
        value: "SERVICE_FEE",
        code: "SERVICE_FEE",
      },
      {
        label: t("moduleConfig.options.fixedAsset", "Tài sản cố định & CCDC"),
        value: "FIXED_ASSET",
        code: "FIXED_ASSET",
      },
      {
        label: t("moduleConfig.options.other", "Khác"),
        value: "OTHER",
        code: "OTHER",
      },
    ];
  }, [typeDef, direction, locale, t]);

  const currentInvoiceType = useMemo(() => {
    const gAttrs = (form as any).globalAttributes || {};
    if (typeDef) {
      return (
        gAttrs[typeDef.id] || gAttrs[typeDef.code] || gAttrs.category || ""
      );
    }
    return (
      gAttrs.category ||
      (direction === "OUT"
        ? gAttrs.type_invoice_out
        : gAttrs.type_invoice_in) ||
      ""
    );
  }, [form, typeDef, direction]);

  const subcategoryOptions = useMemo(() => {
    if (!subcategoryDef?.options || subcategoryDef.options.length === 0)
      return [];
    return subcategoryDef.options
      .filter(
        (opt) => !opt.parentValue || opt.parentValue === currentInvoiceType,
      )
      .map((opt) => ({
        label: resolveOptionLabel(opt, locale, t),
        value: opt.value,
        code: opt.value,
      }));
  }, [subcategoryDef, currentInvoiceType, locale, t]);

  const currentSubcategory = useMemo(() => {
    const gAttrs = (form as any).globalAttributes || {};
    if (subcategoryDef) {
      return (
        gAttrs[subcategoryDef.id] ||
        gAttrs.subcategory ||
        gAttrs[subcategoryDef.code] ||
        ""
      );
    }
    return gAttrs.subcategory || "";
  }, [form, subcategoryDef]);

  const currentSubcategoryLabel = useMemo(() => {
    const opt = (subcategoryDef?.options || []).find(
      (o) => o.value === currentSubcategory,
    );
    return opt ? resolveOptionLabel(opt, locale, t) : currentSubcategory || "—";
  }, [subcategoryDef, currentSubcategory, locale, t]);

  const handleInvoiceTypeChange = (val: string | null) => {
    const gAttrs = { ...((form as any).globalAttributes || {}) };
    if (typeDef) {
      if (val) {
        gAttrs[typeDef.id] = val;
        gAttrs[typeDef.code] = val;
      } else {
        delete gAttrs[typeDef.id];
        delete gAttrs[typeDef.code];
      }
    }
    if (val) {
      gAttrs.category = val;
    } else {
      delete gAttrs.category;
    }
    const legacyKey =
      direction === "OUT" ? "type_invoice_out" : "type_invoice_in";
    if (val) {
      gAttrs[legacyKey] = val;
    } else {
      delete gAttrs[legacyKey];
    }

    // Reset subcategory if current subcategory is invalid for the new category
    if (subcategoryDef) {
      const validSubValues = (subcategoryDef.options || [])
        .filter((opt) => !opt.parentValue || opt.parentValue === val)
        .map((opt) => opt.value);
      if (!val || !validSubValues.includes(currentSubcategory)) {
        delete gAttrs[subcategoryDef.id];
        delete gAttrs[subcategoryDef.code];
        delete gAttrs.subcategory;
      }
    }

    fieldSet("globalAttributes", gAttrs);
  };

  const handleSubcategoryChange = (val: string | null) => {
    const gAttrs = { ...((form as any).globalAttributes || {}) };
    if (subcategoryDef) {
      if (val) {
        gAttrs[subcategoryDef.id] = val;
        gAttrs[subcategoryDef.code] = val;
        gAttrs.subcategory = val;
      } else {
        delete gAttrs[subcategoryDef.id];
        delete gAttrs[subcategoryDef.code];
        delete gAttrs.subcategory;
      }
    } else {
      if (val) {
        gAttrs.subcategory = val;
      } else {
        delete gAttrs.subcategory;
      }
    }
    fieldSet("globalAttributes", gAttrs);
  };

  const categoryLabelText = typeDef
    ? resolveAttrName(typeDef, moduleKey, undefined, t)
    : t(
        direction === "OUT" ? "invoiceTypeOut" : "invoiceTypeIn",
        direction === "OUT"
          ? "Phân loại hóa đơn bán ra"
          : "Phân loại hóa đơn mua vào",
      );

  const subcategoryLabelText = subcategoryDef
    ? resolveAttrName(subcategoryDef, moduleKey, undefined, t)
    : t(
        direction === "OUT" ? "invoiceSubcategoryOut" : "invoiceSubcategoryIn",
        direction === "OUT"
          ? "Phân loại chi tiết hóa đơn bán ra"
          : "Phân loại chi tiết hóa đơn mua vào",
      );

  return (
    <DrawerSection
      title={t("defaultAttributes", "THUỘC TÍNH MẶC ĐỊNH")}
      collapsible={true}
      defaultCollapsed={false}
    >
      <div className="space-y-4">
        {/* 1. Category Field */}
        <DrawerField
          label={
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <span>{categoryLabelText}</span>
              <AttributeTypeBadge type="system" />
            </span>
          }
        >
          {editMode ? (
            <Combobox
              options={invoiceTypeOptions}
              value={currentInvoiceType}
              onChange={handleInvoiceTypeChange}
              placeholder={t(
                "selectInvoiceType",
                "-- Chọn phân loại hóa đơn --",
              )}
              allowClear={true}
            />
          ) : (
            <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
              {invoiceTypeOptions.find((o) => o.value === currentInvoiceType)
                ?.label || "—"}
            </div>
          )}
        </DrawerField>

        {/* 2. Subcategory Dependent Field */}
        {subcategoryDef && (
          <div className="ml-3 pl-3 border-l-2 border-primary/30 py-0.5 space-y-1">
            <DrawerField
              label={
                <div className="flex flex-col gap-0.5">
                  <div className="inline-flex items-center gap-1.5 flex-wrap">
                    <CornerDownRight className="w-3 h-3 text-primary/70 shrink-0 inline-block mr-0.5" />
                    <span>{subcategoryLabelText}</span>
                    <AttributeTypeBadge type="system" />
                  </div>
                  <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-normal">
                    <span>🔗 {t("childOf", "Phụ thuộc:")}</span>
                    <span className="font-medium text-foreground/80">
                      {categoryLabelText}
                    </span>
                  </span>
                </div>
              }
              required={subcategoryDef.isRequired}
            >
              {editMode ? (
                <Combobox
                  options={subcategoryOptions}
                  value={currentSubcategory}
                  onChange={handleSubcategoryChange}
                  disabled={!currentInvoiceType}
                  placeholder={
                    !currentInvoiceType
                      ? t(
                          "selectCategoryFirst",
                          "-- Vui lòng chọn {{categoryLabel}} trước --",
                          {
                            categoryLabel: categoryLabelText,
                          },
                        )
                      : t(
                          "selectInvoiceSubcategory",
                          "-- Chọn phân loại chi tiết hóa đơn --",
                        )
                  }
                  allowClear={!subcategoryDef.isRequired}
                />
              ) : (
                <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
                  {currentSubcategoryLabel}
                </div>
              )}
            </DrawerField>
          </div>
        )}

        {/* 3. isValid Checkbox */}
        {(detailInvoice?.id || editMode) && (
          <DrawerField
            label={
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <span>
                  {t("invoice.columns.isValid", "Hóa đơn hợp lý, hợp lệ")}
                </span>
                <AttributeTypeBadge type="system" />
              </span>
            }
          >
            <div className="flex items-center gap-2 pt-0.5">
              <Checkbox
                id="invoice-is-valid-checkbox"
                checked={
                  editMode ? !!(form as any).isValid : !!detailInvoice?.isValid
                }
                disabled={!editMode && !detailInvoice?.id}
                onCheckedChange={async (val: boolean) => {
                  if (editMode) {
                    fieldSet("isValid", val);
                  } else if (detailInvoice?.id) {
                    try {
                      await erpInvoicesCoreApi.setValid(detailInvoice.id, val);
                      toast.success(
                        t(
                          "validatedSuccess",
                          "Đã cập nhật trạng thái kiểm duyệt",
                        ),
                      );
                      if (onRefreshDetail) onRefreshDetail();
                    } catch {
                      toast.error(
                        t(
                          "validatedError",
                          "Lỗi khi cập nhật trạng thái kiểm duyệt",
                        ),
                      );
                    }
                  }
                }}
              />
              <label
                htmlFor="invoice-is-valid-checkbox"
                className="text-xs font-medium cursor-pointer select-none text-foreground flex items-center gap-1.5"
              >
                {(editMode ? (form as any).isValid : detailInvoice?.isValid) ? (
                  <span className="text-emerald-600 font-medium">
                    {t("invoice.isValid.true", "Đã kiểm duyệt")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("invoice.isValid.false", "Chưa kiểm duyệt")}
                  </span>
                )}
                {detailInvoice?.validatedAt && (
                  <span className="text-muted-foreground font-normal italic text-[11px]">
                    (
                    {new Date(detailInvoice.validatedAt).toLocaleDateString(
                      "vi-VN",
                    )}
                    )
                  </span>
                )}
              </label>
            </div>
          </DrawerField>
        )}
      </div>
    </DrawerSection>
  );
}
