import type { TabItem } from "@/shared/components/PageLayout";
import type { KgaraCaseServiceRow } from "../../api/garageApi";

export type { KgaraCaseServiceRow };

export interface GarageCaseServicesSectionProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}
