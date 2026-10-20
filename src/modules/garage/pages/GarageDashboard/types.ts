import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageDashboardProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}
