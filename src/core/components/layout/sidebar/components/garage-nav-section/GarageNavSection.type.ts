import type { PageKey } from "@/shared/types";

export interface GarageNavSectionProps {
  collapsed: boolean;
  currentPage: string;
  navTo: (page: PageKey) => void;
}
