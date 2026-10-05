import type { GarageCasesDateRanges } from "../../../utils/garageCasesTable";
import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";
import type { TabItem } from "@/shared/components/PageLayout";

export interface GarageCasesTableProps {
  branchId?: string;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  onOpenDetail: (code: string) => void;
  onOpenFinancials: (code: string, editMode?: boolean) => void;
  onOpenEditNotes?: (item: any) => void;
  onOpenConfig?: (item: any) => void;
  canSyncGarage?: boolean;
  canUpdateGarage?: boolean;
  branches?: any[];
  onSyncCases?: () => void;
  onExportExcel?: () => void;
  onSyncGrossProfit?: () => void;
  activeStatusTab: string;
  onStatusTabChange: (tab: string) => void;
  dateRanges: GarageCasesDateRanges;
  onDateRangeChange: (key: string, from?: string, to?: string) => void;
  onResetDateRanges: () => void;
  columnViewPresetsHook: {
    presets: TableViewPreset[];
    [key: string]: any;
  };
  activeColumnPresetKey: string;
  onColumnPresetChange: (preset: TableViewPreset) => void;
  onCreateViewPreset: () => void;
  onEditViewPreset: (preset: TableViewPreset) => void;
  onDeleteViewPreset: (key: string) => void;
}

export interface ColumnContext {
  t: (key: string, def: string) => string;
  tableState: any;
  dateRanges: any;
  onDateRangeChange: (key: string, from?: string, to?: string) => void;
  onSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  onSearchChange: (key: string, val: string) => void;
  onFilterChange: (key: string, vals: string[]) => void;
  fetchCaseColumnOptions: any;
  onOpenDetail: (code: string) => void;
  onOpenFinancials: (code: string, editMode?: boolean) => void;
  onOpenConfig?: (item: any) => void;
  canUpdateGarage?: boolean;
  branches?: any[];
}
