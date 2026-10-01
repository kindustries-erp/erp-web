import type {
  GarageTimeHorizonsOverview,
  GarageForecastHorizonsOverview,
  GarageTimeHorizonKey,
} from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface GarageDebtsHorizonGridProps {
  timeHorizons?: GarageTimeHorizonsOverview;
  forecastHorizons?: GarageForecastHorizonsOverview;
  onSelectHorizon: (horizon: GarageTimeHorizonKey) => void;
}
