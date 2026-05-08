import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
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
import { OpeningBalancePanel } from "@/modules/finance/components/OpeningBalancePanel";
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
// Shared UI
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { attachmentFileName } from "@/shared/components/AttachmentComponents";
import {
  IconPlus,
  IconCard,
  IconTrendUp as IconUp,
  IconTrendDown as IconDown,
} from "@/shared/components/icons";

import { VoucherFilterBar } from "@/modules/finance/components/VoucherFilterBar";
import { VoucherKpiRow } from "@/modules/finance/components/VoucherKpiRow";
import { VoucherChartRow } from "@/modules/finance/components/VoucherChartRow";
import { VoucherTable } from "@/modules/finance/components/VoucherTable";
import { CashVoucherDrawer } from "@/modules/finance/components/CashVoucherDrawer";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

export function TienMat() {
  const isDark = useAppStore((s) => s.isDark);
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
  const [counterpartySourceFilter, setCounterpartySourceFilter] = useState<CounterpartySource | "">("");

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
    handleToggleEditMode,
    handleSave,
    handleDelete,
  } = useCashVoucherHandlers({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, cashDashboardParams]);

  // Load opening balance + chart when date range or fund changes
  useEffect(() => {
    loadOpeningBalanceAndChart(dateFrom, dateTo || TODAY, cashDashboardParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, cashDashboardParams]);

  // Load donuts when coaItems ready, fund, or date range changes
  useEffect(() => {
    if (!catalogLoaded) return;

    if (coaItems.length === 0) return;
    loadDonutData(fundFilter, coaItems, cashDashboardParams, dateFrom, dateTo);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoaded, fundFilter, coaItems, cashDashboardParams, dateFrom, dateTo]);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fmtAmount = useCallback((n: number) =>
    n >= 1_000_000_000
      ? `₫ ${(n / 1_000_000_000).toFixed(1)}B`
      : n >= 1_000_000
        ? `₫ ${(n / 1_000_000).toFixed(0)}M`
        : `₫ ${n.toLocaleString("vi-VN")}`, []);

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
          (p as BusinessPartner & { partner_code?: string | null }).partner_code ??
          p.tax_code ??
          "";
        const partnerName = p.name || p.display_name || partnerCode || p.id;
        return {
          value: p.id,
          label: partnerCode ? `${partnerCode} — ${partnerName}` : partnerName,
        };
      }),
    [partners],
  );
  const employeeOpts = useMemo(
    () =>
      employees.map((e) => ({
        value: e.id,
        label: `${e.employee_code ?? ""} — ${e.full_name}`.trim().replace(/^— /, ""),
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={t("tienmat.title")}
        desc={t("tienmat.desc")}
        icon={<Wallet className="h-4 w-4" />}
        actions={
          canCreateVoucher ? (
            <>
              <BtnPrimary onClick={() => openNew("CASH_RECEIPT")}>
                <IconPlus /> {t("tienmat.createReceipt")}
              </BtnPrimary>
              <BtnPrimary onClick={() => openNew("CASH_PAYMENT")}>
                <IconPlus /> {t("tienmat.createPayment")}
              </BtnPrimary>
            </>
          ) : undefined
        }
        className="mb-4"
      />

      {/* Filter bar */}
      <VoucherFilterBar
        period={period}
        dateFrom={dateFrom}
        dateTo={dateTo}
        channelFilter={fundFilter}
        channelOpts={fundOpts}
        channelLabel={t("voucher.filter.fund")}
        channelPlaceholder={t("voucher.filter.fundPlaceholder")}
        hasActiveFilter={hasActiveFilter}
        onPeriodChange={handlePeriodChange}
        onDateFrom={handleDateFrom}
        onDateTo={handleDateTo}
        onChannelChange={handleFundFilter}
        onReset={handleReset}
      />

      {/* KPIs */}
      <VoucherKpiRow
        openingLoading={openingLoading}
        summaryLoading={summaryLoading}
        openingBal={openingBal}
        closingBal={closingBal}
        receiptTotal={summary?.receipt ?? null}
        paymentTotal={summary?.payment ?? null}
        fmtAmount={fmtAmount}
        openingIcon={<IconCard />}
        receiptIcon={<IconUp />}
        paymentIcon={<IconDown />}
        closingIcon={<IconCard />}
        openingLabel={t("tienmat.kpi.fund")}
        receiptLabel={t("tienmat.kpi.income")}
        paymentLabel={t("tienmat.kpi.expense")}
        closingLabel={t("tienmat.kpi.fund")}
      />

      {/* Charts */}
      <VoucherChartRow
        isDark={isDark}
        openingLoading={openingLoading}
        donutLoading={donutLoading}
        chartData={chartData}
        chartLabels={chartLabels}
        chartYMax={chartYMax}
        chartUnit={chartUnit}
        receiptDonutItems={receiptDonutItems}
        paymentDonutItems={paymentDonutItems}
        balanceTrendTitle={t("tienmat.balanceTrend")}
        incomeStructureTitle={t("tienmat.incomeStructure")}
        expenseStructureTitle={t("tienmat.expenseStructure")}
      />

      {/* Voucher table */}
      <VoucherTable
        title={t("tienmat.txList")}
        vouchers={vouchers}
        loading={loading}
        fetchError={fetchError}
        voucherAttachments={voucherAttachments}
        sortCol={sortCol}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        searchInput={searchInput}
        amountMinInput={amountMinInput}
        amountMaxInput={amountMaxInput}
        statusFilter={statusFilter}
        noDataLabel={t("common.noData")}
        channelNameResolver={fundName}
        channelColLabel={t("voucher.table.colFund")}
        onSort={handleSort}
        onPage={setPage}
        onPageSize={handlePageSize}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onSearchInput={handleSearchInput}
        onAmountMin={(v) => handleAmountRangeInput("min", v)}
        onAmountMax={(v) => handleAmountRangeInput("max", v)}
        onStatusFilter={setStatusFilter}
        counterpartySourceFilter={counterpartySourceFilter}
        onCounterpartySourceFilter={(v) => {
          setCounterpartySourceFilter(v);
          setPage(1);
        }}
      />

      <div className="mt-4">
        <OpeningBalancePanel type="CASH" />
      </div>

      {/* Create/Edit Drawer */}
      <CashVoucherDrawer
        open={drawerOpen}
        editing={editing}
        drawerEditMode={drawerEditMode}
        form={form}
        saving={saving}
        saveError={saveError}
        existingAttachments={existingAttachments}
        attachmentFiles={attachmentFiles}
        attachmentType={attachmentType}
        attachmentNote={attachmentNote}
        fundOpts={fundOpts}
        partnerOpts={partnerOpts}
        employeeOpts={employeeOpts}
        coaOpts={coaOpts}
        debitAccountOpts={debitAccountOpts}
        creditAccountOpts={creditAccountOpts}
        canUpdateVoucher={canUpdateVoucher}
        onClose={closeDrawer}
        onSave={handleSave}
        onStatusTransition={(action) => handleStatusTransition(action, reloadAll)}
        onToggleEditMode={handleToggleEditMode}
        onFieldChange={setField}
        onDocumentDateChange={handleDocumentDateChange}
        onPostingDateChange={handlePostingDateChange}
        onAmountChange={handleAmountChange}
        onCashFundChange={handleCashFundChange}
        onPartnerChange={handlePartnerChange}
        onEmployeeChange={handleEmployeeChange}
        onSourceChange={(src) => setField("counterparty_source", src)}
        onDeleteAttachment={(item) =>
          handleDeleteAttachment(
            item,
            () => loadVoucherAttachments(vouchers),
            attachmentFileName,
          )
        }
        onAttachmentFilesChange={setAttachmentFiles}
        onAttachmentTypeChange={setAttachmentType}
        onAttachmentNoteChange={setAttachmentNote}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title={t("voucher.actions.deleteConfirmTitle")}
        message={
          deleteTarget
            ? t("voucher.actions.deleteConfirmDesc").replace(
                "{0}",
                deleteTarget.voucher_no,
              )
            : ""
        }
        confirmLabel={t("voucher.actions.deleteConfirmBtn")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
