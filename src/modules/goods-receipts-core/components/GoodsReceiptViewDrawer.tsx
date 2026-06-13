import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import {
  goodsReceiptsCoreApi,
  type ErpGoodsReceipt,
} from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { Tooltip } from "@/core/components/ui/Tooltip";

interface GoodsReceiptViewDrawerProps {
  open?: boolean;
  receiptId: string | null;
  onClose: () => void;
}

function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function GoodsReceiptViewDrawer({
  open,
  receiptId,
  onClose,
}: GoodsReceiptViewDrawerProps) {
  const [detail, setDetail] = useState<ErpGoodsReceipt | null>(null);
  const [poDetail, setPoDetail] = useState<ErpPurchaseOrder | null>(null);
  const [itemsDict, setItemsDict] = useState<Record<string, ErpInventoryItem>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptId) {
      setDetail(null);
      setPoDetail(null);
      return;
    }
    let active = true;
    async function load(id: string) {
      setLoading(true);
      setError(null);
      try {
        const gr = await goodsReceiptsCoreApi.get(id);
        if (!active) return;
        setDetail(gr);
        let po: ErpPurchaseOrder | null = null;
        if (gr.purchaseOrderId) {
          po = await purchaseOrdersCoreApi.get(gr.purchaseOrderId as string);
          if (active) setPoDetail(po);
        }

        const itemIds = Array.from(
          new Set(
            [
              ...(gr.lines || []).map((l) => l.itemId),
              ...(po?.lines || []).map((l) => l.itemId),
            ].filter(Boolean),
          ),
        ) as string[];

        if (itemIds.length > 0) {
          const dict: Record<string, ErpInventoryItem> = {};
          try {
            const res = await inventoryCoreApi.list({
              ids: itemIds.join(","),
              pageSize: 1000,
            });
            for (const it of res.items) {
              dict[it.id] = it;
            }
          } catch (err) {
            console.warn("Failed to fetch inventory items", err);
          }
          if (active) setItemsDict(dict);
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Không thể tải chi tiết phiếu nhập",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load(receiptId);
    return () => {
      active = false;
    };
  }, [receiptId]);

  const actions: DrawerAction[] = [{ label: "Đóng", onClick: onClose }];

  const poOptions = poDetail
    ? [
        {
          value: poDetail.id,
          label: `${poDetail.poNo || poDetail.id} — ${poDetail.supplierName || ""}`,
        },
      ]
    : [];

  return (
    <DrawerModal
      open={open !== undefined ? open : !!receiptId}
      onClose={onClose}
      icon={<Boxes className="h-4 w-4" />}
      title="Phiếu nhập kho"
      subtitle={detail?.receiptNo ?? "Nhập kho"}
      actions={actions}
    >
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading && !detail && (
        <div className="flex justify-center p-8 text-sm text-muted-foreground">
          Đang tải chi tiết...
        </div>
      )}

      {detail && (
        <>
          <DrawerSection title="THÔNG TIN PHIẾU">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DrawerField label="Số phiếu">
                <input
                  className={inputCls}
                  value={detail.receiptNo || ""}
                  disabled
                />
              </DrawerField>
              <DrawerField label="Ngày nhập">
                <input
                  type="date"
                  className={inputCls}
                  value={
                    detail.receiptDate ? detail.receiptDate.slice(0, 10) : ""
                  }
                  disabled
                />
              </DrawerField>
              <DrawerField label="Đơn mua hàng (PO)">
                <Combobox
                  options={poOptions}
                  value={detail.purchaseOrderId || ""}
                  disabled
                  placeholder=""
                  onChange={() => {}}
                />
              </DrawerField>
            </div>
            <DrawerField label="Ghi chú">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={detail.remarks || ""}
                disabled
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title="CHI TIẾT">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium w-12 text-center">
                      STT
                    </th>
                    <th className="px-3 py-2 font-medium">Mã linh kiện</th>
                    <th className="px-3 py-2 font-medium">Tên linh kiện</th>
                    <th className="px-3 py-2 font-medium text-right">
                      SL thay đổi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detail.lines?.map((line, i) => {
                    const matchingPoLine = poDetail?.lines?.find(
                      (l) => l.id === line.purchaseOrderLineId,
                    );
                    const itemName =
                      line.itemName ||
                      matchingPoLine?.itemName ||
                      matchingPoLine?.description ||
                      "—";
                    const itemId = line.itemId || matchingPoLine?.itemId;
                    const itemCode =
                      (itemId && itemsDict[itemId]?.sku) || itemId || "—";

                    return (
                      <tr key={line.id || i} className="bg-background">
                        <td className="px-3 py-2 text-center text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 font-medium text-xs max-w-[120px] truncate">
                          <Tooltip content={itemCode}>
                            <span className="cursor-help">{itemCode}</span>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2 max-w-[200px] truncate">
                          <Tooltip content={itemName}>
                            <span className="cursor-help">{itemName}</span>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-emerald-600">
                          +{fmtQty(line.qtyReceived)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DrawerSection>
        </>
      )}
    </DrawerModal>
  );
}
