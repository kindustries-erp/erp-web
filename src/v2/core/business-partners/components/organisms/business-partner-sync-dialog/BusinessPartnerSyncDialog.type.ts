export interface BusinessPartnerSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hàm dịch dùng chung của module, nhận khóa và chuỗi dự phòng */
  t: (key: string, fallback?: string) => string;
}
