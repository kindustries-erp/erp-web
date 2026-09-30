export interface GarageCaseSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (caseItem: any) => void;
  existingCaseCodes?: string[];
}
