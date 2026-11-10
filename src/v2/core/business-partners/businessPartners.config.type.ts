import type { BusinessPartnerApi } from "./api/businessPartnerApi.type";
import type { BusinessPartnerKeys } from "./api/queries/businessPartnerKeys";
import type {
  BusinessPartnerFormValue,
  BusinessPartnerType,
} from "./domain/entities/businessPartner";

/** Cấu hình để module mỏng ghép core business-partners: API, khóa cache, bảng, quyền và loại đối tác */
export interface BusinessPartnerModuleConfig {
  api: BusinessPartnerApi;
  keys: BusinessPartnerKeys;
  /** Id bảng để lưu tùy biến cột của người dùng (vd: business-partners-customers-table) */
  tableId: string;
  /** Loại đối tác kinh doanh (CUSTOMER hoặc VENDOR) */
  partnerType: BusinessPartnerType;
  /** Tên collection phân quyền RBAC (mặc định: business_partners) */
  permissionCollection: string;
  /** Các trường bắt buộc */
  requiredFields: readonly (keyof BusinessPartnerFormValue)[];
  /** Cột hiển thị theo từng chế độ xem hệ thống */
  viewVisibility: Record<string, Record<string, boolean>>;
}
