import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ProcurementStatusText } from "../../../../columns/procurementColumns";
import { formatProcurementMoney } from "../../../../procurement.rules";
import {
  sumProcurementLines,
  type ProcurementLineFormValue,
} from "../../../../form/procurementLine.form";
import type { ProcurementOrderFormValue } from "../../../../form/procurementOrder.form";
import type { ProcurementOrderDetail } from "../../../../procurement.types";

export interface ProcurementOrderSummarySectionProps {
  form: Pick<ProcurementOrderFormValue, "lines" | "requestId">;
  detail?: ProcurementOrderDetail;
}

/** Phần phải: tổng quan, trạng thái và thông tin thanh toán (chỉ đọc). */
export function ProcurementOrderSummarySection({
  form,
  detail,
}: ProcurementOrderSummarySectionProps) {
  const { t } = useV2Translation();
  const status = detail?.status ?? "DRAFT";
  const lines: ProcurementLineFormValue[] = form.lines;

  const summaryRows: DrawerRowConfig[] = [
    {
      key: "total",
      label: t("v2.procurement.columns.total", "Tổng tiền"),
      value: formatProcurementMoney(sumProcurementLines(lines)),
    },
    {
      key: "approvedTotal",
      label: t("v2.procurement.columns.approvedTotal", "Tổng đã duyệt"),
      value: formatProcurementMoney(detail?.approvedTotal),
    },
    {
      key: "status",
      label: t("v2.procurement.columns.status", "Trạng thái"),
      value: <ProcurementStatusText value={status} t={t} />,
    },
    {
      key: "fulfillment",
      label: t("v2.procurement.columns.fulfillment", "Nhận hàng"),
      value: (
        <ProcurementStatusText
          value={detail?.fulfillmentStatus ?? "NONE"}
          t={t}
        />
      ),
    },
  ];

  const paymentRows: DrawerRowConfig[] = [
    {
      key: "payment",
      label: t("v2.procurement.columns.payment", "Thanh toán"),
      value: t(
        `v2.procurement.status.${detail?.paymentStatus ?? "UNPAID"}`,
        detail?.paymentStatus ?? "UNPAID",
      ),
    },
    {
      key: "createdBy",
      label: t("v2.procurement.columns.createdBy", "Người tạo"),
      value: detail?.createdByEmail ?? "—",
    },
    {
      key: "sourceRequest",
      label: t("v2.procurement.fields.sourceRequest", "Từ đề nghị mua"),
      value: detail?.requestId ?? "—",
      hidden: !form.requestId,
    },
  ];

  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.procurement.sections.summary", "Tổng quan")}>
        <V2DrawerRowList rows={summaryRows} />
      </DrawerSection>
      <DrawerSection
        title={t("v2.procurement.sections.payment", "Thanh toán")}
        defaultCollapsed
      >
        <V2DrawerRowList rows={paymentRows} />
      </DrawerSection>
    </div>
  );
}
