import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { GarageGoodsReceipt } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { garageGoodsReceiptsV2Api } from "@/v2/modules/garage-goods-receipts/api/garageGoodsReceiptsApi";
import { garageGoodsReceiptsKeys } from "./garageGoodsReceiptsKeys";

export function useGarageGoodsReceiptsQuery(
  query: V2TableQuery,
  onError?: (error: unknown) => void,
): V2ModuleListData<GarageGoodsReceipt> {
  const result = useQuery({
    queryKey: garageGoodsReceiptsKeys.list(query),
    queryFn: () => garageGoodsReceiptsV2Api.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // Lỗi tải danh sách hiện toast (useQuery v5 không còn onError)
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: (result.data?.items ?? []) as GarageGoodsReceipt[],
    total: result.data?.total ?? 0,
    summaries: result.data?.summaries,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
