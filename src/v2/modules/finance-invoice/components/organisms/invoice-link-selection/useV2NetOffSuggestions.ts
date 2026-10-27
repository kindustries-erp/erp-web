import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { netOffSuggestionApi } from "@/v2/modules/finance-invoice/api/linkSources/netOffSuggestionApi";
import type { NetOffSuggestionDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

/** Gợi ý cấn trừ của một hóa đơn: danh sách và mức khớp theo id giao dịch */
export function useV2NetOffSuggestions(open: boolean, invoiceId?: string) {
  const query = useQuery({
    queryKey: [
      "finance-invoices",
      "link-sources",
      "net-off-suggestions",
      invoiceId,
    ],
    queryFn: () => netOffSuggestionApi.list(invoiceId as string),
    enabled: open && Boolean(invoiceId),
    staleTime: 30_000,
  });

  const badges = useMemo(() => {
    const map = new Map<string, NetOffSuggestionDto["score"]["badge"]>();
    for (const item of query.data ?? []) map.set(item.txn.id, item.score.badge);
    return map;
  }, [query.data]);

  return {
    items: query.data ?? [],
    isPending: query.isPending,
    badgeOf: (id: string) => badges.get(id),
  };
}
