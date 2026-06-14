import { useState, useEffect, useCallback, useMemo } from "react";
import { useT } from "@/core/i18n";
import {
  getCashFundsApi,
  getPaymentVoucherLookupBusinessPartnersApi,
  getPaymentVoucherLookupEmployeesApi,
  type CounterpartySource,
  type VoucherStatus,
} from "@/modules/finance/api/financeApi";
import {
  getChartOfAccountsApi,
  type ChartOfAccount,
} from "@/modules/accounting/api/catalogApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import type { Employee } from "@/modules/auth/api/auth";
import type { CashFund } from "@/modules/finance/api/financeApi";
import { TODAY } from "@/modules/finance/utils/financeHelpers";
// Hooks
import { usePeriodFilter } from "@/modules/finance/hooks/usePeriodFilter";
import {
  useVoucherList,
  useVoucherAttachments,
} from "@/modules/finance/hooks/useVoucherList";
import { useVoucherDashboard } from "@/modules/finance/hooks/useVoucherDashboard";
import { useVoucherDrawer } from "@/modules/finance/hooks/useVoucherDrawer";
import { useCashVoucherHandlers } from "@/modules/finance/hooks/useCashVoucherHandlers";
import { useSearchFilter } from "@/shared/hooks/useFilterState";
import { useAmountRangeFilter } from "@/shared/hooks/useFilterState";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { CashFundView } from "@/modules/finance/components/CashFund/CashFundView";
import { forwardRef, useImperativeHandle } from "react";

