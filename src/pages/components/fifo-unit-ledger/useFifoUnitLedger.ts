import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";

export interface FifoUnitRow {
  unitIndex: number;
  inLedgerId: string;
  inDate: string;
  inInvoiceNo: string;
  inInvoiceId: string;
  inUnitCost: number;
  outLedgerId?: string;
  outDate?: string;
  outInvoiceNo?: string;
  outInvoiceId?: string;
  licensePlate?: string;
  outPrice?: number;
  cogsFifo?: number;
  profit?: number;
  qty?: number;
  status: "IN_STOCK" | "SOLD" | "ADJUSTMENT";
}

export function useFifoUnitLedger(sku: string, open: boolean) {
  const query = useQuery({
    queryKey: ["vinfast-parts", "fifo-rows", sku],
    queryFn: async () => {
      // Assuming we fetch all in one page for now if limit is not handled from UI yet
      const res = await api.get(`/api/v1/vinfast-parts/fifo-rows/${sku}`, {
        params: { limit: 1000 },
      });
      return res.data;
    },
    enabled: open && !!sku,
  });

  return query;
}
