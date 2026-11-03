export interface GarageCaseSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "all" | "cases" | "gross-profit" | "case-details";
  title?: string;
  description?: string;
}
