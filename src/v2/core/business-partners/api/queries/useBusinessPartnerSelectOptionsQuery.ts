import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PartnerSelectionDirection } from "../../domain/rules/partnerSelection";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { businessPartnerKeys } from "./businessPartnerKeys";

/** Danh sách chọn đối tượng cho ô chọn sao kê, tìm kiếm trên server */
export function useBusinessPartnerSelectOptionsQuery(
  direction: PartnerSelectionDirection,
  search: string,
  enabled = true,
) {
  return useQuery({
    queryKey: businessPartnerKeys.selectOptions(direction, search),
    queryFn: () =>
      businessPartnersV2Api.listSelectOptions(direction, search, 1),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled,
  });
}
