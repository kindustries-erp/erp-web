import * as React from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import {
  DrawerRelatedDeck,
  DrawerRow,
  DrawerSection,
  V2Button,
  V2EmptyState,
} from "@/v2/shared/components";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ProcurementStatusBadge } from "../../../molecules/procurement-status-badge";
import type { ProcurementRequestDetail } from "../../../../procurement.types";

export interface ProcurementRequestRelatedTabProps {
  detail?: ProcurementRequestDetail;
  canCreateOrder?: boolean;
  onOrderFromRequest?: () => void;
}

interface ProgressRowConfig {
  key: string;
  label: string;
  value: React.ReactNode;
}

/** Tab hiển thị chứng từ liên kết: tiến độ đặt hàng PO và nút tạo PO nhanh nếu đã duyệt. */
export function ProcurementRequestRelatedTab({
  detail,
  canCreateOrder,
  onOrderFromRequest,
}: ProcurementRequestRelatedTabProps) {
  const { t } = useV2Translation();

  if (!detail) {
    return (
      <V2EmptyState
        title={t("v2.procurement.related.noLinks", "Chưa có chứng từ liên kết")}
      />
    );
  }

  const isApproved = detail.status === "APPROVED";
  const canOrder = isApproved && detail.orderingStatus !== "FULL";

  const progressRows: ProgressRowConfig[] = [
    {
      key: "orderingStatus",
      label: t("v2.procurement.columns.ordering", "Trạng thái đặt hàng"),
      value: (
        <ProcurementStatusBadge value={detail.orderingStatus ?? "NONE"} t={t} />
      ),
    },
    {
      key: "branchName",
      label: t("v2.procurement.columns.branch", "Chi nhánh thực hiện"),
      value: detail.branchName ?? "—",
    },
  ];

  const deckTabs = [
    {
      key: "procurement-orders",
      label: t("v2.procurement.drawer.tabOrders", "Đơn mua hàng"),
      icon: <ShoppingCart className="h-4 w-4" />,
      content: (
        <div className="space-y-3 p-3">
          {canOrder && (
            <div className="rounded-lg border border-border/80 bg-muted/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <V2Text
                    as="h4"
                    variant="body-sm"
                    weight="medium"
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    {t(
                      "v2.procurement.related.createPoTitle",
                      "Lập đơn mua hàng",
                    )}
                  </V2Text>
                  <V2Text as="p" variant="caption" color="muted">
                    {t(
                      "v2.procurement.related.createPoDesc",
                      "Đề nghị đã được duyệt. Bạn có thể lập đơn mua hàng điền sẵn từ các dòng hàng của đề nghị này.",
                    )}
                  </V2Text>
                </div>
                {canCreateOrder && onOrderFromRequest && (
                  <V2Button
                    size="sm"
                    className="shrink-0"
                    onClick={onOrderFromRequest}
                  >
                    {t(
                      "v2.procurement.actions.createOrder",
                      "Lập đơn mua từ đề nghị này",
                    )}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </V2Button>
                )}
              </div>
            </div>
          )}
          {!canOrder && (
            <V2EmptyState
              description={t(
                "v2.procurement.related.noOrdersYet",
                "Chưa có đơn mua hàng phát sinh từ đề nghị này.",
              )}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-1">
      <DrawerSection
        title={t(
          "v2.procurement.sections.orderingProgress",
          "Tiến độ đặt hàng",
        )}
      >
        {progressRows.map((r) => (
          <DrawerRow key={r.key} label={r.label} value={r.value} />
        ))}
      </DrawerSection>

      <DrawerRelatedDeck tabs={deckTabs} defaultTabKey="procurement-orders" />
    </div>
  );
}
