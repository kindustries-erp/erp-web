import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";

export interface LedgerRow {
  id: string;
  direction: "IN" | "OUT";
  qty: string;
  unitCost: string;
  preVatAmount: string;
  transactionDate: string;
  isAdjustment: boolean;
  adjSign: number;
  invoiceId: string;
  invoiceNo: string;
  invoiceDate: string;
  buyerName: string;
  sellerName: string;
  licensePlate: string;
  calculatedCogs?: number;
  calculatedUnitCost?: number;
}

export function useFifoUnitLedger(sku: string, open: boolean) {
  const query = useQuery({
    queryKey: ["vinfast-parts", "ledger", sku],
    queryFn: async () => {
      const res = await api.get(`/api/v1/vinfast-parts/ledger/${sku}`);
      return res.data;
    },
    enabled: open && !!sku,
  });

  return query;
}
