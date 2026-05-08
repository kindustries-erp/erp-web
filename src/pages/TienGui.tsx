import { useCallback, useEffect, useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { PageHeader } from "@/shared/components/PageHeader";
import { DatePicker } from "@/shared/components/DatePicker";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { cn } from "@/shared/utils";
import {
  submitPaymentVoucherApi,
  approvePaymentVoucherApi,
  rejectPaymentVoucherApi,
  postPaymentVoucherApi,
  cancelPaymentVoucherApi,
  getPaymentVoucherLookupBusinessPartnersApi,
  getPaymentVoucherLookupEmployeesApi,
  type VoucherStatus,
  type AttachmentType,
} from "@/modules/finance/api/financeApi";
import {
  getChartOfAccountsApi,
  getCompanyBankAccountsApi,
  type ChartOfAccount,
  type CompanyBankAccount,
} from "@/modules/accounting/api/catalogApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import type { Employee } from "@/modules/auth/api/auth";
import { OpeningBalancePanel } from "@/modules/finance/components/OpeningBalancePanel";
import { TODAY } from "@/modules/finance/utils/financeHelpers";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import {
  AttachmentRow,
  attachmentFileName,
} from "@/shared/components/AttachmentComponents";
import {
  IconBank,
  IconFileWarn,
  IconPlus,
  IconTrendDown as IconDown,
  IconTrendUp as IconUp,
} from "@/shared/components/icons";
import {
  ATTACHMENT_TYPE_OPTS,
  COUNTERPARTY_ROLE_OPTS,
  COUNTERPARTY_SOURCE_OPTS,
} from "@/modules/finance/types/voucherForm";
import type { CounterpartySource } from "@/modules/finance/api/financeApi";
import { VoucherFilterBar } from "@/modules/finance/components/VoucherFilterBar";
import { VoucherChartRow } from "@/modules/finance/components/VoucherChartRow";
import { VoucherTable } from "@/modules/finance/components/VoucherTable";
import { usePeriodFilter } from "@/modules/finance/hooks/usePeriodFilter";
import { useVoucherDashboard } from "@/modules/finance/hooks/useVoucherDashboard";
import {
  useVoucherAttachments,
  useVoucherList,
} from "@/modules/finance/hooks/useVoucherList";
import {
  useAmountRangeFilter,
  useSearchFilter,
} from "@/shared/hooks/useFilterState";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { useBankVoucherHandlers } from "@/modules/finance/hooks/useBankVoucherHandlers";
import { ApprovalHistory } from "@/modules/finance/components/ApprovalHistory";

// ── Main component ─────────────────────────────────────────────────────────────

export function TienGui() {
  const isDark = useAppStore((s) => s.isDark);
  const t = useT();
  const canCreateVoucher = useHasPermission("payment_vouchers", "create");
  const canUpdateVoucher = useHasPermission("payment_vouchers", "update");

  // Dropdown data
  const [companyBankAccounts, setCompanyBankAccounts] = useState<CompanyBankAccount[]>([]);
  const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  const {
    period,
    dateFrom,
    dateTo,
    channelFilter: bankFilter,
    hasActiveFilter: hasActivePeriodFilter,
    handlePeriodChange: handlePeriodFilterChange,
    handleDateFrom: handlePeriodDateFrom,
    handleDateTo: handlePeriodDateTo,
    handleChannelFilter: handleBankFilterChange,
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

  const bankDashboardParams = useMemo(
    () => ({
      voucherChannel: "BANK" as const,
      channelParam: "company_bank_account_id" as const,
      channelFilter: bankFilter,
      receiptType: "BANK_RECEIPT" as const,
      paymentType: "BANK_PAYMENT" as const,
    }),
    [bankFilter],
  );

  // Load dropdown data once
  useEffect(() => {
    Promise.all([
      getCompanyBankAccountsApi(),
      getChartOfAccountsApi(),
      getPaymentVoucherLookupBusinessPartnersApi(),
      getPaymentVoucherLookupEmployeesApi(),
    ])
      .then(([banks, coa, bps, emps]) => {
        setCompanyBankAccounts(banks ?? []);
        setCoaItems(coa ?? []);
        setPartners(bps ?? []);
        setEmployees(emps ?? []);
      })
      .catch(() => {})
      .finally(() => setCatalogLoaded(true));
  }, []);

  const reloadDonutData = useCallback(() => {
    loadDonutData(bankFilter, coaItems, bankDashboardParams, dateFrom, dateTo);
  }, [bankDashboardParams, bankFilter, coaItems, dateFrom, dateTo, loadDonutData]);

  const {
    drawerOpen,
    editing,
    drawerEditMode,
    form,
    saving,
    saveError,
    attachmentFiles,
    attachmentType,
    attachmentNote,
    existingAttachments,
    deleteTarget,
    deleting,
    partnerBankAccounts,
    partnerBankLoading,
    setSaving,
    setSaveError,
    reloadCurrentData,
    closeDrawer,
    openNew,
    openEdit,
    setField,
    setAttachmentFiles,
    setAttachmentType,
    setAttachmentNote,
    setDeleteTarget,
    handleDocumentDateChange,
    handlePostingDateChange,
    handleAmountChange,
    handleCompanyBankChange,
    handlePartnerChange,
    handleEmployeeChange,
    handleToggleEditMode,
    handleDeleteAttachment,
    handleSave,
    handleDelete,
  } = useBankVoucherHandlers({
    companyBankAccounts,
    partners,
    employees,
    vouchers,
    page,
    pageSize,
    search,
    statusFilter,
    bankFilter,
    sortCol,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    coaItemsLength: coaItems.length,
    attachmentFileName,
    setPage,
    loadVouchers,
    loadVoucherAttachments,
    loadSummary,
    loadOpeningBalanceAndChart,
    reloadDonutData,
  });

  async function handleStatusTransition(
    action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL",
    onSuccess: () => void,
  ) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (action === "SUBMIT") await submitPaymentVoucherApi(editing.id);
      else if (action === "APPROVE") await approvePaymentVoucherApi(editing.id);
      else if (action === "REJECT") await rejectPaymentVoucherApi(editing.id);
      else if (action === "POST") await postPaymentVoucherApi(editing.id);
      else if (action === "CANCEL") await cancelPaymentVoucherApi(editing.id);
      closeDrawer();
      onSuccess();
    } catch (e) {
      const reason = (e as Error)?.message ?? "Lỗi không xác định";
      setSaveError(reason);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSummary(dateFrom, dateTo, bankDashboardParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, bankDashboardParams]);

  useEffect(() => {
    loadOpeningBalanceAndChart(dateFrom, dateTo || TODAY, bankDashboardParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, bankDashboardParams]);

  useEffect(() => {
    if (!catalogLoaded) return;
    loadDonutData(bankFilter, coaItems, bankDashboardParams, dateFrom, dateTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoaded, bankFilter, coaItems, bankDashboardParams, dateFrom, dateTo]);

  useEffect(() => {
    loadVouchers({
      page,
      pageSize,
      search,
      statusFilter,
      channelFilter: bankFilter,
      channelParam: "company_bank_account_id",
      voucherChannel: "BANK",
      sortCol,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      counterpartySourceFilter,
    }).then((items) => {
      if (items) loadVoucherAttachments(items);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    bankFilter,
    sortCol,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    counterpartySourceFilter,
  ]);

  const handlePeriodChange = useCallback(
    (value: string) => {
      handlePeriodFilterChange(value);
      setPage(1);
    },
    [handlePeriodFilterChange, setPage],
  );
  const handleDateFrom = useCallback(
    (value: string) => {
      handlePeriodDateFrom(value);
      setPage(1);
    },
    [handlePeriodDateFrom, setPage],
  );
  const handleDateTo = useCallback(
    (value: string) => {
      handlePeriodDateTo(value);
      setPage(1);
    },
    [handlePeriodDateTo, setPage],
  );
  const handleBankFilter = useCallback(
    (value: string) => {
      handleBankFilterChange(value);
      setPage(1);
    },
    [handleBankFilterChange, setPage],
  );
  const handleReset = useCallback(() => {
    resetPeriod();
    resetAmounts();
    setPage(1);
  }, [resetAmounts, resetPeriod, setPage]);
  const handleStatusFilter = useCallback(
    (value: string) => {
      setStatusFilter(value as VoucherStatus | "");
      setPage(1);
    },
    [setPage],
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const hasActiveFilter = hasActivePeriodFilter || !!amountMin || !!amountMax;
  const fmtAmount = useCallback((n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `₫ ${(n / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `₫ ${(n / 1_000_000).toFixed(0)}M`;
    return `₫ ${n.toLocaleString("vi-VN")}`;
  }, []);

  const isDirty = !!form.voucher_no.trim() || !!form.amount;
  const coaOpts = useMemo(
    () =>
      coaItems.map((c) => ({
        value: c.id,
        label: `${c.account_code} — ${c.account_name}`,
      })),
    [coaItems],
  );
  const bankAccountOpts = useMemo(
    () =>
      coaItems
        .filter((c) => c.account_code.startsWith("112"))
        .map((c) => ({
          value: c.id,
          label: `${c.account_code} — ${c.account_name}`,
        })),
    [coaItems],
  );
  const debitAccountOpts = useMemo(
    () => (form.voucher_type === "BANK_RECEIPT" ? bankAccountOpts : coaOpts),
    [bankAccountOpts, coaOpts, form.voucher_type],
  );
  const creditAccountOpts = useMemo(
    () => (form.voucher_type === "BANK_PAYMENT" ? bankAccountOpts : coaOpts),
    [bankAccountOpts, coaOpts, form.voucher_type],
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
  const companyBankOpts = useMemo(
    () =>
      companyBankAccounts.map((b) => ({
        value: b.id,
        label: `${b.bank_name} — ${b.account_number}`,
      })),
    [companyBankAccounts],
  );
  const bankFilterOpts = useMemo(
    () =>
      companyBankAccounts.map((b) => ({
        value: b.id,
        label: b.bank_name,
      })),
    [companyBankAccounts],
  );
  const partnerBankOpts = useMemo(
    () =>
      partnerBankAccounts.map((b) => ({
        value: b.id,
        label: `${b.bank_name} — ${b.account_number}`,
      })),
    [partnerBankAccounts],
  );
  const viewOnly = !!editing && !drawerEditMode;
  const canEditVoucher = !editing || editing.status === "DRAFT";
  const drawerActions: DrawerAction[] = (() => {
    if (!editing || drawerEditMode) {
      return [
        { label: "Hủy bỏ", onClick: closeDrawer },
        { label: "Lưu nháp", disabled: saving, onClick: () => handleSave("DRAFT") },
        { label: "Gửi duyệt", primary: true, loading: saving, disabled: saving, onClick: () => handleSave("PENDING_APPROVAL") },
      ];
    }
    switch (editing.status) {
      case "DRAFT":
        return [
          { label: "Đóng", onClick: closeDrawer },
          ...(canUpdateVoucher
            ? [
                { label: "Hủy phiếu", disabled: saving, onClick: () => handleStatusTransition("CANCEL", reloadCurrentData) },
                { label: "Gửi duyệt", primary: true, loading: saving, disabled: saving, onClick: () => handleStatusTransition("SUBMIT", reloadCurrentData) },
              ]
            : []),
        ];
      case "PENDING_APPROVAL":
        return [
          { label: "Đóng", onClick: closeDrawer },
          ...(canUpdateVoucher
            ? [
                { label: "Hủy phiếu", disabled: saving, onClick: () => handleStatusTransition("CANCEL", reloadCurrentData) },
                { label: "Từ chối", disabled: saving, onClick: () => handleStatusTransition("REJECT", reloadCurrentData) },
                { label: "Duyệt", primary: true, loading: saving, disabled: saving, onClick: () => handleStatusTransition("APPROVE", reloadCurrentData) },
              ]
            : []),
        ];
      case "APPROVED":
        return [
          { label: "Đóng", onClick: closeDrawer },
          ...(canUpdateVoucher
            ? [
                { label: "Hủy phiếu", disabled: saving, onClick: () => handleStatusTransition("CANCEL", reloadCurrentData) },
                { label: "Hạch toán", primary: true, loading: saving, disabled: saving, onClick: () => handleStatusTransition("POST", reloadCurrentData) },
              ]
            : []),
        ];
      default:
        return [{ label: "Đóng", onClick: closeDrawer }];
    }
  })();
  const editToggle = editing && canEditVoucher && canUpdateVoucher ? (
    <button
      onClick={handleToggleEditMode}
      className={cn(
        "px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors",
        drawerEditMode
          ? "border-[color:var(--border)] text-[color:var(--muted-fg)] bg-[color:var(--muted)] hover:bg-surface-hover"
          : "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg",
      )}
    >
      {drawerEditMode ? t("voucher.drawer.cancel") : t("voucher.drawer.edit")}
    </button>
  ) : null;

  const bankName = useCallback((id: string | null) => {
    if (!id) return "—";
    const b = companyBankAccounts.find((x) => x.id === id);
    return b ? `${b.bank_name} — ${b.account_number.slice(-4)}` : "—";
  }, [companyBankAccounts]);

  const currentClosing = useMemo(
    () => (openingBal ?? 0) + (summary?.receipt ?? 0) - (summary?.payment ?? 0),
    [openingBal, summary],
  );
  const pendingCount = useMemo(
    () =>
      vouchers.filter(
        (v) => v.status === "DRAFT" || v.status === "PENDING_APPROVAL",
      ).length,
    [vouchers],
  );

  return (
    <div>
      <PageHeader
        title={t("tiengui.title")}
        desc={t("tiengui.desc")}
        icon={<Landmark className="h-4 w-4" />}
        actions={
          canCreateVoucher ? (
            <>
              <BtnPrimary onClick={() => openNew("BANK_RECEIPT")}>
                <IconPlus /> {t("tiengui.createUNT")}
              </BtnPrimary>
              <BtnPrimary onClick={() => openNew("BANK_PAYMENT")}>
                <IconPlus /> {t("tiengui.createUNC")}
              </BtnPrimary>
            </>
          ) : undefined
        }
      />

      {/* Filter bar */}
      <VoucherFilterBar
        period={period}
        dateFrom={dateFrom}
        dateTo={dateTo}
        channelFilter={bankFilter}
        channelOpts={bankFilterOpts}
        channelLabel={t("voucher.filter.bank")}
        channelPlaceholder={t("voucher.filter.bankPlaceholder")}
        hasActiveFilter={hasActiveFilter}
        onPeriodChange={handlePeriodChange}
        onDateFrom={handleDateFrom}
        onDateTo={handleDateTo}
        onChannelChange={handleBankFilter}
        onReset={handleReset}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 mb-4">
        <KpiCard label={t("tiengui.kpi.balance")} value={openingLoading ? "..." : fmtAmount(currentClosing)} icon={<IconBank />} />
        <KpiCard label={t("tiengui.kpi.unt")} value={summaryLoading ? "..." : fmtAmount(summary?.receipt ?? 0)} icon={<IconUp />} />
        <KpiCard label={t("tiengui.kpi.unc")} value={summaryLoading ? "..." : fmtAmount(summary?.payment ?? 0)} icon={<IconDown />} />
        <KpiCard label={t("tiengui.kpi.pending")} value={String(pendingCount)} icon={<IconFileWarn />} warn={pendingCount > 0} />
      </div>

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
        balanceTrendTitle={t("tiengui.balanceTrend")}
        incomeStructureTitle={t("tiengui.donut.untIn")}
        expenseStructureTitle={t("tiengui.donut.uncOut")}
      />

      {/* Table */}
      <VoucherTable
        title={t("tiengui.orderList")}
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
        noDataLabel={t("tiengui.noData")}
        channelNameResolver={bankName}
        channelColLabel={t("voucher.table.colBank")}
        onSort={handleSort}
        onPage={setPage}
        onPageSize={handlePageSize}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onSearchInput={(v) => handleSearchInput(v, () => setPage(1))}
        onAmountMin={(v) =>
          handleAmountRangeInput("min", v, () => setPage(1))
        }
        onAmountMax={(v) =>
          handleAmountRangeInput("max", v, () => setPage(1))
        }
        onStatusFilter={handleStatusFilter}
        counterpartySourceFilter={counterpartySourceFilter}
        onCounterpartySourceFilter={(v) => {
          setCounterpartySourceFilter(v);
          setPage(1);
        }}
      />

      <div className="mt-4">
        <OpeningBalancePanel type="BANK" />
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={drawerEditMode && isDirty && !viewOnly}
        title={
          editing
            ? (form.voucher_type === "BANK_RECEIPT"
                ? t("voucher.drawer.titleEditUNT")
                : t("voucher.drawer.titleEditUNC")
              ).replace("{0}", form.voucher_no)
            : form.voucher_type === "BANK_RECEIPT"
              ? t("voucher.drawer.titleCreateUNT")
              : t("voucher.drawer.titleCreateUNC")
        }
        subtitle={editing ? editing.voucher_no : t("voucher.drawer.subtitleEdit")}
        headerExtra={editToggle}
        panelClassName="w-[860px] max-[980px]:w-[calc(100vw-24px)] max-[500px]:w-screen"
        bodyClassName="p-4"
        actions={drawerActions}
      >
        <DrawerSection title={t("voucher.drawer.sectionOrder")}>
          <div className="grid grid-cols-3 max-[760px]:grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
            <DrawerField label={t("voucher.drawer.voucherNo")} required>
              <input
                type="text"
                disabled={viewOnly}
                className={inputCls}
                value={form.voucher_no}
                onChange={(e) => setField("voucher_no", e.target.value)}
                placeholder={t("voucher.drawer.voucherNoPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.docDate")} required>
              <DatePicker
                disabled={viewOnly}
                value={form.document_date}
                onChange={handleDocumentDateChange}
                className="w-full min-w-0"
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.postDate")} required>
              <DatePicker
                disabled={viewOnly}
                value={form.posting_date}
                onChange={handlePostingDateChange}
                className="w-full min-w-0"
              />
            </DrawerField>
          </div>
          <DrawerField label={t("voucher.drawer.bankAccount")} required>
            <Combobox
              disabled={viewOnly}
              options={companyBankOpts}
              value={form.company_bank_account_id}
              onChange={handleCompanyBankChange}
              placeholder={t("voucher.drawer.bankAccountPlaceholder")}
            />
          </DrawerField>
        </DrawerSection>
        <DrawerSection title={t("voucher.drawer.sectionPartner")}>
          <DrawerField label="Loại đối tượng" required>
            <Combobox
              options={COUNTERPARTY_SOURCE_OPTS}
              value={form.counterparty_source}
              onChange={(v) => setField("counterparty_source", (v as CounterpartySource) || "EXTERNAL")}
              disabled={viewOnly}
            />
          </DrawerField>

          {form.counterparty_source === "INTERNAL" ? (
            <DrawerField label="Nhân viên" required>
              <Combobox
                options={employeeOpts}
                value={form.employee_id}
                onChange={handleEmployeeChange}
                placeholder="Chọn nhân viên..."
                disabled={viewOnly}
              />
            </DrawerField>
          ) : (
            <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
              <div className="col-span-2 max-[560px]:col-span-1">
                <DrawerField label={t("voucher.drawer.partner")} required>
                  <Combobox
                    disabled={viewOnly}
                    options={partnerOpts}
                    value={form.counterparty_id}
                    onChange={handlePartnerChange}
                    placeholder={t("voucher.drawer.partnerPlaceholder")}
                  />
                </DrawerField>
              </div>
              <DrawerField label={t("voucher.drawer.partnerBank")}>
                <Combobox
                  options={partnerBankOpts}
                  value={form.beneficiary_bank_account_id}
                  onChange={(v) => setField("beneficiary_bank_account_id", v)}
                  placeholder={
                    partnerBankLoading
                      ? t("voucher.drawer.partnerBankLoading")
                      : form.counterparty_id
                        ? t("voucher.drawer.partnerBankPlaceholder")
                        : t("voucher.drawer.partnerBankNoPartner")
                  }
                  disabled={viewOnly || !form.counterparty_id || partnerBankLoading}
                />
              </DrawerField>
              <DrawerField label={t("voucher.drawer.taxCode")}>
                <input
                  type="text"
                  disabled
                  className={inputCls}
                  value={form.counterparty_tax_code_snapshot}
                  readOnly
                />
              </DrawerField>
              <DrawerField label={t("voucher.drawer.role")}>
                <Combobox
                  disabled
                  options={COUNTERPARTY_ROLE_OPTS}
                  value={form.counterparty_role}
                  onChange={(v) => setField("counterparty_role", v)}
                  placeholder={t("voucher.drawer.rolePlaceholder")}
                />
              </DrawerField>
              <div className="col-span-2 max-[560px]:col-span-1">
                <DrawerField label={t("voucher.drawer.address")}>
                  <input
                    type="text"
                    disabled
                    className={inputCls}
                    value={form.counterparty_address_snapshot}
                    readOnly
                  />
                </DrawerField>
              </div>
            </div>
          )}

          {(form.counterparty_name_snapshot ||
            form.counterparty_phone_snapshot ||
            form.counterparty_identity_no_snapshot) && (
            <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-fg space-y-1">
              <p className="font-medium text-foreground">Thông tin sẽ được chốt khi lưu:</p>
              {form.counterparty_name_snapshot && (
                <p>Tên: <span className="text-foreground">{form.counterparty_name_snapshot}</span></p>
              )}
              {form.counterparty_phone_snapshot && (
                <p>SĐT: <span className="text-foreground">{form.counterparty_phone_snapshot}</span></p>
              )}
              {form.counterparty_identity_no_snapshot && (
                <p>CMND/CCCD: <span className="text-foreground">{form.counterparty_identity_no_snapshot}</span></p>
              )}
            </div>
          )}
        </DrawerSection>
        <DrawerSection title={t("voucher.drawer.sectionAccounting")}>
          <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
            <DrawerField label={t("voucher.drawer.debitAcc")} required>
              <Combobox
                disabled={viewOnly}
                options={debitAccountOpts}
                value={form.debit_account_id}
                onChange={(v) => setField("debit_account_id", v)}
                placeholder={t("voucher.drawer.accPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.creditAcc")} required>
              <Combobox
                disabled={viewOnly}
                options={creditAccountOpts}
                value={form.credit_account_id}
                onChange={(v) => setField("credit_account_id", v)}
                placeholder={t("voucher.drawer.accPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.amount")} required>
              <input
                type="text"
                inputMode="numeric"
                disabled={viewOnly}
                className={inputCls}
                value={form.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={t("voucher.drawer.amountPlaceholder")}
              />
            </DrawerField>
            <DrawerField label={t("voucher.drawer.amountWords")}>
              <input
                type="text"
                disabled={viewOnly}
                className={inputCls}
                value={form.amount_in_words}
                onChange={(e) => setField("amount_in_words", e.target.value)}
                placeholder={t("voucher.drawer.amountWordsPlaceholder")}
              />
            </DrawerField>
          </div>
          <DrawerField label={t("voucher.drawer.desc")}>
            <textarea
              disabled={viewOnly}
              className={inputCls}
              rows={2}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t("voucher.drawer.descPlaceholder")}
            />
          </DrawerField>
        </DrawerSection>
        <DrawerSection title={t("voucher.drawer.sectionAttachment")}>
          {existingAttachments.length > 0 && (
            <div className="mb-3 rounded-lg border border-border overflow-hidden">
              {existingAttachments.map((a) => (
                <AttachmentRow
                  key={a.id}
                  item={a}
                  onDelete={viewOnly ? undefined : handleDeleteAttachment}
                />
              ))}
            </div>
          )}
          {!viewOnly && (
            <>
              <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-x-3">
                <DrawerField label={t("voucher.drawer.attachmentType")}>
                  <Combobox
                    options={ATTACHMENT_TYPE_OPTS}
                    value={attachmentType}
                    onChange={(v) => setAttachmentType((v as AttachmentType) || "OTHER")}
                    placeholder={t("voucher.drawer.attachmentTypePlaceholder")}
                  />
                </DrawerField>
                <DrawerField label={t("voucher.drawer.attachmentNote")}>
                  <input
                    type="text"
                    className={inputCls}
                    value={attachmentNote}
                    onChange={(e) => setAttachmentNote(e.target.value)}
                    placeholder={t("voucher.drawer.attachmentNotePlaceholder")}
                  />
                </DrawerField>
              </div>
              <DrawerField label={t("voucher.drawer.newFile")}>
                <FileUploadBox
                  multiple
                  files={attachmentFiles}
                  onFilesChange={setAttachmentFiles}
                  maxSizeMb={10}
                />
              </DrawerField>
            </>
          )}
        </DrawerSection>
        {editing && (
          <DrawerSection title="Lịch sử duyệt">
            <ApprovalHistory voucherId={editing.id} />
          </DrawerSection>
        )}
        {saveError && <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{saveError}</div>}
      </DrawerModal>

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
