import * as React from "react";
import { DrawerSection } from "@/v2/shared/components";
import { DrawerAuditTimeline } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useProcurementApprovalEvents } from "../../../../hooks/useProcurementApprovalEvents";
import type { ProcurementApi } from "../../../../procurement.types";
import { ProcurementStatusBadge } from "../../../molecules/procurement-status-badge";
import { toAuditRows } from "./ProcurementRequestAuditSection.helper";

export interface ProcurementRequestAuditSectionProps {
  documentId: string;
  api: ProcurementApi<unknown>;
  queryKey: string;
}

/**
 * Nhật ký duyệt của đề nghị, nằm dưới thông tin chung ở cột phải.
 * Mặc định thu gọn; khi mở, mỗi dòng gồm hành động, badge trạng thái,
 * tác nhân, thời gian và lý do.
 */
export function ProcurementRequestAuditSection({
  documentId,
  api,
  queryKey,
}: ProcurementRequestAuditSectionProps) {
  const { t } = useV2Translation();
  const eventsQuery = useProcurementApprovalEvents(documentId, api, queryKey);
  const events = eventsQuery.data ?? [];

  const items: DrawerAuditItem[] = toAuditRows(events, t).map((row) => ({
    id: row.key,
    action: row.action,
    actor: row.actor,
    timestamp: row.timestamp,
    details: row.details,
    variant: row.variant,
    badge: <ProcurementStatusBadge value={row.toStatus} t={t} />,
  }));

  return (
    <DrawerSection
      title={t("v2.procurement.sections.audit", "Nhật ký duyệt")}
      count={events.length}
      defaultCollapsed
      bodyClassName="max-h-80 overflow-y-auto"
    >
      {eventsQuery.isLoading ? (
        <div className="py-6 text-center text-sm text-muted-fg">
          {t("v2.common.loading", "Đang tải...")}
        </div>
      ) : (
        <DrawerAuditTimeline
          layout="stacked"
          items={items}
          emptyMessage={t(
            "v2.procurement.audit.empty",
            "Chưa có sự kiện phê duyệt nào",
          )}
        />
      )}
    </DrawerSection>
  );
}
