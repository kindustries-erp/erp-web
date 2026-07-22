import { useMemo } from "react";
import { Repeat } from "lucide-react";
import { normalizeDate, money } from "@/shared/utils/format";
import { StatusBadge } from "@/shared/components/badges";
import { isRecurringDocument } from "@/modules/operational/api/operationalApi";
import {
  getDocNo,
  getPartner,
  sourceLabel,
  inventoryStatusLabel,
} from "@/modules/operational/utils/operationalHelpers";
import { useT } from "@/core/i18n";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type {
  OperationalDocument,
  OperationalVariant,
} from "@/modules/operational/api/operationalApi";

interface UseBaseColumnsOptions {
  variant: OperationalVariant;
  paymentLinkable?: boolean;
}

/**
 * Hook trả về base columns cho các variant không phải purchase.
 * Extracted từ OperationalListPage.tsx (dòng 1479–1573).
 */
export function useBaseColumns({
  variant,
}: UseBaseColumnsOptions): DataTableColumn<OperationalDocument>[] {
  const t = useT();
  return useMemo<DataTableColumn<OperationalDocument>[]>(
    () => [
      {
        key: "document",
        header: t("Chứng từ"),
        className: "align-top text-left",
        headerClassName: "w-[180px] text-center",
        cell: (row) => (
          <div className="space-y-1">
            <div className="font-medium text-sm">{getDocNo(row)}</div>
            <div className="text-xs text-[color:var(--muted-fg)]">
              {sourceLabel(row, variant)}
            </div>
          </div>
        ),
      },
      {
        key: "partner",
        header:
          variant === "receivables"
            ? t("Khách hàng / Nội dung")
            : t("Đối tác / Nội dung"),
        className: "align-top text-left",
        headerClassName: "min-w-[220px] text-center",
        cell: (row) => (
          <div className="space-y-1">
            <div>{getPartner(row)}</div>
            {row.vehicle_plate ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                {t("Xe")}: {row.vehicle_plate}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "dates",
        header: t("Ngày"),
        className: "align-top text-right",
        headerClassName: "w-[140px] text-center",
        cell: (row) => (
          <div className="space-y-1 text-sm w-full text-right">
            <div>CT: {normalizeDate(row.document_date) || "—"}</div>
            <div className="text-xs text-[color:var(--muted-fg)]">
              ĐH: {normalizeDate(row.due_date) || "—"}
            </div>
            {isRecurringDocument(row) ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-[color:var(--muted)] px-2 py-0.5 text-xs text-[color:var(--muted-fg)]">
                <Repeat className="h-3 w-3" />
                Recurring
              </div>
            ) : null}
            {row.next_due_date ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                {t("Kỳ sau")}: {normalizeDate(row.next_due_date)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: "amounts",
        header: t("Số tiền"),
        className: "align-top text-right",
        headerClassName: "w-[180px] text-center",
        cell: (row) => (
          <div className="space-y-1 text-sm w-full text-right">
            <div>
              {t("Tổng")}: {money(row.total_amount)}
            </div>
            <div>
              {t("Đã cấn")}: {money(row.settled_amount)}
            </div>
            <div className="font-medium">
              {t("Còn mở")}: {money(row.open_amount)}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: t("Trạng thái"),
        className: "align-top text-center",
        headerClassName: "w-[170px] text-center",
        cell: (row) => (
          <div className="flex flex-col gap-1 items-center w-full">
            <StatusBadge status={row.status} />
            {variant === "sales" && row.inventory_status ? (
              <div className="text-xs text-[color:var(--muted-fg)]">
                {t("Kho")}: {inventoryStatusLabel(row.inventory_status)}
              </div>
            ) : null}
          </div>
        ),
      },
    ],
    [variant, t],
  );
}
