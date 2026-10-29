import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { BusinessPartnerType } from "../../domain/entities/businessPartner";

export const businessPartnerKeys = {
  all: ["v2-business-partners"] as const,
  list: (partnerType: BusinessPartnerType, query: V2TableQuery) =>
    [...businessPartnerKeys.all, "list", partnerType, query] as const,
  detail: (id: string) => [...businessPartnerKeys.all, "detail", id] as const,
  syncPreview: ["v2-business-partners", "sync-preview"] as const,
  selectOptions: (direction: "IN" | "OUT", search: string) =>
    [...businessPartnerKeys.all, "select-options", direction, search] as const,
};
