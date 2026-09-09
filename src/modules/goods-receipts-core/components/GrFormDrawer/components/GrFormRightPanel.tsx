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
import { fmtQty } from "@/shared/utils/format";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

interface GrFormRightPanelProps {
  drawer: UseGrDrawerReturn;
  t: (key: string, ...args: any[]) => string;
}

export function GrFormRightPanel({ drawer, t }: GrFormRightPanelProps) {
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
        label: resolveOptionLabel(opt, locale, t),
        value: opt.value,
      }));
    }
    return [
      { label: t("Đơn mua hàng (PO)"), value: "PO" },
      { label: t("Nhập sản xuất"), value: "PRODUCTION" },
      { label: t("Nhập trả hàng"), value: "RETURN" },
      { label: t("Nhập bảo hành"), value: "WARRANTY" },
      { label: t("Nhập khác"), value: "OTHER" },
    ];
  }, [grAttrDefs, locale, t]);

  // Thống kê nhanh
  const totalReceivedQty = useMemo(() => {
    return form.lines.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0);
  }, [form.lines]);

  const supplierDisplay = useMemo(() => {
    if (poDetail?.supplierName) return poDetail.supplierName;
    const selectedPo = poOptions.find((o) => o.value === form.purchaseOrderId);
    if (selectedPo && selectedPo.label.includes(" — ")) {
      return selectedPo.label.split(" — ")[1];
    }
    return "";
  }, [poDetail, poOptions, form.purchaseOrderId]);

  return (
    <>
      <DrawerField label={t("Số phiếu")}>
        <input
          className={inputCls}
          placeholder={t("Tự động nếu để trống")}
          value={form.receiptNo}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(e) =>
            setForm((f) => ({ ...f, receiptNo: e.target.value }))
          }
        />
      </DrawerField>
      <DrawerField label={t("Ngày nhập")}>
        <DatePicker
          value={form.receiptDate ? form.receiptDate.slice(0, 10) : ""}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(v) => setForm((f) => ({ ...f, receiptDate: v }))}
        />
      </DrawerField>
      <DrawerField
        label={
          <span className="inline-flex items-center gap-1.5 flex-wrap">
            <span>{t("Loại nhập")}</span>
            <AttributeTypeBadge type="system" />
          </span>
        }
      >
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
          disabled={viewOnly || editing !== null}
          placeholder={t("— Chọn —")}
          allowClear={true}
        />
      </DrawerField>

      {form.receiptType === "PO" && (
        <DrawerField label={t("Đơn mua hàng (PO)")}>
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
      )}

      {supplierDisplay && (
        <DrawerField label={t("Nhà cung cấp")}>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-md text-sm text-foreground">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">{supplierDisplay}</span>
          </div>
        </DrawerField>
      )}

      <DrawerField label={t("Người giao / Nhận hàng")}>
        <input
          className={inputCls}
          placeholder={t("Họ tên người giao hoặc người nhận...")}
          value={
            form.globalAttributes?.delivered_by ||
            form.globalAttributes?.receiver ||
            ""
          }
          disabled={viewOnly || editing?.status === "POSTED"}
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
      </DrawerField>

      <DrawerField label={t("Số hóa đơn / Chứng từ tham chiếu")}>
        <input
          className={inputCls}
          placeholder={t("Số HĐ VAT / Phiếu xuất bên bán...")}
          value={
            form.globalAttributes?.reference_no ||
            form.globalAttributes?.tax_invoice_ref ||
            ""
          }
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              globalAttributes: {
                ...f.globalAttributes,
                reference_no: e.target.value,
                tax_invoice_ref: e.target.value,
              },
            }))
          }
        />
      </DrawerField>

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
