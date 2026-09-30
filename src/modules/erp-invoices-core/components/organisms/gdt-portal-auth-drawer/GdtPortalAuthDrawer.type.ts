export interface GdtPortalAuthDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface GdtPortalAuthFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}
