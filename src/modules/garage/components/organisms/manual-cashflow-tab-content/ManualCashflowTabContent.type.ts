export interface ManualCashflowTabContentProps {
  editMode?: boolean;
  activeSettlements?: any[];
  onRemoveSettlement?: (id: string) => void;
  settlementType: "RECEIPT" | "PAYMENT";
  baseRemaining: number;
  manualAmount: number | string;
  manualCategory: string;
  manualDate: string;
  manualPartner: string;
  manualNote: string;
  onSetManualAmount: (val: number | string) => void;
  onSetManualCategory: (val: string) => void;
  onSetManualDate: (val: string) => void;
  onSetManualPartner: (val: string) => void;
  onSetManualNote: (val: string) => void;
  onAddManualSettlement?: () => void;
  manualDraftPending?: boolean;
}

export interface ManualCashflowFormProps {
  editMode?: boolean;
  settlementType: "RECEIPT" | "PAYMENT";
  baseRemaining: number;
  manualAmount: number | string;
  manualDate: string;
  manualPartner: string;
  manualNote: string;
  onSetManualAmount: (val: number | string) => void;
  onSetManualDate: (val: string) => void;
  onSetManualPartner: (val: string) => void;
  onSetManualNote: (val: string) => void;
  onAddManualSettlement?: () => void;
  manualDraftPending?: boolean;
}

export interface ManualCashflowTableProps {
  tableId: string;
  items: any[];
  columns: any[];
  summaryRow?: Record<string, any>;
  rowHoverActions?: (row: any) => any[];
  emptyLabel: string;
}
