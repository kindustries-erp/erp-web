import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CornerDownRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/Button";
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

const CATEGORY_ACCOUNT_HINTS: Record<
  string,
  { account: string; label: string }
> = {
  VF_PARTS: { account: "1561", label: "Hàng hóa VinFast" },
  COMMERCIAL_VEHICLES: {
    account: "1562",
    label: "Mua xe thương mại (Xe lướt)",
  },
  OEM_OTHER_PARTS: { account: "1563", label: "Phụ tùng OEM / Hãng khác" },
  WORKSHOP_CONSUMABLES: { account: "152", label: "Nguyên vật liệu xưởng" },
  GARAGE_SUBCONTRACT: { account: "632", label: "Giá vốn gia công ngoài" },
  GARAGE_TOOLS_EQUIPMENT: { account: "153", label: "CCDC / Thiết bị xưởng" },
  OFFICE_IT_FACILITIES: { account: "153", label: "CCDC / CNTT văn phòng" },
  OPEX_LOGISTICS: {
    account: "6427",
    label: "Giao nhận (Grab, 911, Bưu chính)",
  },
  OPEX_SECURITY_CLEANING: {
    account: "6427",
    label: "Bảo vệ, Vệ sinh, Mặt bằng",
  },
  OPEX_BANK_FEES: { account: "635", label: "Phí ngân hàng, Lãi vay" },
  OPEX_ADMIN: { account: "6422", label: "Hành chính, VPP, Nước 19L" },
  OPEX_LEGAL_CONSULTING: {
    account: "6427",
    label: "Tư vấn Luật, Kế toán BCTC",
  },
  OPEX_IT_SOFTWARE: { account: "6427", label: "Phần mềm KGARA, Cloud, 4G" },
  OPEX_MARKETING: { account: "6428", label: "Tiếp thị, Sự kiện, Quà tặng" },
};

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
  const queryClient = useQueryClient();
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Tải danh mục chuẩn INVOICE cho hóa đơn đầu vào
  const { data: invoiceCategories = [] } = useQuery({
    queryKey: ["module-config-categories", "INVOICE"],
    queryFn: () => moduleConfigApi.getCategories("INVOICE"),
    staleTime: 60000,
    enabled: direction === "IN",
  });

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

  // Options cho Hóa đơn mua vào (direction === "IN") dùng 14 nhóm chuẩn TT99
  const purchaseCategoryOptions = useMemo(() => {
    if (invoiceCategories.length > 0) {
      return invoiceCategories.map((c) => {
        const hint = CATEGORY_ACCOUNT_HINTS[c.code];
        const accountBadge = hint ? `[TK ${hint.account}] ` : "";
        const nameDisplay = locale === "en" && c.nameEn ? c.nameEn : c.name;
        return {
          label: `${accountBadge}${nameDisplay}`,
          value: c.id,
          code: c.code,
        };
      });
    }
    // Fallback options
    return Object.entries(CATEGORY_ACCOUNT_HINTS).map(([code, hint]) => ({
      label: `[TK ${hint.account}] ${hint.label}`,
      value: code,
      code,
    }));
  }, [invoiceCategories, locale]);

  // Options cho Hóa đơn bán ra (direction === "OUT")
  const outInvoiceOptions = useMemo(() => {
    if (typeDef?.options && typeDef.options.length > 0) {
      return typeDef.options.map((opt) => ({
        label: resolveOptionLabel(opt, locale, t),
        value: opt.value,
        code: opt.value,
      }));
    }
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
  }, [typeDef, locale, t]);

  const invoiceTypeOptions =
    direction === "IN" ? purchaseCategoryOptions : outInvoiceOptions;

  // Lấy Category ID / Value hiện tại
  const currentCategoryValue = useMemo(() => {
    if (direction === "IN") {
      return form.categoryId || detailInvoice?.categoryId || "";
    }
    const gAttrs = (form as any).globalAttributes || {};
    if (typeDef) {
      return (
        gAttrs[typeDef.id] || gAttrs[typeDef.code] || gAttrs.category || ""
      );
    }
    return gAttrs.category || gAttrs.type_invoice_out || "";
  }, [form, detailInvoice, direction, typeDef]);

  const currentCategoryObj = useMemo(() => {
    if (direction === "IN") {
      return invoiceCategories.find(
        (c) => c.id === currentCategoryValue || c.code === currentCategoryValue,
      );
    }
    return null;
  }, [invoiceCategories, currentCategoryValue, direction]);

  const currentAccountHint = useMemo(() => {
    if (
      currentCategoryObj?.code &&
      CATEGORY_ACCOUNT_HINTS[currentCategoryObj.code]
    ) {
      return CATEGORY_ACCOUNT_HINTS[currentCategoryObj.code];
    }
    return null;
  }, [currentCategoryObj]);

  // Mutation cập nhật phân loại trực tiếp cho hóa đơn (tự động re-post)
  const setCategoryMutation = useMutation({
    mutationFn: async (catId: string | null) => {
      if (!detailInvoice?.id) return;
      return erpInvoicesCoreApi.setCategory(detailInvoice.id, catId);
    },
    onSuccess: (updated) => {
      toast.success(
        t("categoryUpdated", "Đã cập nhật phân loại & Tự động hạch toán lại"),
      );
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
      if (onRefreshDetail) onRefreshDetail();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật phân loại");
    },
  });

  const handleCategoryChange = (val: string | null) => {
    if (direction === "IN") {
      fieldSet("categoryId", val);
      if (detailInvoice?.id && !editMode) {
        setCategoryMutation.mutate(val);
      }
    } else {
      // OUT invoice logic
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
        gAttrs.type_invoice_out = val;
      } else {
        delete gAttrs.category;
        delete gAttrs.type_invoice_out;
      }
      fieldSet("globalAttributes", gAttrs);
    }
  };

  // AI Auto-Classify Trigger
  const handleAiAutoClassify = async () => {
    if (!detailInvoice?.id) return;
    try {
      setIsAiLoading(true);
      const res = await erpInvoicesCoreApi.aiClassifyAndAutoPost(
        detailInvoice.id,
      );
      toast.success(
        res.isFallback
          ? "AI chưa nhận diện được -> Hạch toán tạm vào TK T0003"
          : `AI đã phân loại: ${res.categoryCode} (${Math.round((res.confidence || 0) * 100)}%)`,
      );
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
      if (onRefreshDetail) onRefreshDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi gọi AI phân loại");
    } finally {
      setIsAiLoading(false);
    }
  };

  const categoryLabelText =
    direction === "IN"
      ? t("invoiceCategoryIn", "Phân loại hóa đơn mua vào")
      : t("invoiceTypeOut", "Phân loại hóa đơn bán ra");

  return (
    <DrawerSection
      title={t("defaultAttributes", "THUỘC TÍNH MẶC ĐỊNH")}
      collapsible={true}
      defaultCollapsed={false}
    >
      <div className="space-y-4">
        {/* 1. Category Field with TT99 Account Hints */}
        <DrawerField
          label={
            <div className="flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <span>{categoryLabelText}</span>
                <AttributeTypeBadge type="system" />
              </span>
              {direction === "IN" && detailInvoice?.id && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 text-[11px] px-2 gap-1 text-primary hover:text-primary-foreground hover:bg-primary border-primary/40"
                  onClick={handleAiAutoClassify}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  )}
                  <span>
                    {isAiLoading ? "Đang phân loại..." : "AI Phân loại"}
                  </span>
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            <Combobox
              options={invoiceTypeOptions}
              value={currentCategoryValue}
              onChange={handleCategoryChange}
              placeholder={t(
                "selectInvoiceType",
                "-- Chọn phân loại hóa đơn --",
              )}
              allowClear={true}
              disabled={setCategoryMutation.isPending}
            />

            {/* Status & Accounting Account Badge */}
            {direction === "IN" && (
              <div className="flex items-center gap-2 pt-0.5">
                {currentAccountHint ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>
                      Hạch toán:{" "}
                      <strong>Nợ {currentAccountHint.account}</strong> / Nợ 1331
                      / Có 331 ({currentAccountHint.label})
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>
                      Chưa chọn phân loại $\rightarrow$ Tự động treo tạm:{" "}
                      <strong>Nợ T0003</strong> / Nợ 1331 / Có 331
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerField>

        {/* 2. Subcategory Field if defined in Global Attribute Defs */}
        {subcategoryDef && (
          <DrawerField
            label={
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <span>
                  {resolveAttrName(subcategoryDef, moduleKey, null, t, locale)}
                </span>
                <AttributeTypeBadge type="system" />
              </span>
            }
          >
            <Combobox
              options={(subcategoryDef.options || []).map((opt) => ({
                label: resolveOptionLabel(opt, locale, t),
                value: opt.value,
              }))}
              value={
                (form as any).globalAttributes?.[subcategoryDef.id] ||
                (form as any).globalAttributes?.[subcategoryDef.code] ||
                (form as any).globalAttributes?.subcategory ||
                ""
              }
              onChange={(val) => {
                const gAttrs = { ...((form as any).globalAttributes || {}) };
                if (val) {
                  gAttrs[subcategoryDef.id] = val;
                  gAttrs[subcategoryDef.code] = val;
                  gAttrs.subcategory = val;
                } else {
                  delete gAttrs[subcategoryDef.id];
                  delete gAttrs[subcategoryDef.code];
                  delete gAttrs.subcategory;
                }
                fieldSet("globalAttributes", gAttrs);
              }}
              placeholder={t(
                "selectSubcategory",
                "-- Chọn phân loại chi tiết --",
              )}
              allowClear={true}
              disabled={!editMode && !detailInvoice?.id}
            />
          </DrawerField>
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
