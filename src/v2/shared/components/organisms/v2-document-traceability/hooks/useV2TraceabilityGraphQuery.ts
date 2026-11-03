import { useQuery } from "@tanstack/react-query";
import type { TraceabilityGraphData } from "../types/traceability.type";

interface UseV2TraceabilityGraphQueryOptions {
  rootId: string;
  fetchGraph?: (id: string) => Promise<TraceabilityGraphData>;
  /** false khi đồ thị do cha truyền vào (controlled), khi đó không tải */
  enabled: boolean;
}

/** Tải đồ thị chứng từ của một gốc; cache theo `rootId` nên mount lại không gọi lại ngay */
export function useV2TraceabilityGraphQuery({
  rootId,
  fetchGraph,
  enabled,
}: UseV2TraceabilityGraphQueryOptions) {
  return useQuery<TraceabilityGraphData>({
    queryKey: ["v2-traceability-graph", rootId],
    queryFn: () => fetchGraph!(rootId),
    enabled: enabled && Boolean(rootId && fetchGraph),
    staleTime: 30_000,
  });
}
