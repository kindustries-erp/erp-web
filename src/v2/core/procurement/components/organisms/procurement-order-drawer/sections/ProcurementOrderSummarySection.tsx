import { DrawerRow, DrawerSection } from "@/v2/shared/components";
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
  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.procurement.sections.summary", "Tổng quan")}>
        <DrawerRow
          label={t("v2.procurement.columns.total", "Tổng tiền")}
          value={formatProcurementMoney(sumProcurementLines(lines))}
        />
        <DrawerRow
          label={t("v2.procurement.columns.approvedTotal", "Tổng đã duyệt")}
          value={formatProcurementMoney(detail?.approvedTotal)}
        />
        <DrawerRow
          label={t("v2.procurement.columns.status", "Trạng thái")}
          value={<ProcurementStatusText value={status} t={t} />}
        />
        <DrawerRow
          label={t("v2.procurement.columns.fulfillment", "Nhận hàng")}
          value={
            <ProcurementStatusText
              value={detail?.fulfillmentStatus ?? "NONE"}
              t={t}
            />
          }
        />
      </DrawerSection>
      <DrawerSection
        title={t("v2.procurement.sections.payment", "Thanh toán")}
        defaultCollapsed
      >
        <DrawerRow
          label={t("v2.procurement.columns.payment", "Thanh toán")}
          value={t(
            `v2.procurement.status.${detail?.paymentStatus ?? "UNPAID"}`,
            detail?.paymentStatus ?? "UNPAID",
          )}
        />
        <DrawerRow
          label={t("v2.procurement.columns.createdBy", "Người tạo")}
          value={detail?.createdBy ?? "—"}
        />
        {form.requestId && (
          <DrawerRow
            label={t("v2.procurement.fields.sourceRequest", "Từ đề nghị mua")}
            value={detail?.requestId ?? "—"}
          />
        )}
      </DrawerSection>
    </div>
  );
}
