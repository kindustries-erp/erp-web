import type {
  GarageConversionFunnel,
  GarageProjectedPipeline,
  GarageStatusDistributionItem,
  GarageClassificationDistributionItem,
} from "../../api/garageDashboardApi";

export interface GarageConversionFunnelCardProps {
  funnel?: GarageConversionFunnel;
  byMonth?: Record<string, GarageConversionFunnel>;
  availableMonths?: string[];
  projectedToday?: GarageProjectedPipeline;
  projectedMonth?: GarageProjectedPipeline;
  statusDistribution?: GarageStatusDistributionItem[];
  statusDistributionByMonth?: Record<string, GarageStatusDistributionItem[]>;
  classificationDistribution?: GarageClassificationDistributionItem[];
  classificationDistributionByMonth?: Record<
    string,
    GarageClassificationDistributionItem[]
  >;
  loading?: boolean;
}

export interface ClassificationTableRow {
  id: string;
  key: string;
  name: string;
  dot: string;
  icon: React.ComponentType<{ className?: string }>;
  totalCount: number;
  totalAmount: number;
  inProgressCount: number;
  inProgressAmount: number;
  completedCount: number;
  completedAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  completionRate: number;
  cancellationRate: number;
}
