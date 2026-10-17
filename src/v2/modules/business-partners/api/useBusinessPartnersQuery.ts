import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";
import { businessPartnersV2Api } from "./businessPartnersApi";

export const businessPartnerKeys = {
  all: ["v2-business-partners"] as const,
  list: (partnerType: BusinessPartnerType, query: V2TableQuery) =>
    [...businessPartnerKeys.all, "list", partnerType, query] as const,
  detail: (id: string) => [...businessPartnerKeys.all, "detail", id] as const,
};

export function useBusinessPartnersQuery(
  partnerType: BusinessPartnerType,
  query: V2TableQuery,
): V2ModuleListData<BusinessPartner> {
  const result = useQuery({
    queryKey: businessPartnerKeys.list(partnerType, query),
    queryFn: () => businessPartnersV2Api.list(partnerType, query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  return {
    items: (result.data?.items ?? []) as BusinessPartner[],
    total: result.data?.total ?? 0,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
