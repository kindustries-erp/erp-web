import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  DebtNetOffAllocateRequestDto,
  DebtNetOffAllocateResultDto,
  PartnerInvoiceDto,
} from "./dtos/debtNetOff.dto";
import type { NetOffPartnerType } from "../domain/rules/debtNetOffRules";

const BASE = "/api/v1/erp-invoices/debts";

export const debtNetOffV2Api = {
  listPartnerInvoices: async (
    taxCode: string,
    partnerType: NetOffPartnerType,
  ): Promise<PartnerInvoiceDto[]> => {
    const { data } = await v2HttpClient.get<PartnerInvoiceDto[]>(
      `${BASE}/${encodeURIComponent(taxCode)}/invoices`,
      { params: { partner_type: partnerType } },
    );
    return data;
  },
  allocate: async (
    taxCode: string,
    body: DebtNetOffAllocateRequestDto,
  ): Promise<DebtNetOffAllocateResultDto> => {
    const { data } = await v2HttpClient.post<DebtNetOffAllocateResultDto>(
      `${BASE}/${encodeURIComponent(taxCode)}/net-off`,
      body,
    );
    return data;
  },
};
