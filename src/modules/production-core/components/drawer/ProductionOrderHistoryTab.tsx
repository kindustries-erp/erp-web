import React, { useMemo } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  DrawerAuditTimeline,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import { useT } from "@/core/i18n";
import type { ErpProductionOrder } from "../../api/productionCoreApi";

export interface ProductionOrderHistoryTabProps {
  order: ErpProductionOrder | null;
}

export function ProductionOrderHistoryTab({
  order,
}: ProductionOrderHistoryTabProps) {
  const t = useT();

  const auditLogs: DrawerAuditLogItem[] = useMemo(() => {
    if (!order) return [];

    const items: DrawerAuditLogItem[] = [];

    // 1. Tạo mới lệnh
    if (order.createdAt) {
      items.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: t("Tạo Lệnh Sản Xuất"),
        timestamp: order.createdAt,
        message: `${t("Mã lệnh")}: ${order.referenceNo || order.id} — ${t("Thành phẩm")}: ${order.finishedGoodItemName || order.finishedGoodItemId || "—"} (${t("Số lượng")}: ${order.qtyToProduce || 1})`,
      });
    }

    // 2. Duyệt lệnh / Giữ chỗ tồn kho
    if (order.status !== "DRAFT") {
      items.push({
        id: "confirmed",
        actionType: "APPROVE",
        actionLabel: t("Xác nhận lệnh & Giữ chỗ NVL"),
        timestamp:
          (order.updatedAt as string) ||
          order.createdAt ||
          new Date().toISOString(),
        message: t(
          "Lệnh sản xuất đã được phê duyệt. Tồn kho nguyên vật liệu đã được giữ chỗ theo định mức BOM.",
        ),
      });
    }

    // 3. Bắt đầu sản xuất (xuất NVL)
    if (order.status === "IN_PROGRESS" || order.status === "COMPLETED") {
      items.push({
        id: "in_progress",
        actionType: "EXECUTE",
        actionLabel: t("Bắt đầu sản xuất (Giai đoạn 1)"),
        timestamp:
          order.plannedStartDate ||
          (order.updatedAt as string) ||
          order.createdAt ||
          new Date().toISOString(),
        message: t(
          "Đã xuất kho NVL sản xuất và ghi nhận nhật ký giao dịch kho.",
        ),
      });
    }

    // 4. Hoàn thành sản xuất
    if (order.status === "COMPLETED") {
      items.push({
        id: "completed",
        actionType: "COMPLETE",
        actionLabel: t("Hoàn thành sản xuất (Giai đoạn 2)"),
        timestamp:
          order.plannedEndDate ||
          (order.updatedAt as string) ||
          order.createdAt ||
          new Date().toISOString(),
        message: `${t("Đã nghiệm thu và nhập kho đủ 100% số lượng thành phẩm mục tiêu")} (${order.qtyProduced || 0} ${t("đơn vị")}).`,
      });
    }

    // 5. Hủy lệnh (nếu có)
    if (order.status === "CANCELLED") {
      items.push({
        id: "cancelled",
        actionType: "CANCEL",
        actionLabel: t("Hủy lệnh sản xuất"),
        timestamp:
          (order.updatedAt as string) ||
          order.createdAt ||
          new Date().toISOString(),
        message: t(
          "Lệnh sản xuất đã bị hủy. Hệ thống đã hoàn trả tồn kho giữ chỗ.",
        ),
      });
    }

    return items;
  }, [order, t]);

  return (
    <div className="space-y-4">
      <DrawerSection
        title={t("Nhật ký thao tác & Dòng thời gian")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
          <DrawerAuditTimeline items={auditLogs} />
        </div>
      </DrawerSection>
    </div>
  );
}