export const TienMat = forwardRef(
  (props: { hideHeader?: boolean } = {}, ref) => {
    const t = useT();
    const canCreateVoucher = useHasPermission("payment_vouchers", "create");
    const canUpdateVoucher = useHasPermission("payment_vouchers", "update");

    // ── Hooks ──────────────────────────────────────────────────────────────────
    const {
      period,
      dateFrom,
      dateTo,
      channelFilter: fundFilter,
      hasActiveFilter,
      handlePeriodChange,
      handleDateFrom,
      handleDateTo,
      handleChannelFilter: handleFundFilter,
      resetPeriod,
    } = usePeriodFilter();

    const {
      summary,
      summaryLoading,
      openingBal,
      openingLoading,
      chartData,
      chartLabels,
      chartYMax,
      chartUnit,
      receiptDonutItems,
      paymentDonutItems,
      donutLoading,
      loadSummary,
      loadOpeningBalanceAndChart,
      loadDonutData,
    } = useVoucherDashboard();

    const {
      vouchers,
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
    } = useVoucherList();

    const { voucherAttachments, loadVoucherAttachments } =
      useVoucherAttachments();

    const {
      drawerOpen,
      editing,
      drawerEditMode,
      setDrawerEditMode,
      saving,
      setSaving,
      saveError,
      setSaveError,
      attachmentFiles,
      setAttachmentFiles,
      attachmentType,
      setAttachmentType,
      attachmentNote,
      setAttachmentNote,
      existingAttachments,
      openDrawerForNew,
      openDrawerForEdit,
      closeDrawer,
      handleDeleteAttachment,
      handleStatusTransition,
    } = useVoucherDrawer();

    const { searchInput, search, handleSearchInput } = useSearchFilter();
    const {
      amountMinInput,
      amountMaxInput,
      amountMin,
      amountMax,
      handleAmountRangeInput,
      resetAmounts,
    } = useAmountRangeFilter();
    const [statusFilter, setStatusFilter] = useState<VoucherStatus | "">("");
    const [counterpartySourceFilter, setCounterpartySourceFilter] = useState<
      CounterpartySource | ""
    >("");

    // Remaining local state
    const [cashFunds, setCashFunds] = useState<CashFund[]>([]);
    const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
    const [partners, setPartners] = useState<BusinessPartner[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [catalogLoaded, setCatalogLoaded] = useState(false);
    const cashDashboardParams = useMemo(
      () => ({
        voucherChannel: "CASH" as const,
        channelParam: "cash_fund_id" as const,
        channelFilter: fundFilter,
        receiptType: "CASH_RECEIPT" as const,
        paymentType: "CASH_PAYMENT" as const,
      }),
      [fundFilter],
    );

    const handlers = useCashVoucherHandlers({
      cashFunds,
      partners,
      employees,
      vouchers,
      page,
      pageSize,
      search,
      statusFilter,
      fundFilter,
      sortCol,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      attachmentFiles,
      attachmentType,
      attachmentNote,
      editing,
      drawerEditMode,
      setDrawerEditMode,
      setSaving,
      setSaveError,
      setAttachmentFiles,
      setAttachmentNote,
      openDrawerForNew,
      openDrawerForEdit,
      closeDrawer,
      resetPeriod,
      resetAmounts,
      setPage,
      loadVouchers,
      loadVoucherAttachments,
      loadSummary,
      loadOpeningBalanceAndChart,
    });

    const {
      form,
      deleteTarget,
      deleting,
      setDeleteTarget,
      reloadAll,
      handleReset,
      openNew,
      openEdit,
      setField,
      handleDocumentDateChange,
      handlePostingDateChange,
      handleAmountChange,
      handleCashFundChange,
      handlePartnerChange,
      handleEmployeeChange,
      handleTagPresetSelect,
      tagPresets,
      handleToggleEditMode,
      handleSave,
      handleSaveRelatedDocuments,
      handleDelete,
    } = handlers;

    useImperativeHandle(ref, () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openNew: (type: string) => openNew(type as any),
    }));

    // Load dropdown data once
    useEffect(() => {
      Promise.all([
        getCashFundsApi(),
        getChartOfAccountsApi(),
        getPaymentVoucherLookupBusinessPartnersApi(),
        getPaymentVoucherLookupEmployeesApi(),
      ])
        .then(([funds, coa, bps, emps]) => {
          setCashFunds(funds ?? []);
          setCoaItems(coa ?? []);
          setPartners(bps ?? []);
          setEmployees(emps ?? []);
        })
        .catch(() => {})
        .finally(() => setCatalogLoaded(true));
    }, []);

    // Load KPI summary when date range or fund changes
    useEffect(() => {
      loadSummary(dateFrom, dateTo, cashDashboardParams);
    }, [dateFrom, dateTo, cashDashboardParams]);

    // Load opening balance + chart when date range or fund changes
    useEffect(() => {
      loadOpeningBalanceAndChart(
        dateFrom,
        dateTo || TODAY,
        cashDashboardParams,
      );
    }, [dateFrom, dateTo, cashDashboardParams]);

    // Load donuts when coaItems ready, fund, or date range changes
    useEffect(() => {
      if (!catalogLoaded) return;

      if (coaItems.length === 0) return;
      loadDonutData(
        fundFilter,
        coaItems,
        cashDashboardParams,
        dateFrom,
        dateTo,
      );
    }, [
      catalogLoaded,
      fundFilter,
      coaItems,
      cashDashboardParams,
      dateFrom,
      dateTo,
    ]);

    // Load vouchers when any filter/page/sort changes
    useEffect(() => {
      const p = {
        page,
        pageSize,
        search,
        statusFilter,
        channelFilter: fundFilter,
        channelParam: "cash_fund_id" as const,
        voucherChannel: "CASH" as const,
        sortCol,
        dateFrom,
        dateTo,
        amountMin,
        amountMax,
        counterpartySourceFilter,
      };
      loadVouchers(p).then((items) => {
        if (items) loadVoucherAttachments(items);
      });
    }, [
      page,
      pageSize,
      search,
      statusFilter,
      fundFilter,
      sortCol,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      counterpartySourceFilter,
    ]);

    // ── Derived values ────────────────────────────────────────────────────────

    const fmtAmount = useCallback(
      (n: number) =>
        n >= 1_000_000_000
          ? `₫ ${(n / 1_000_000_000).toFixed(1)}B`
          : n >= 1_000_000
            ? `₫ ${(n / 1_000_000).toFixed(0)}M`
            : `₫ ${n.toLocaleString("vi-VN")}`,
      [],
    );

    const closingBal = useMemo(
      () =>
        openingBal !== null && summary !== null
          ? openingBal + summary.receipt - summary.payment
          : null,
      [openingBal, summary],
    );

    const coaOpts = useMemo(
      () =>
        coaItems.map((c) => ({
          value: c.id,
          label: `${c.account_code} — ${c.account_name}`,
        })),
      [coaItems],
    );
    const cashAccountOpts = useMemo(
      () =>
        coaItems
          .filter((c) => c.account_code.startsWith("111"))
          .map((c) => ({
            value: c.id,
            label: `${c.account_code} — ${c.account_name}`,
          })),
      [coaItems],
    );
    const debitAccountOpts = useMemo(
      () => (form.voucher_type === "CASH_RECEIPT" ? cashAccountOpts : coaOpts),
      [cashAccountOpts, coaOpts, form.voucher_type],
    );
    const creditAccountOpts = useMemo(
      () => (form.voucher_type === "CASH_PAYMENT" ? cashAccountOpts : coaOpts),
      [cashAccountOpts, coaOpts, form.voucher_type],
    );
    const partnerOpts = useMemo(
      () =>
        partners.map((p) => {
          const partnerCode =
            p.code ??
            (p as BusinessPartner & { partner_code?: string | null })
              .partner_code ??
            p.tax_code ??
            "";
          const partnerName = p.name || p.display_name || partnerCode || p.id;
          return {
            value: p.id,
            label: `${partnerCode ? `${partnerCode} — ` : ""}${partnerName}${p.tax_code ? ` — MST: ${p.tax_code}` : ""}`,
          };
        }),
      [partners],
    );
    const employeeOpts = useMemo(
      () =>
        employees.map((e) => ({
          value: e.id,
          label: `${e.employee_code ?? ""} — ${e.full_name}`
            .trim()
            .replace(/^— /, ""),
        })),
      [employees],
    );
    const fundOpts = useMemo(
      () =>
        cashFunds.map((f) => ({
          value: f.id,
          label: `${f.fund_code} — ${f.fund_name}`,
        })),
      [cashFunds],
    );
    const fundName = useCallback(
      (id: string | null) =>
        cashFunds.find((f) => f.id === id)?.fund_name ?? "—",
      [cashFunds],
    );

    return (
      <CashFundView
        {...{
          hideHeader: props.hideHeader,
          t,
          canCreateVoucher,
          canUpdateVoucher,
          openNew,
          period,
          dateFrom,
          dateTo,
          fundFilter,
          fundOpts,
          hasActiveFilter,
          handlePeriodChange,
          handleDateFrom,
          handleDateTo,
          handleFundFilter,
          handleReset,
          openingLoading,
          summaryLoading,
          openingBal,
          closingBal,
          summary,
          fmtAmount,
          chartData,
          chartLabels,
          chartYMax,
          chartUnit,
          receiptDonutItems,
          paymentDonutItems,
          donutLoading,
          vouchers,
          loading,
          fetchError,
          voucherAttachments,
          sortCol,
          page,
          pageSize,
          total,
          totalPages,
          searchInput,
          amountMinInput,
          amountMaxInput,
          statusFilter,
          fundName,
          handleSort,
          setPage,
          handlePageSize,
          openEdit,
          setDeleteTarget,
          handleSearchInput,
          handleAmountRangeInput,
          setStatusFilter,
          counterpartySourceFilter,
          setCounterpartySourceFilter,
          drawerOpen,
          editing,
          drawerEditMode,
          form,
          saving,
          saveError,
          existingAttachments,
          attachmentFiles,
          attachmentType,
          attachmentNote,
          fundOptsDrawer: fundOpts,
          cashFunds,
          fundAccountLabel: (() => {
            const fund = cashFunds.find((f) => f.id === form.cash_fund_id);
            if (!fund) return "";
            const acct = coaItems.find(
              (c) => c.id === fund.accounting_account_id,
            );
            return acct ? `${acct.account_code} — ${acct.account_name}` : "";
          })(),
          partnerOpts,
          employeeOpts,
          coaOpts,
          debitAccountOpts,
          creditAccountOpts,
          tagPresets,
          handleTagPresetSelect,
          closeDrawer,
          handleSave,
          handleSaveRelatedDocuments,
          handleStatusTransition,
          reloadAll,
          handleToggleEditMode,
          setField,
          handleDocumentDateChange,
          handlePostingDateChange,
          handleAmountChange,
          handleCashFundChange,
          handlePartnerChange,
          handleEmployeeChange,
          handleDeleteAttachment,
          loadVoucherAttachments,
          setAttachmentFiles,
          setAttachmentType,
          setAttachmentNote,
          deleteTarget,
          deleting,
          handleDelete,
          coaItems,
        }}
      />
    );
  },
);
