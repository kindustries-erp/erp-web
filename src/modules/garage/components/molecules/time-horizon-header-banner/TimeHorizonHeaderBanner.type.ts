export type TimeHorizonSubTab = "cases" | "top_partners" | "analytics";

export interface TimeHorizonHeaderBannerProps {
  activeSubTab: TimeHorizonSubTab;
  onSubTabChange: (tab: TimeHorizonSubTab) => void;
  direction?: "ALL" | "IN" | "OUT";
  onDirectionChange?: (dir: "ALL" | "IN" | "OUT") => void;
  totalCases?: number;
  topPartnersCount?: number;
  activeFilterCount?: number;
  onResetFilters?: () => void;
}
