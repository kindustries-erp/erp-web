import type {
  V2SidebarSectionData,
  V2SidebarNavItem,
} from "@/v2/shared/components";

export interface V2MobileCatalogDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalModulesCount: number;
  filteredSectionsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentTheme?: string;
  onThemeChange?: (theme: any) => void;
  isCustomizing: boolean;
  limitWarning: string | null;
  currentCount: number;
  maxCount: number;
  onStartCustomize: () => void;
  onFinishCustomize: () => void;
  onResetDefault: () => void;
  sections: V2SidebarSectionData[];
  selectedIds: string[];
  activeNavId: string;
  onItemClick: (item: V2SidebarNavItem) => void;
}
