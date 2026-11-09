import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import type { V2SummaryMetric, V2TableQuery } from "@/v2/shared/types/v2-table";
import type {
  BusinessPartner,
  BusinessPartnerType,
} from "../../domain/entities/businessPartner";
import type { BusinessPartnerApi } from "../businessPartnerApi.type";
import type { BusinessPartnerKeys } from "./businessPartnerKeys";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { businessPartnerKeys } from "./businessPartnerKeys";

export interface UseBusinessPartnersQueryParams {
  api: BusinessPartnerApi;
  keys: BusinessPartnerKeys;
  query: V2TableQuery;
  onError?: (error: unknown) => void;
}

/** Metric của cột "Mã" (đếm dòng): tổng toàn bộ, số dòng trang hiện tại, lũy kế đến hết trang */
const countMetric = (
  data: { total?: number; items?: unknown[] } | undefined,
  query: V2TableQuery,
): V2SummaryMetric => {
  const total = data?.total ?? 0;
  return {
    total,
    pageSubtotal: data?.items?.length ?? 0,
    cumulative: Math.min(query.page * query.pageSize, total),
  };
};

export function useBusinessPartnersQuery(
  params: UseBusinessPartnersQueryParams,
): V2ModuleListData<BusinessPartner>;
export function useBusinessPartnersQuery(
  partnerType: BusinessPartnerType,
  query: V2TableQuery,
  onError?: (error: unknown) => void,
): V2ModuleListData<BusinessPartner>;
export function useBusinessPartnersQuery(
  first: UseBusinessPartnersQueryParams | BusinessPartnerType,
  second?: V2TableQuery,
  third?: (error: unknown) => void,
): V2ModuleListData<BusinessPartner> {
  const isObjectParams = typeof first === "object";
  const api = isObjectParams
    ? first.api
    : {
        list: (q: V2TableQuery) => businessPartnersV2Api.list(first, q),
      };
  const keys = isObjectParams ? first.keys : businessPartnerKeys;
  const query = isObjectParams ? first.query : second!;
  const onError = isObjectParams ? first.onError : third;

  const result = useQuery({
    queryKey: keys.list(query),
    queryFn: () => api.list(query),
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
    summaries: {
      // Cột "Mã" là đếm dòng: total = toàn bộ, subtotal = số dòng trang, lũy kế = dòng đến hết trang
      code: countMetric(result.data, query),
      ...result.data?.summaries,
    },
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
