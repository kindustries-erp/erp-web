import { useState, useCallback } from "react";
import {
  getPaymentVouchersPagedApi,
  getVoucherAttachmentsApi,
  type CounterpartySource,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type VoucherStatus,
} from "@/modules/finance/api/financeApi";
import { parseAmountFilter } from "@/modules/finance/utils/financeHelpers";

interface LoadVouchersParams {
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  channelFilter: string; // cash_fund_id or company_bank_account_id
  channelParam: "cash_fund_id" | "company_bank_account_id";
  voucherChannel: "CASH" | "BANK";
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  counterpartySourceFilter?: CounterpartySource | "";
  employeeIdFilter?: string;
}

/**
 * useVoucherList — tải và quản lý danh sách chứng từ có phân trang, lọc, sắp xếp.
 * Dùng chung cho TienMat (CASH) và TienGui (BANK).
 */
export function useVoucherList() {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortCol, setSortCol] = useState("-document_date");

  function handlePageSize(ps: number) {
    setPageSize(ps);
    setPage(1);
  }

  function handleSort(col: string) {
    setSortCol((prev) => (prev === `-${col}` ? col : `-${col}`));
    setPage(1);
  }

  const loadVouchers = useCallback(async function loadVouchers(
    params: LoadVouchersParams,
  ) {
    const {
      page: pg,
      pageSize: ps,
      search: q,
      statusFilter: st,
      channelFilter,
      channelParam,
      voucherChannel,
      sortCol: sc,
      dateFrom: from,
      dateTo: to,
      amountMin,
      amountMax,
      counterpartySourceFilter,
      employeeIdFilter,
    } = params;

    setLoading(true);
    setFetchError(null);

    const isNumeric = /^[0-9.,\s]+$/.test(q);
    const exactAmount = isNumeric ? parseAmountFilter(q) : undefined;
    const amountMinValue = amountMin ? parseAmountFilter(amountMin) : undefined;
    const amountMaxValue = amountMax ? parseAmountFilter(amountMax) : undefined;
    const searchString = isNumeric ? undefined : q;
    const needsClientFilter = !!channelFilter;

    try {
      const res = await getPaymentVouchersPagedApi({
        page: needsClientFilter ? 1 : pg,
        pageSize: needsClientFilter ? 500 : ps,
        sort: [sc],
        search: searchString || undefined,
        amount: exactAmount,
        amount_min: amountMinValue,
        amount_max: amountMaxValue,
        voucher_channel: voucherChannel,
        status: st || undefined,
        ...(from ? { posting_date_from: from } : {}),
        ...(to ? { posting_date_to: to } : {}),
        ...(counterpartySourceFilter
          ? { counterparty_source: counterpartySourceFilter }
          : {}),
        ...(employeeIdFilter ? { employee_id: employeeIdFilter } : {}),
      });

      if (needsClientFilter) {
        const filtered = res.items.filter(
          (v) =>
            (v as unknown as Record<string, unknown>)[channelParam] ===
            channelFilter,
        );
        const start = (pg - 1) * ps;
        const pageItems = filtered.slice(start, start + ps);
        setVouchers(pageItems);
        setTotal(filtered.length);
        setTotalPages(Math.max(Math.ceil(filtered.length / ps), 1));
        return pageItems;
      } else {
        setVouchers(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        return res.items;
      }
    } catch {
      const msg =
        voucherChannel === "BANK"
          ? "Không thể tải danh sách lệnh UNT/UNC."
          : "Không thể tải danh sách phiếu thu chi.";
      setFetchError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vouchers,
    setVouchers,
    loading,
    fetchError,
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    sortCol,
    handlePageSize,
    handleSort,
    loadVouchers,
  };
}

/**
 * useVoucherAttachments — load và cache đính kèm cho từng chứng từ trong bảng.
 */
export function useVoucherAttachments() {
  const [voucherAttachments, setVoucherAttachments] = useState<
    Record<string, PaymentVoucherAttachment[]>
  >({});

  const loadVoucherAttachments = useCallback(
    async function loadVoucherAttachments(items: PaymentVoucher[]) {
      if (!items.length) {
        setVoucherAttachments({});
        return;
      }
      const pairs = await Promise.all(
        items.map((v) =>
          getVoucherAttachmentsApi(v.id)
            .then((attachments) => [v.id, attachments] as const)
            .catch(() => [v.id, []] as const),
        ),
      );
      setVoucherAttachments(Object.fromEntries(pairs));
    },
    [],
  );

  return { voucherAttachments, loadVoucherAttachments };
}
