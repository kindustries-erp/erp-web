import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createJournalEntryApi,
  getJournalEntriesApi,
  getJournalEntryAccountsApi,
  getJournalEntryApi,
  getJournalEntryPeriodsApi,
  postJournalEntryApi,
} from "@/modules/accounting/api/journalEntriesApi";
import type {
  AccountingPeriod,
  CreateJournalEntryPayload,
  JournalEntry,
  JournalEntryAccount,
  JournalEntryListParams,
  JournalEntryStatus,
} from "@/modules/accounting/types/journalEntry";

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useJournalEntries() {
  const [items, setItems] = useState<JournalEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JournalEntryStatus | "">("");
  const [periodId, setPeriodId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo<JournalEntryListParams>(
    () => ({
      page,
      pageSize,
      sort: "-date",
      search,
      status,
      period_id: periodId,
      account_id: accountId,
      date_from: dateFrom,
      date_to: dateTo,
      branch_id: branchId,
    }),
    [page, pageSize, search, status, periodId, accountId, dateFrom, dateTo, branchId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getJournalEntriesApi(params);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách bút toán."));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const resetFilters = useCallback(() => {
    setPage(1);
    setSearch("");
    setStatus("");
    setPeriodId("");
    setAccountId("");
    setDateFrom("");
    setDateTo("");
    setBranchId("");
  }, []);

  return {
    items,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    search,
    setSearch,
    status,
    setStatus,
    periodId,
    setPeriodId,
    accountId,
    setAccountId,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    branchId,
    setBranchId,
    loading,
    error,
    load,
    resetFilters,
  };
}

export function useJournalEntryLookups() {
  const [accounts, setAccounts] = useState<JournalEntryAccount[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextAccounts, nextPeriods] = await Promise.all([
        getJournalEntryAccountsApi(),
        getJournalEntryPeriodsApi(),
      ]);
      setAccounts(nextAccounts);
      setPeriods(nextPeriods);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { accounts, periods, loading, reloadLookups: load };
}

export function useJournalEntryActions(onDone: () => void) {
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setError("");
    try {
      setSelected(await getJournalEntryApi(id));
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải chi tiết bút toán."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const create = useCallback(
    async (payload: CreateJournalEntryPayload) => {
      setSaving(true);
      setError("");
      try {
        const created = await createJournalEntryApi(payload);
        await onDone();
        setSelected(await getJournalEntryApi(created.id));
        return created;
      } catch (err) {
        const message = getErrorMessage(err, "Không thể tạo bút toán.");
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [onDone],
  );

  const post = useCallback(
    async (id: string) => {
      setSaving(true);
      setError("");
      try {
        await postJournalEntryApi(id);
        await onDone();
        setSelected(await getJournalEntryApi(id));
      } catch (err) {
        setError(getErrorMessage(err, "Không thể hạch toán bút toán."));
      } finally {
        setSaving(false);
      }
    },
    [onDone],
  );

  return {
    selected,
    setSelected,
    detailLoading,
    saving,
    error,
    setError,
    openDetail,
    create,
    post,
  };
}
