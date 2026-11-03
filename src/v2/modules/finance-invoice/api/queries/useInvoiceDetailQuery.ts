import { useQuery } from "@tanstack/react-query";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { findInvoice } from "@/v2/modules/finance-invoice/domain/rules/invoiceShape.logic";
import { financeInvoiceV2Api } from "../financeInvoiceV2Api";
import { toInvoiceRow } from "../adapters/invoiceRowAdapter";
import { isInvoiceSampleMode } from "../sampleMode";

/** Chi tiết một hóa đơn để hiển thị trong drawer chỉ đọc; `id` rỗng thì không tải */
export function useInvoiceDetailQuery(id: string | undefined) {
  return useQuery<FakeInvoice | undefined>({
    queryKey: ["finance-invoices", "detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (isInvoiceSampleMode()) return findInvoice(id!);
      const dto = await financeInvoiceV2Api.get(id!);
      return toInvoiceRow(dto, dto.direction ?? "IN");
    },
    staleTime: 30_000,
  });
}
