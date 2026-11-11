import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { ProcurementReceiptHistoryRow } from "@/v2/core/procurement";

interface ReceiptRowDto {
  id: string;
  receiptNo: string;
  receiptDate?: string | null;
  status: string;
  totalAmount?: number | string | null;
}

const RECEIPTS_URL = "/api/v1/garage-goods-receipts";
const MAX_RECEIPTS = 100;

/**
 * Các phiếu nhập kho Garage của một đơn mua (mới nhất trước): mỗi lần nhập hàng là một phiếu,
 * nên đây là lịch sử nhập nhiều đợt. Lọc theo `garageProcurementOrderId` ở API.
 */
export async function listGarageOrderReceipts(
  orderId: string,
): Promise<ProcurementReceiptHistoryRow[]> {
  const { data } = await v2HttpClient.get<{ items: ReceiptRowDto[] }>(
    RECEIPTS_URL,
    {
      params: {
        page: 1,
        pageSize: MAX_RECEIPTS,
        sort: "-createdAt",
        column_filters: JSON.stringify({ garageProcurementOrderId: [orderId] }),
      },
    },
  );
  return data.items.map((r) => ({
    id: r.id,
    receiptNo: r.receiptNo,
    receiptDate: r.receiptDate ?? null,
    status: r.status,
    totalAmount: r.totalAmount ?? null,
  }));
}
