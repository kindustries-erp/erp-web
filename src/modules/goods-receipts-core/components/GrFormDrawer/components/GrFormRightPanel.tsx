import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Building2 } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import {
  moduleConfigApi,
  resolveOptionLabel,
  resolveAttrName,
} from "@/core/api/moduleConfigApi";
import { useAppStore } from "@/core/config/appStore";
import { AttributeTypeBadge } from "@/shared/components/AttributeTypeBadge";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

interface GrFormRightPanelProps {
  drawer: UseGrDrawerReturn;
  t: (key: string, ...args: any[]) => string;
}

/** Section 1: THÔNG TIN CHUNG */
export function GrFormRightPanel({ drawer, t }: GrFormRightPanelProps) {
  const { form, setForm, viewOnly, editing } = drawer;

  return (
    <>
      <DrawerField label={t("Số phiếu")}>
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent font-mono">
            {form.receiptNo || "—"}
          </div>
        ) : (
          <input
            className={inputCls}
            placeholder={t("Tự động nếu để trống")}
            value={form.receiptNo}
            disabled={editing?.status === "POSTED"}
            onChange={(e) =>
              setForm((f) => ({ ...f, receiptNo: e.target.value }))
            }
          />
        )}
      </DrawerField>

      <DrawerField label={t("Ngày nhập")}>
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
            {form.receiptDate ? form.receiptDate.slice(0, 10) : "—"}
          </div>
        ) : (
          <DatePicker
            value={form.receiptDate ? form.receiptDate.slice(0, 10) : ""}
            disabled={editing?.status === "POSTED"}
            onChange={(v) => setForm((f) => ({ ...f, receiptDate: v }))}
          />
        )}
      </DrawerField>

      <DrawerField label={t("Người giao / Nhận hàng")}>
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
            {form.globalAttributes?.delivered_by ||
              form.globalAttributes?.receiver ||
              "—"}
          </div>
        ) : (
          <input
            className={inputCls}
            placeholder={t("Họ tên người giao hoặc người nhận...")}
            value={
              form.globalAttributes?.delivered_by ||
              form.globalAttributes?.receiver ||
              ""
            }
            disabled={editing?.status === "POSTED"}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                globalAttributes: {
                  ...f.globalAttributes,
                  delivered_by: e.target.value,
                  receiver: e.target.value,
                },
              }))
            }
          />
        )}
      </DrawerField>
    </>
  );
}

/** Thẻ nhãn (Tags) hiển thị trong tagsSlot bên dưới Ghi chú */
export function GrFormTagsSection({ drawer, t }: GrFormRightPanelProps) {
  const { viewOnly, editing } = drawer;

  return (
    <div className="pt-1">
      <div className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
        {t("tags", "Thẻ nhãn")}
      </div>
      {editing?.id ? (
        <EntityTagSelector
          entityType="erp_goods_receipt"
          entityId={editing.id}
          readOnly={viewOnly}
        />
      ) : !viewOnly ? (
        <EntityTagSelector
          entityType="erp_goods_receipt"
          entityId="__pending__"
          readOnly={false}
          pendingMode
        />
      ) : null}
    </div>
  );
}

