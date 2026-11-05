import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { DrawerAuditTimeline } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline";
import type {
  DrawerAuditItem,
  DrawerAuditVariant,
} from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
} from "../../procurement.types";

export interface ProcurementRequestApprovalTabProps {
  documentId?: string | null;
  api: ProcurementApi<unknown>;
  queryKey: string;
}

export const mapProcurementActionVariant = (
  action: string,
): DrawerAuditVariant => {
  switch (action.toLowerCase()) {
    case "approve":
    case "approved":
      return "success";
    case "reject":
    case "rejected":
    case "cancel":
    case "cancelled":
      return "danger";
    case "submit":
    case "submitted":
      return "warning";
    default:
      return "default";
  }
};

/** Tab hiển thị lịch sử / nhật ký các bước duyệt của đề nghị mua hàng. */
export function ProcurementRequestApprovalTab({
  documentId,
  api,
  queryKey,
}: ProcurementRequestApprovalTabProps) {
  const { t } = useV2Translation();

  const eventsQuery = useQuery<ProcurementApprovalEvent[]>({
    queryKey: [queryKey, "approval-events", documentId],
    queryFn: async () => {
      if (!documentId || !api.approvalEvents) return [];
      return api.approvalEvents(documentId);
    },
    enabled: Boolean(documentId),
  });

  const items: DrawerAuditItem[] = React.useMemo(() => {
    return (eventsQuery.data ?? []).map((ev) => ({
      id: ev.id,
      action: t(`v2.procurement.actions.${ev.action}`, ev.action),
      actor: ev.actorName || ev.actorEmail || ev.actorId || undefined,
      timestamp: ev.createdAt,
      details: ev.reason || undefined,
      variant: mapProcurementActionVariant(ev.action),
    }));
  }, [eventsQuery.data, t]);

  if (eventsQuery.isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {t("v2.common.loading", "Đang tải...")}
      </div>
    );
  }

  return (
    <div className="p-1">
      <DrawerAuditTimeline
        items={items}
        emptyMessage={t(
          "v2.procurement.audit.empty",
          "Chưa có sự kiện phê duyệt nào",
        )}
      />
    </div>
  );
}
