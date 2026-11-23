import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";
import type { BusinessPartnerModuleConfig } from "../businessPartners.config.type";

export interface BusinessPartnerDrawerProps {
  open: boolean;
  mode: "view" | "edit";
  partnerId?: string | null;
  recordId?: string | null;
  partnerType?: BusinessPartnerType;
  canUpdate: boolean;
  onClose: () => void;
  /** Gọi khi tạo mới xong (thay cho đóng), để component mở drawer nhận đối tác vừa tạo */
  onCreated?: (partner: BusinessPartner) => void;
  config?: BusinessPartnerModuleConfig;
}
