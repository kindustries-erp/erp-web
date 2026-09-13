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
} from "@/core/api/moduleConfigApi";
import { useAppStore } from "@/core/config/appStore";
import { AttributeTypeBadge } from "@/shared/components/AttributeTypeBadge";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { fmtQty } from "@/shared/utils/format";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

interface GrFormRightPanelProps {
  drawer: UseGrDrawerReturn;
  t: (key: string, ...args: any[]) => string;
}

/** Section 1: THÔNG TIN CHUNG */
export function GrFormRightPanel({ drawer, t }: GrFormRightPanelProps) {
  const { form, setForm, viewOnly, editing } = drawer;

  // Thống kê nhanh
  const totalReceivedQty = useMemo(() => {
    return form.lines.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0);
  }, [form.lines]);

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

      {/* Thẻ nhãn (Tags) */}
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

      {/* Summary Cards khi ở chế độ View hoặc khi có dòng */}
      {viewOnly && form.lines.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="flex flex-col items-center justify-center p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              {t("Số mặt hàng")}
            </span>
            <span className="font-bold text-blue-700 dark:text-blue-300 text-base tabular-nums">
              {form.lines.length}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {t("Tổng SL nhận")}
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base tabular-nums">
              +{fmtQty(totalReceivedQty)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

/** Section 2: THUỘC TÍNH MẶC ĐỊNH (Khớp 1-1 với Thuộc tính mặc định trong Cấu hình trường tùy chỉnh + Sub-fields) */
export function GrDefaultAttributesSection({
  drawer,
  t,
}: GrFormRightPanelProps) {
  const { form, setForm, viewOnly, editing, poOptions, poDetail } = drawer;
  const locale = useAppStore((s) => s.locale);

  // Lấy danh sách thuộc tính động cho GOODS_RECEIPT để nạp options cho Loại nhập kho (code: type_inventory_receipt)
  const { data: grAttrDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", "GOODS_RECEIPT"],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs("GOODS_RECEIPT"),
    staleTime: 60000,
  });

  const receiptTypeOptions = useMemo(() => {
    const typeDef = Array.isArray(grAttrDefs)
      ? grAttrDefs.find(
          (d) =>
            (d?.code === "type_inventory_receipt" ||
              d?.code === "type" ||
              d?.code === "receipt_type") &&
            !d?.isDeleted,
        )
      : undefined;
    if (typeDef?.options && typeDef.options.length > 0) {
      return typeDef.options.map((opt) => ({
        label: `${resolveOptionLabel(opt, locale, t)} [${opt.value}]`,
        value: opt.value,
      }));
    }
    return [
      { label: `${t("Đơn mua hàng (PO)")} [PO]`, value: "PO" },
      { label: `${t("Nhập sản xuất")} [PRODUCTION]`, value: "PRODUCTION" },
      { label: `${t("Nhập trả hàng")} [RETURN]`, value: "RETURN" },
      { label: `${t("Nhập bảo hành")} [WARRANTY]`, value: "WARRANTY" },
      { label: `${t("Nhập khác")} [OTHER]`, value: "OTHER" },
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
                setForm((f) => ({ ...f, receiptType: "PO", lines: [] }));
              } else {
                setForm((f) => ({
                  ...f,
                  receiptType: val || "OTHER",
                  purchaseOrderId: "",
                  lines: [],
                }));
              }
            }}
            disabled={editing !== null}
            placeholder={t("— Chọn —")}
            allowClear={true}
          />
        )}
      </DrawerField>

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
