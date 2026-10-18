export interface InvoiceImportSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  onImported: (dir: "IN" | "OUT") => void;
  initialDirection: "IN" | "OUT";
}
