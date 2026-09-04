import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

interface GrFormRightPanelProps {
  drawer: UseGrDrawerReturn;
  t: (key: string, ...args: any[]) => string;
}

export function GrFormRightPanel({ drawer, t }: GrFormRightPanelProps) {
  const { form, setForm, viewOnly, editing, poOptions } = drawer;

  // Lấy danh sách thuộc tính động cho GOODS_RECEIPT để nạp options cho Loại nhập kho (code: type)
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
      return [
        { label: t("— Chọn —"), value: "" },
        ...typeDef.options.map((opt) => ({
          label: t(opt.label || opt.value),
          value: opt.value,
        })),
      ];
    }
    return [
      { label: t("— Chọn —"), value: "" },
      { label: t("Đơn mua hàng (PO)"), value: "PO" },
      { label: t("Nhập sản xuất"), value: "MANUFACTURING" },
      { label: t("Nhập trả hàng"), value: "RETURN" },
      { label: t("Nhập bảo hành"), value: "WARRANTY" },
      { label: t("Nhập khác"), value: "OTHER" },
    ];
  }, [grAttrDefs, t]);

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
      <DrawerField label={t("Loại nhập")}>
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
          allowClear={false}
        />
      </DrawerField>
      {form.receiptType === "PO" && (
        <DrawerField label={t("Đơn mua hàng (PO)")}>
          {(viewOnly || editing !== null) && form.purchaseOrderId ? (
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-md w-full overflow-hidden">
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
    </>
  );
}
