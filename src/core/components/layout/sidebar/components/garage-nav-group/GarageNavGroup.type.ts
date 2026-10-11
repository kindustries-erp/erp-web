import type { PageKey } from "@/shared/types";

export interface GarageNavGroupProps {
  collapsed?: boolean;
  currentPage: PageKey | string;
  navTo: (page: PageKey) => void;
  canReadGarage: boolean;
}
