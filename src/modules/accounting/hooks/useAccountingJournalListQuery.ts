import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { accountingApi } from "../api/accountingApi";

export function useAccountingJournalListQuery({
  page,
  pageSize,
  search,
  status,
  date_from,
  date_to,
}: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: [
      "journal-entries",
      { page, pageSize, search, status, date_from, date_to },
    ],
    queryFn: async () => {
      return accountingApi.getJournalEntries({
        page,
        pageSize,
        search,
        status,
        date_from,
        date_to,
      });
    },
    placeholderData: keepPreviousData,
  });
}
