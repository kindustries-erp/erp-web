import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ProcurementStatusBadge } from "../../../molecules/procurement-status-badge";
import { formatProcurementMoney } from "../../../../procurement.rules";
import {
  procurementLineAmount,
  sumProcurementLines,
} from "../../../../form/procurementLine.form";
import type { ProcurementRequestFormValue } from "../../../../form/procurementRequest.form";
import type { ProcurementRequestDetail } from "../../../../procurement.types";

export interface ProcurementRequestSummarySectionProps {
  form: ProcurementRequestFormValue;
  detail?: ProcurementRequestDetail;
}

/** Section tổng quan bên phải của Drawer đề nghị mua hàng. */
export function ProcurementRequestSummarySection({
  form,
  detail,
}: ProcurementRequestSummarySectionProps) {
  const { t } = useV2Translation();
  const estimated = sumProcurementLines(form.lines);
  const hasPrice = form.lines.some((l) => procurementLineAmount(l) !== null);

  const summaryRows: DrawerRowConfig[] = [
    {
      key: "estimatedTotal",
      label: t("v2.procurement.columns.estimatedTotal", "Tổng dự kiến"),
      value: hasPrice ? formatProcurementMoney(estimated) : "—",
    },
    {
      key: "status",
      label: t("v2.procurement.columns.status", "Trạng thái"),
      value: <ProcurementStatusBadge value={detail?.status ?? "DRAFT"} t={t} />,
    },
    {
      key: "ordering",
      label: t("v2.procurement.columns.ordering", "Tiến độ đặt"),
      value: (
        <ProcurementStatusBadge
          value={detail?.orderingStatus ?? "NONE"}
          t={t}
        />
      ),
    },
    {
      key: "createdBy",
      label: t("v2.procurement.columns.createdBy", "Người tạo"),
      value: detail?.createdByEmail ?? "—",
    },
    {
      key: "approver",
      label: t("v2.procurement.columns.approver", "Người duyệt"),
      value: detail?.approval?.approverEmail ?? "—",
    },
  ];

  return (
    <DrawerSection title={t("v2.procurement.sections.summary", "Tổng quan")}>
      <V2DrawerRowList rows={summaryRows} />
    </DrawerSection>
  );
}
