import type {
  GarageCollectionSummary,
  GarageCostPaymentSummary,
  GarageTrendItem,
} from "../../api/garageDashboardApi";

export interface GaragePaymentProgressCardProps {
  collectionSummary?: GarageCollectionSummary;
  costPaymentSummary?: GarageCostPaymentSummary;
  trend?: GarageTrendItem[];
  loading?: boolean;
}

export interface PaymentProgressTotals {
  caseCount: number;
  revenue: number;
  billed: number;
  paid: number;
  receivable: number;
  receivableWithInvoice: number;
  receivableNoInvoice: number;
  cost: number;
  paidCost: number;
  payableCost: number;
  payableCostWithInvoice: number;
  payableCostNoInvoice: number;
}
