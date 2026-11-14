import * as React from "react";
import { DrawerSection } from "@/v2/shared/components";
import { V2ActivityTimeline } from "@/v2/shared/components/molecules/v2-activity-timeline";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useProcurementApprovalEvents } from "../../../hooks/useProcurementApprovalEvents";
import { ProcurementStatusBadge } from "../../molecules/procurement-status-badge";
import { toProcurementActivityItems } from "./ProcurementAuditSection.helper";
import type { ProcurementAuditSectionProps } from "./ProcurementAuditSection.type";

/**
 * Organism ProcurementAuditSection
 * Hiển thị phân vùng Nhật ký duyệt dạng Activity Feed hiện đại cho các chứng từ procurement
 * (Đề nghị mua hàng PR và Đơn mua hàng PO).
 */
export function ProcurementAuditSection({
  documentId,
  api,
  queryKey,
  defaultCollapsed = true,
  className,
}: ProcurementAuditSectionProps) {
  const { t, locale } = useV2Translation();
  const eventsQuery = useProcurementApprovalEvents(documentId, api, queryKey);
  const events = eventsQuery.data ?? [];

  const items = React.useMemo(() => {
    // Sắp xếp sự kiện mới nhất lên đầu để đưa vào Featured Card (giống Hình 1)
    const sorted = [...events].reverse();
    const rawItems = toProcurementActivityItems(sorted, t, locale);
    return rawItems.map((item, idx) => ({
      ...item,
      badge: (
        <ProcurementStatusBadge value={sorted[idx]?.toStatus ?? ""} t={t} />
      ),
    }));
  }, [events, t, locale]);

  return (
    <DrawerSection
      title={t("v2.procurement.sections.audit", "Nhật ký duyệt")}
      count={events.length}
      defaultCollapsed={defaultCollapsed}
      className={className}
      bodyClassName="max-h-80 overflow-y-auto"
    >
      {eventsQuery.isLoading ? (
        <div className="py-6 text-center text-sm text-muted-fg dark:text-zinc-500">
          {t("v2.common.loading", "Đang tải...")}
        </div>
      ) : (
        <V2ActivityTimeline
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
