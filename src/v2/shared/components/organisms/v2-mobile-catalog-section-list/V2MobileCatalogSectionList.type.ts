import type {
  V2SidebarSectionData,
  V2SidebarNavItem,
} from "@/v2/shared/components";

export interface V2MobileCatalogSectionListProps {
  sections: V2SidebarSectionData[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCustomizing: boolean;
  selectedIds: string[];
  activeNavId: string;
  onItemClick: (item: V2SidebarNavItem) => void;
}
