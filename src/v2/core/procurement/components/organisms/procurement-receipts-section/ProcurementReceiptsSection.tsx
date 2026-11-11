import { useQuery } from "@tanstack/react-query";
import { DrawerSection, V2Button, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementReceiptHistory } from "../../../procurement.drawer.type";

export interface ProcurementReceiptsSectionProps {
  orderId: string;
  history: ProcurementReceiptHistory;
}

const STATUS_FALLBACK: Record<string, string> = {
  DRAFT: "Nháp",
  POSTED: "Đã ghi sổ",
  CANCELLED: "Đã hủy",
};

const formatAmount = (value: number | string | null): string => {
  const n = Number(value);
  return value === null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
};

/**
 * Lịch sử nhập kho của đơn mua: mỗi lần nhập là một phiếu (nhập nhiều đợt).
 * Chỉ phiếu đã ghi sổ mới tính vào số đã nhận; phiếu nháp hiện để theo dõi.
 */
export function ProcurementReceiptsSection({
  orderId,
  history,
}: ProcurementReceiptsSectionProps) {
  const { t } = useV2Translation();
  const receipts = useQuery({
    queryKey: ["v2-procurement", "order-receipts", orderId],
    queryFn: () => history.load(orderId),
    staleTime: 10_000,
  });
  const rows = receipts.data ?? [];

  return (
    <DrawerSection
      title={t("v2.procurement.receipts.title", "Lịch sử nhập kho")}
      count={rows.length}
    >
      {receipts.isError ? (
        <V2Text as="p" variant="body-sm" className="text-xs text-destructive">
          {t(
            "v2.procurement.receipts.error",
            "Không tải được lịch sử nhập kho",
          )}
        </V2Text>
      ) : receipts.isLoading ? (
        <V2Text as="p" variant="body-sm" className="text-xs text-muted-fg">
          {t("v2.common.loading", "Đang tải...")}
        </V2Text>
      ) : rows.length === 0 ? (
        <V2Text as="p" variant="body-sm" className="text-xs text-muted-fg">
          {t("v2.procurement.receipts.empty", "Chưa có phiếu nhập kho nào")}
        </V2Text>
      ) : (
        <ul className="divide-y divide-border/60">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0">
                <V2Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-mono text-xs font-semibold text-primary hover:underline"
                  onClick={() => history.onOpen(row.id)}
                >
                  {row.receiptNo}
                </V2Button>
                <V2Text
                  as="p"
                  variant="body-sm"
                  className="text-[11px] text-muted-fg"
                >
                  {[
                    row.receiptDate?.slice(0, 10),
                    t(
                      `v2.procurement.receipts.status.${row.status}`,
                      STATUS_FALLBACK[row.status] ?? row.status,
                    ),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </V2Text>
              </div>
              <V2Text
                as="span"
                variant="body-sm"
                className="shrink-0 text-xs tabular-nums"
              >
                {formatAmount(row.totalAmount)}
              </V2Text>
            </li>
          ))}
        </ul>
      )}
    </DrawerSection>
  );
}
