import type { GarageCashflowTrendItem } from "../../../api/garageCashflowApi";

export interface GarageCashflowTrendPanelProps {
  trend?: GarageCashflowTrendItem[];
  loading?: boolean;
}
