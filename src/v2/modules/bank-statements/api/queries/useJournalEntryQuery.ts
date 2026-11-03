import { useQuery } from "@tanstack/react-query";
import { accountingLookupApi } from "../accountingLookupApi";

/** Bút toán đã ghi sổ của giao dịch; chỉ tải khi giao dịch đã có số bút toán */
export function useJournalEntryQuery(
  journalEntryId: string | null | undefined,
) {
  return useQuery({
    queryKey: ["journal-entry", journalEntryId],
    queryFn: () =>
      accountingLookupApi.getJournalEntry(journalEntryId as string),
    enabled: Boolean(journalEntryId),
  });
}
