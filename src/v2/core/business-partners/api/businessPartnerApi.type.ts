import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  BusinessPartner,
  BusinessPartnerFormValue,
} from "../domain/entities/businessPartner";
import type {
  BusinessPartnerListResultDto,
  ColumnOptionsResultDto,
  NextCodeDto,
  SyncFromInvoicesDto,
} from "./dtos/businessPartner.dto";

/** Hợp đồng API chuẩn của họ đối tác kinh doanh (dùng trong core và cho thin modules) */
export interface BusinessPartnerApi {
  list: (query: V2TableQuery) => Promise<BusinessPartnerListResultDto>;
  options: (params: V2FetchOptionsParams) => Promise<ColumnOptionsResultDto>;
  get: (id: string) => Promise<BusinessPartner>;
  create: (form: BusinessPartnerFormValue) => Promise<BusinessPartner>;
  update: (
    id: string,
    form: BusinessPartnerFormValue,
  ) => Promise<BusinessPartner>;
  remove: (id: string) => Promise<BusinessPartner>;
  nextCode?: () => Promise<NextCodeDto>;
  syncFromInvoices?: (dryRun: boolean) => Promise<SyncFromInvoicesDto>;
}
