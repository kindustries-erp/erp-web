import React from "react";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { DrawerDocumentTraceability } from "@/shared/components/StandardFormDrawer";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useT } from "@/core/i18n";
import type { ErpProductionOrder } from "../../api/productionCoreApi";

export interface ProductionOrderTraceabilityTabProps {
  order: ErpProductionOrder | null;
}

export function ProductionOrderTraceabilityTab({
  order,
}: ProductionOrderTraceabilityTabProps) {
  const t = useT();

  if (!order) {
    return (
      <div className="p-4 text-xs text-muted-foreground italic text-center">
        {t("Không có thông tin lệnh sản xuất")}
      </div>
    );
  }

  // Extract any linked doc ids from metadata or order
  const meta = (order.outputMetadata || {}) as Record<string, any>;
  const goodsIssueId = order.goodsIssueId || meta.goodsIssueId;
  const goodsReceiptId = order.goodsReceiptId || meta.goodsReceiptId;
  const salesOrderId = order.salesOrderId || meta.salesOrderId;
  const bomId = meta.bomId;

  return (
    <div className="space-y-4">
      {/* Section 1: Danh sách chứng từ kho phát sinh */}
      <DrawerSection
        title={t("Chứng từ kho liên kết")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Phiếu xuất kho NVL */}
          <div className="p-3 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {t("Phiếu Xuất Kho NVL")}
              </span>
              <p className="text-xs font-semibold text-foreground truncate">
                {order.goodsIssueNo ||
                  meta.goodsIssueNo ||
                  (goodsIssueId ? `#${goodsIssueId.slice(0, 8)}` : "—")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {order.status === "DRAFT" || order.status === "CONFIRMED"
                  ? t("Chờ xuất kho khi bắt đầu sản xuất")
                  : t("Đã xuất kho NVL theo tỷ lệ")}
              </p>
            </div>
          </div>

          {/* Phiếu nhập kho Thành phẩm */}
          <div className="p-3 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {t("Phiếu Nhập Kho Thành Phẩm")}
              </span>
              <p className="text-xs font-semibold text-foreground truncate">
                {order.goodsReceiptNo ||
                  meta.goodsReceiptNo ||
                  (goodsReceiptId ? `#${goodsReceiptId.slice(0, 8)}` : "—")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {Number(order.qtyProduced || 0) > 0
                  ? `${t("Đã nhập")} ${order.qtyProduced} ${t("thành phẩm vào kho")}`
                  : t("Chưa có thành phẩm nhập kho")}
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin liên kết bổ sung */}
        <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
          {bomId && (
            <DrawerRow
              label={t("Phiên bản BOM gốc")}
              value={<span className="font-mono text-primary">{bomId}</span>}
            />
          )}
          {salesOrderId && (
            <DrawerRow
              label={t("Đơn bán hàng liên quan")}
              value={
                <span className="font-semibold text-foreground">
                  {salesOrderId}
                </span>
              }
            />
          )}
        </div>
      </DrawerSection>

      {/* Section 2: Cấu trúc linh kiện As-Built BOM (Serial phụ tùng gán theo xe) */}
      {Array.isArray((order as any).serialAssignments) &&
        (order as any).serialAssignments.length > 0 && (
          <DrawerSection
            title={t(
              "Cấu trúc linh kiện As-Built BOM (Serial phụ tùng theo xe)",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/70 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-3 py-2 text-center w-10 font-semibold">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-semibold font-mono">
                      {t("Số khung (VIN)")}
                    </th>
                    <th className="px-3 py-2 text-left font-semibold font-mono">
                      {t("Số máy")}
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      {t("Linh kiện / NVL")}
                    </th>
                    <th className="px-3 py-2 text-left font-semibold font-mono text-primary bg-primary/5">
                      {t("Số Serial linh kiện")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      {t("Nguồn gán")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(order as any).serialAssignments.map(
                    (asgn: any, idx: number) => (
                      <tr key={asgn.id || idx} className="hover:bg-muted/30">
                        <td className="px-3 py-2 text-center text-muted-foreground font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                          {asgn.vinNo || "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-foreground">
                          {asgn.engineNo || "—"}
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {asgn.componentItemName || asgn.componentSku || "—"}
                          {asgn.componentSku && asgn.componentItemName && (
                            <span className="block text-[11px] font-mono text-muted-foreground">
                              {asgn.componentSku}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold text-primary bg-primary/5">
                          {asgn.componentSerialNo || "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                            {asgn.assignmentSource || "AUTO_FIFO"}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </DrawerSection>
        )}

      {/* Section 3: Mạng lưới chuỗi cung ứng Traceability */}
      <DrawerSection
        title={t("Mạng lưới chuỗi cung ứng (Traceability Graph)")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="h-[380px] w-full rounded-xl border border-border overflow-hidden bg-background">
          <DrawerDocumentTraceability
            rootId={order.id}
            rootType="GOODS_ISSUE"
            fetchGraph={async () => ({
              rootId: order.id,
              rootType: "GOODS_ISSUE" as const,
              nodes: [
                {
                  id: order.id,
                  docType: "GOODS_ISSUE" as const,
                  docNo: order.referenceNo || order.id.slice(0, 8),
                  title: order.finishedGoodItemName || "Lệnh sản xuất",
                  date: order.createdAt || null,
                  isCurrent: true,
                  depth: 0,
                  hasPermission: true,
                  restricted: false,
                  requiredResource: "production",
                  status: order.status || "CONFIRMED",
                },
              ],
              edges: [],
              summary: {
                totalAmount: 0,
                totalNetOffAmount: 0,
                matchRatio: 1,
                directCount: 1,
                transitiveCount: 0,
              },
            })}
          />
        </div>
      </DrawerSection>
    </div>
  );
}
