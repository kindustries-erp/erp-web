import type { PageKey } from "@/shared/types";

export interface ToolsNavSectionProps {
  collapsed: boolean;
  currentPage: string;
  navTo: (page: PageKey) => void;
}
