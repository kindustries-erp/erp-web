import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";

export interface InvoiceViewConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  preset?: TableViewPreset | null;
  currentColumnVisibility?: Record<string, boolean>;
  onSave: (data: {
    key?: string;
    label: string;
    columnVisibility: Record<string, boolean>;
  }) => void;
  onResetDefault?: (key: string) => void;
}
