export interface VinfastPartTrackingRow {
  itemCode: string;
  itemName: string;
  vehicleType: "CAR" | "MOTORBIKE";
  month: string;
  qtyBought: number;
  qtySold: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  margin: number;
  marginPct: string;
  buyInvoiceIds: string[];
  sellInvoiceIds: string[];
}

export interface VinfastPartsTrackingPageProps {
  vehicleType?: "CAR" | "MOTORBIKE";
}
