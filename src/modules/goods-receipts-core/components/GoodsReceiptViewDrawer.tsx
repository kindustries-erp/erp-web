import { useEffect, useState } from "react";
import { Boxes, ChevronRight, ChevronLeft } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import { cn } from "@/shared/utils";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
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
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";

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
  const [showGeneralInfo, setShowGeneralInfo] = useState(true);
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
      panelClassName="min-[1024px]:min-w-[1120px]"
    >
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading && !detail && (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-4">
            <DrawerSection title="Chi tiết">
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </DrawerSection>
          </div>
          <div className="shrink-0 order-1 xl:order-2 w-full xl:w-[320px] space-y-4">
            <DrawerSection title="Thông tin chung">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </DrawerSection>
          </div>
        </div>
      )}

      {detail && (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-4">
            <DrawerSection title="Chi tiết">
              <DocumentLineTable
                columns={[
                  {
                    key: "index",
                    header: "STT",
                    width: 40,
                    align: "center",
                    cell: (_, i) => (
                      <span className="text-muted-foreground">{i + 1}</span>
                    ),
                  },
                  {
                    key: "itemCode",
                    header: "Mã linh kiện",
                    minWidth: 140,
                    cell: (
                      line: NonNullable<ErpGoodsReceipt["lines"]>[number],
                    ) => {
                      const matchingPoLine = poDetail?.lines?.find(
                        (l) => l.id === line.purchaseOrderLineId,
                      );
                      const itemId = line.itemId || matchingPoLine?.itemId;
                      const itemCode =
                        (itemId && itemsDict[itemId]?.sku) || itemId || "—";
                      return (
                        <Tooltip content={itemCode}>
                          <span className="cursor-help line-clamp-2 font-medium text-xs">
                            {itemCode}
                          </span>
                        </Tooltip>
                      );
                    },
                  },
                  {
                    key: "itemName",
                    header: "Tên linh kiện",
                    minWidth: 260,
                    cell: (
                      line: NonNullable<ErpGoodsReceipt["lines"]>[number],
                    ) => {
                      const matchingPoLine = poDetail?.lines?.find(
                        (l) => l.id === line.purchaseOrderLineId,
                      );
                      const itemName =
                        line.itemName ||
                        matchingPoLine?.itemName ||
                        matchingPoLine?.description ||
                        "—";
                      return (
                        <Tooltip content={itemName}>
                          <span className="cursor-help line-clamp-2">
                            {itemName}
                          </span>
                        </Tooltip>
                      );
                    },
                  },
                  {
                    key: "qtyReceived",
                    header: "SL thay đổi",
                    minWidth: 140,
                    align: "right",
                    cell: (
                      line: NonNullable<ErpGoodsReceipt["lines"]>[number],
                    ) => (
                      <span className="font-medium text-emerald-600">
                        +{fmtQty(line.qtyReceived)}
                      </span>
                    ),
                  },
                ]}
                data={detail.lines || []}
                getRowKey={(line, i) => line.id || i}
                viewOnly={true}
              />
            </DrawerSection>
          </div>

          <div
            className={cn(
              "shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300",
              showGeneralInfo ? "w-full xl:w-[320px]" : "w-auto",
            )}
          >
            <DrawerSection
              title={showGeneralInfo ? "Thông tin chung" : ""}
              titleExtra={
                <button
                  type="button"
                  onClick={() => setShowGeneralInfo((s) => !s)}
                  className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                  title={showGeneralInfo ? "Thu gọn" : "Mở rộng"}
                >
                  {showGeneralInfo ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              }
            >
              {showGeneralInfo && (
                <div className="flex flex-col gap-3">
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
                        detail.receiptDate
                          ? detail.receiptDate.slice(0, 10)
                          : ""
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
                  <DrawerField label="Ghi chú">
                    <textarea
                      className={`${inputCls} min-h-[84px] resize-y`}
                      value={detail.remarks || ""}
                      disabled
                    />
                  </DrawerField>
                </div>
              )}
            </DrawerSection>
          </div>
        </div>
      )}
    </DrawerModal>
  );
}
