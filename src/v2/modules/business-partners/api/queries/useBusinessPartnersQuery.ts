import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../../domain/entities/businessPartner";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { businessPartnerKeys } from "./businessPartnerKeys";

export function useBusinessPartnersQuery(
  partnerType: BusinessPartnerType,
  query: V2TableQuery,
  onError?: (error: unknown) => void,
): V2ModuleListData<BusinessPartner> {
  const result = useQuery({
    queryKey: businessPartnerKeys.list(partnerType, query),
    queryFn: () => businessPartnersV2Api.list(partnerType, query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // Lỗi tải danh sách hiện toast như V1 (không có onError ở useQuery v5)
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: (result.data?.items ?? []) as BusinessPartner[],
    total: result.data?.total ?? 0,
    // Ô tổng cột mã = số đối tác khớp bộ lọc (không có cột số để cộng)
    summaries: { code: result.data?.total ?? 0, ...result.data?.summaries },
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
