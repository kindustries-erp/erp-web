import type { PageKey } from "@/shared/types";

export interface AccountingNavSectionProps {
  collapsed: boolean;
  currentPage: string;
  navTo: (page: PageKey) => void;
}
