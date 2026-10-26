import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  invoiceDebtsApi,
  type InvoicePartnerType,
} from "@/modules/accounting/api/invoiceDebtsApi";

export interface InvoicePartnerUnallocatedSectionProps {
  taxCode: string;
  partnerType: InvoicePartnerType;
  enabled: boolean;
}

const money = (value: string | number) =>
  Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

/**
 * Các khoản sao kê đã gắn đối tượng nhưng chưa cấn trừ hóa đơn nào.
 * Đây là phần tiền mà kế toán cần gắn vào hóa đơn cụ thể (cấn trừ) khi có chứng từ.
 */
export function InvoicePartnerUnallocatedSection({
  taxCode,
  partnerType,
  enabled,
}: InvoicePartnerUnallocatedSectionProps) {
  const { t } = useTranslation(["debts", "common"]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice-partner-unallocated", partnerType, taxCode],
    queryFn: () => invoiceDebtsApi.getUnallocatedPayments(taxCode, partnerType),
    enabled: enabled && Boolean(taxCode) && taxCode !== "KHONG_MST",
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("common:loading", "Đang tải...")}
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {t("debts:unallocated.loadError", "Không thể tải khoản chưa phân bổ")}
      </p>
    );
  }
  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("debts:unallocated.empty", "Không có khoản chưa phân bổ")}
      </p>
    );
  }

  const total = items.reduce(
    (sum, row) => sum + Number(row.unallocatedAmount),
    0,
  );

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold tabular-nums">
        {t("debts:unallocated.total", "Tổng chưa phân bổ")}: {money(total)}
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-2 py-1.5">
                {t("debts:unallocated.date", "Ngày GD")}
              </th>
              <th className="px-2 py-1.5">
                {t("debts:unallocated.reference", "Số tham chiếu")}
              </th>
              <th className="px-2 py-1.5">
                {t("debts:unallocated.description", "Diễn giải")}
              </th>
              <th className="px-2 py-1.5 text-right">
                {t("debts:unallocated.amount", "Số tiền")}
              </th>
              <th className="px-2 py-1.5 text-right">
                {t("debts:unallocated.netOff", "Đã cấn trừ")}
              </th>
              <th className="px-2 py-1.5 text-right">
                {t("debts:unallocated.remaining", "Chưa phân bổ")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {row.transDate}
                </td>
                <td className="px-2 py-1.5 font-mono">
                  {row.referenceNumber || "—"}
                </td>
                <td
                  className="px-2 py-1.5 max-w-[360px] truncate"
                  title={row.description || ""}
                >
                  {row.description || "—"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {money(row.amount)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {money(row.netOffAmount)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                  {money(row.unallocatedAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