/** Section 2: THUỘC TÍNH MẶC ĐỊNH (Khớp 1-1 với Thuộc tính mặc định trong Cấu hình trường tùy chỉnh + Sub-fields) */
export function GrDefaultAttributesSection({
  drawer,
  t,
}: GrFormRightPanelProps) {
  const { form, setForm, viewOnly, editing, poOptions, poDetail } = drawer;
  const locale = useAppStore((s) => s.locale);

  // Lấy danh sách thuộc tính động cho GOODS_RECEIPT để nạp options cho Loại nhập kho (code: category)
  const { data: grAttrDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", "GOODS_RECEIPT"],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs("GOODS_RECEIPT"),
    staleTime: 60000,
  });

  const receiptTypeOptions = useMemo(() => {
    const typeDef = Array.isArray(grAttrDefs)
      ? grAttrDefs.find((d) => d?.code === "category" && !d?.isDeleted)
      : undefined;
    if (typeDef?.options && typeDef.options.length > 0) {
      return typeDef.options.map((opt) => ({
        label: resolveOptionLabel(opt, locale, t),
        value: opt.value,
        code: opt.value,
      }));
    }
    return [
      { label: t("Đơn mua hàng (PO)"), value: "PO", code: "PO" },
      {
        label: t("Nhập sản xuất (MO)"),
        value: "PRODUCTION",
        code: "PRODUCTION",
      },
      { label: t("Nhập trả hàng"), value: "RETURN", code: "RETURN" },
      { label: t("Nhập bảo hành"), value: "WARRANTY", code: "WARRANTY" },
      { label: t("Nhập khác"), value: "OTHER", code: "OTHER" },
    ];
  }, [grAttrDefs, locale, t]);

  const currentTypeLabel = useMemo(() => {
    const opt = receiptTypeOptions.find((o) => o.value === form.receiptType);
    return opt?.label || form.receiptType || "—";
  }, [receiptTypeOptions, form.receiptType]);

  const supplierDisplay = useMemo(() => {
    if (poDetail?.supplierName) return poDetail.supplierName;
    const selectedPo = poOptions.find((o) => o.value === form.purchaseOrderId);
    if (selectedPo && selectedPo.label.includes(" — ")) {
      return selectedPo.label.split(" — ")[1];
    }
    return "";
  }, [poDetail, poOptions, form.purchaseOrderId]);

  const subcategoryDef = useMemo(() => {
    return Array.isArray(grAttrDefs)
      ? grAttrDefs.find((d) => d?.code === "subcategory" && !d?.isDeleted)
      : undefined;
  }, [grAttrDefs]);

  const subcategoryOptions = useMemo(() => {
    if (!subcategoryDef?.options || subcategoryDef.options.length === 0)
      return [];
    const currentCategory =
      form.receiptType || (form.purchaseOrderId ? "PO" : "OTHER");
    return subcategoryDef.options
      .filter((opt) => !opt.parentValue || opt.parentValue === currentCategory)
      .map((opt) => ({
        label: resolveOptionLabel(opt, locale, t),
        value: opt.value,
        code: opt.value,
      }));
  }, [subcategoryDef, form.receiptType, form.purchaseOrderId, locale, t]);

  const currentSubcategoryLabel = useMemo(() => {
    const rawVal =
      form.globalAttributes?.subcategory ||
      form.customAttributes?.subcategory ||
      "";
    const opt = (subcategoryDef?.options || []).find((o) => o.value === rawVal);
    return opt ? resolveOptionLabel(opt, locale, t) : rawVal || "—";
  }, [subcategoryDef, form.globalAttributes, form.customAttributes, locale, t]);

  return (
    <div className="space-y-4">
      <DrawerField
        label={
          <span className="inline-flex items-center gap-1.5 flex-wrap">
            <span>{t("inventory.receiptType", "Loại nhập kho")}</span>
            <AttributeTypeBadge type="system" />
          </span>
        }
      >
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
            {currentTypeLabel}
          </div>
        ) : (
          <Combobox
            options={receiptTypeOptions}
            value={form.receiptType}
            onChange={(val) => {
              if (val === "PO") {
                setForm((f) => ({
                  ...f,
                  receiptType: "PO",
                  lines: [],
                  globalAttributes: {
                    ...(f.globalAttributes || {}),
                    subcategory: undefined,
                  },
                }));
              } else {
                setForm((f) => ({
                  ...f,
                  receiptType: val || "OTHER",
                  purchaseOrderId: "",
                  lines: [],
                  globalAttributes: {
                    ...(f.globalAttributes || {}),
                    subcategory: undefined,
                  },
                }));
              }
            }}
            disabled={editing !== null}
            placeholder={t("— Chọn —")}
            allowClear={true}
          />
        )}
      </DrawerField>

      {/* Sub-field: Phân loại chi tiết (Subcategory) khi có cấu hình */}
      {subcategoryDef && subcategoryOptions.length > 0 && (
        <DrawerField
          label={
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <span>
                {resolveAttrName(subcategoryDef, "GOODS_RECEIPT", locale, t)}
              </span>
              <AttributeTypeBadge type="system" />
            </span>
          }
          required={subcategoryDef.isRequired}
        >
          {viewOnly ? (
            <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
              {currentSubcategoryLabel}
            </div>
          ) : (
            <Combobox
              options={subcategoryOptions}
              value={
                form.globalAttributes?.subcategory ||
                form.customAttributes?.subcategory ||
                ""
              }
              onChange={(val) => {
                setForm((f) => ({
                  ...f,
                  globalAttributes: {
                    ...(f.globalAttributes || {}),
                    subcategory: val || undefined,
                  },
                  customAttributes: {
                    ...(f.customAttributes || {}),
                    subcategory: val || undefined,
                  },
                }));
              }}
              disabled={editing?.status === "POSTED"}
              placeholder={t("— Chọn phân loại chi tiết —")}
              allowClear={!subcategoryDef.isRequired}
            />
          )}
        </DrawerField>
      )}

      {/* Sub-field: Đơn mua hàng (PO) khi Loại nhập = PO */}
      {form.receiptType === "PO" && (
        <div className="pl-3 border-l-2 border-primary/30 space-y-3 mt-2">
          <DrawerField label={t("Đơn mua hàng (PO)")} required={!viewOnly}>
            {(viewOnly || editing !== null) && form.purchaseOrderId ? (
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-md w-full overflow-hidden">
                <TooltipProvider>
                  <Tooltip
                    content={
                      poOptions.find((o) => o.value === form.purchaseOrderId)
                        ?.label || form.purchaseOrderId
                    }
                  >
                    <span
                      className="text-primary font-medium cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-80 group/link w-full"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("open_erp_document", {
                            detail: {
                              type: "erp_purchase_order",
                              id: form.purchaseOrderId,
                            },
                          }),
                        );
                      }}
                    >
                      <span className="group-hover/link:underline underline-offset-4 truncate">
                        {poOptions.find((o) => o.value === form.purchaseOrderId)
                          ?.label || form.purchaseOrderId}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all flex-shrink-0" />
                    </span>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <Combobox
                options={poOptions}
                value={form.purchaseOrderId}
                disabled={viewOnly || editing !== null}
                placeholder={t("Chọn PO...")}
                onChange={(v) =>
                  setForm((f) => ({ ...f, purchaseOrderId: v, lines: [] }))
                }
              />
            )}
          </DrawerField>

          {supplierDisplay && (
            <DrawerField label={t("Nhà cung cấp")}>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-md text-sm text-foreground">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{supplierDisplay}</span>
              </div>
            </DrawerField>
          )}
        </div>
      )}
    </div>
  );
}
