import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import type { Employee } from "@/modules/auth/api/auth";
import { TODAY } from "@/modules/finance/utils/financeHelpers";
import {
  getChartOfAccountsApi,
  getCompanyBankAccountsApi,
  type ChartOfAccount,
  type CompanyBankAccount,
} from "@/modules/accounting/api/catalogApi";
import { attachmentFileName } from "@/shared/components/AttachmentComponents";
import {
  DrawerModal,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { BankVoucherDrawer } from "@/modules/finance/components/TienGui/BankVoucherDrawer";
import { TienGuiDashboard } from "@/modules/finance/components/TienGui/TienGuiDashboard";
import { PaymentVoucherAccountingModal } from "@/modules/finance/components/PaymentVoucherAccountingModal";
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
import { useBankVoucherHandlers } from "@/modules/finance/hooks/useBankVoucherHandlers";
import type { SimpleJournalEntryFormLine } from "@/modules/accounting/types/journalEntry";
import {
  buildCreatePayloadFromSimple,
  emptySimpleLine,
} from "@/modules/accounting/utils/journalEntryUtils";
import {
  submitPaymentVoucherApi,
  approvePaymentVoucherApi,
  rejectPaymentVoucherApi,
  postPaymentVoucherToJournalApi,
  cancelPaymentVoucherApi,
  getPaymentVoucherLookupBusinessPartnersApi,
  getPaymentVoucherLookupEmployeesApi,
  type VoucherStatus,
  type CounterpartySource,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";

export const TienGui = forwardRef(
  (props: { hideHeader?: boolean } = {}, ref) => {
    const t = useT();
    const canCreateVoucher = useHasPermission("payment_vouchers", "create");
    const canUpdateVoucher = useHasPermission("payment_vouchers", "update");
    const [companyBankAccounts, setCompanyBankAccounts] = useState<
      CompanyBankAccount[]
    >([]);
    const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
    const [partners, setPartners] = useState<BusinessPartner[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [catalogLoaded, setCatalogLoaded] = useState(false);
    const [statusFilter, setStatusFilter] = useState<VoucherStatus | "">("");
    const [accountingModalOpen, setAccountingModalOpen] = useState(false);
    const [accountingVoucher, setAccountingVoucher] =
      useState<PaymentVoucher | null>(null);
    const [counterpartySourceFilter, setCounterpartySourceFilter] = useState<
      CounterpartySource | ""
    >("");

    const periodFilter = usePeriodFilter();
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
    } = periodFilter;
    const dashboard = useVoucherDashboard();
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
    } = dashboard;
    const voucherList = useVoucherList();
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
    } = voucherList;
    const { voucherAttachments, loadVoucherAttachments } =
      useVoucherAttachments();
    const { searchInput, search, handleSearchInput } = useSearchFilter();
    const amountFilter = useAmountRangeFilter();
    const {
      amountMinInput,
      amountMaxInput,
      amountMin,
      amountMax,
      handleAmountRangeInput,
      resetAmounts,
    } = amountFilter;

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

    const reloadPartners = useCallback(async (): Promise<BusinessPartner[]> => {
      try {
        const bps = await getPaymentVoucherLookupBusinessPartnersApi();
        const list = bps ?? [];
        setPartners(list);
        return list;
      } catch {
        return partners;
      }
    }, []);

    const reloadDonutData = useCallback(
      () =>
        loadDonutData(
          bankFilter,
          coaItems,
          bankDashboardParams,
          dateFrom,
          dateTo,
        ),
      [
        bankDashboardParams,
        bankFilter,
        coaItems,
        dateFrom,
        dateTo,
        loadDonutData,
      ],
    );
    const handlers = useBankVoucherHandlers({
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
      tagPresets,
      handleTagPresetSelect,
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
      handleSaveRelatedDocuments,
      handleDelete,
    } = handlers;

    useImperativeHandle(ref, () => ({
      openNew: (type: string) => openNew(type as any),
    }));

    async function handleStatusTransition(
      action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL",
      onSuccess: () => void,
    ) {
      if (!editing) return;
      setSaving(true);
      setSaveError(null);
      try {
        if (action === "SUBMIT") await submitPaymentVoucherApi(editing.id);
        else if (action === "APPROVE")
          await approvePaymentVoucherApi(editing.id);
        else if (action === "REJECT") await rejectPaymentVoucherApi(editing.id);
        else if (action === "POST") {
          setAccountingVoucher(editing);
          setAccountingModalOpen(true);
          return;
        } else if (action === "CANCEL")
          await cancelPaymentVoucherApi(editing.id, form.cancel_reason);
        closeDrawer();
        onSuccess();
      } catch (e) {
        setSaveError((e as Error)?.message ?? "Lỗi không xác định");
      } finally {
        setSaving(false);
      }
    }

    useEffect(() => {
      loadSummary(dateFrom, dateTo, bankDashboardParams);
    }, [dateFrom, dateTo, bankDashboardParams, loadSummary]);
    useEffect(() => {
      loadOpeningBalanceAndChart(
        dateFrom,
        dateTo || TODAY,
        bankDashboardParams,
      );
    }, [dateFrom, dateTo, bankDashboardParams, loadOpeningBalanceAndChart]);
    useEffect(() => {
      if (catalogLoaded)
        loadDonutData(
          bankFilter,
          coaItems,
          bankDashboardParams,
          dateFrom,
          dateTo,
        );
    }, [
      catalogLoaded,
      bankFilter,
      coaItems,
      bankDashboardParams,
      dateFrom,
      dateTo,
      loadDonutData,
    ]);
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
      loadVouchers,
      loadVoucherAttachments,
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

    const hasActiveFilter = hasActivePeriodFilter || !!amountMin || !!amountMax;
    const fmtAmount = useCallback((n: number) => {
      const abs = Math.abs(n);
      if (abs >= 1_000_000_000) return `₫ ${(n / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `₫ ${(n / 1_000_000).toFixed(0)}M`;
      return `₫ ${n.toLocaleString("vi-VN")}`;
    }, []);
    const isDirty = !!form.voucher_no.trim() || !!form.amount;
    const optionSets = useMemo(
      () =>
        buildOptionSets(
          coaItems,
          partners,
          employees,
          companyBankAccounts,
          partnerBankAccounts,
          form.voucher_type,
        ),
      [
        coaItems,
        partners,
        employees,
        companyBankAccounts,
        partnerBankAccounts,
        form.voucher_type,
      ],
    );
    const viewOnly = !!editing && !drawerEditMode;
    const canEditVoucher = !editing || editing.status === "DRAFT";
    const editToggle =
      editing && canEditVoucher && canUpdateVoucher ? (
        <button
          onClick={handleToggleEditMode}
          className={cn(
            "px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors",
            drawerEditMode
              ? "border-[color:var(--border)] text-[color:var(--muted-fg)] bg-[color:var(--muted)] hover:bg-surface-hover"
              : "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg",
          )}
        >
          {drawerEditMode
            ? t("voucher.drawer.cancel")
            : t("voucher.drawer.edit")}
        </button>
      ) : null;
    const drawerActions = buildDrawerActions({
      editing,
      drawerEditMode,
      saving,
      canUpdateVoucher,
      closeDrawer,
      handleSave,
      handleSaveRelatedDocuments,
      handleStatusTransition,
      reloadCurrentData,
    });
    const bankName = useCallback(
      (id: string | null) => {
        if (!id) return "—";
        const b = companyBankAccounts.find((x) => x.id === id);
        return b ? `${b.bank_name} — ${b.account_number.slice(-4)}` : "—";
      },
      [companyBankAccounts],
    );
    const currentClosing = useMemo(
      () =>
        (openingBal ?? 0) + (summary?.receipt ?? 0) - (summary?.payment ?? 0),
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
        <TienGuiDashboard
          hideHeader={props.hideHeader}
          {...{
            t,
            canCreateVoucher,
            openNew,
            period,
            dateFrom,
            dateTo,
            bankFilter,
            bankFilterOpts: optionSets.bankFilterOpts,
            hasActiveFilter,
            handlePeriodChange,
            handleDateFrom,
            handleDateTo,
            handleBankFilter,
            handleReset,
            openingLoading,
            summaryLoading,
            donutLoading,
            chartData,
            chartLabels,
            chartYMax,
            chartUnit,
            receiptDonutItems,
            paymentDonutItems,
            currentClosing,
            summary,
            pendingCount,
            fmtAmount,
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
            bankName,
            handleSort,
            setPage,
            handlePageSize,
            openEdit,
            setDeleteTarget,
            handleSearchInput,
            handleAmountRangeInput,
            handleStatusFilter,
            counterpartySourceFilter,
            setCounterpartySourceFilter,
          }}
        />
        <BankVoucherDrawer
          {...{
            t,
            drawerOpen,
            closeDrawer,
            drawerEditMode,
            isDirty,
            viewOnly,
            editing,
            form,
            editToggle,
            drawerActions,
            setField,
            handleDocumentDateChange,
            handlePostingDateChange,
            companyBankOpts: optionSets.companyBankOpts,
            handleCompanyBankChange,
            employeeOpts: optionSets.employeeOpts,
            handleEmployeeChange,
            partnerOpts: optionSets.partnerOpts,
            handlePartnerChange,
            partnerBankOpts: optionSets.partnerBankOpts,
            partnerBankLoading,
            debitAccountOpts: optionSets.debitAccountOpts,
            creditAccountOpts: optionSets.creditAccountOpts,
            tagPresets,
            handleTagPresetSelect,
            handleAmountChange,
            existingAttachments,
            handleDeleteAttachment,
            attachmentType,
            setAttachmentType,
            attachmentNote,
            setAttachmentNote,
            attachmentFiles,
            setAttachmentFiles,
            saveError,
            reloadPartners,
          }}
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

        <PaymentVoucherAccountingModal
          open={accountingModalOpen}
          onClose={() => {
            setAccountingModalOpen(false);
            setAccountingVoucher(null);
          }}
          voucher={accountingVoucher}
          accounts={coaItems}
          tagPresets={tagPresets}
          onSuccess={() => {
            closeDrawer();
            reloadCurrentData();
          }}
        />
      </div>
    );
  },
);

function buildOptionSets(
  coaItems: ChartOfAccount[],
  partners: BusinessPartner[],
  employees: Employee[],
  companyBankAccounts: CompanyBankAccount[],
  partnerBankAccounts: any[],
  voucherType: string,
) {
  const coaOpts = coaItems.map((c) => ({
    value: c.id,
    label: `${c.account_code} — ${c.account_name}`,
  }));
  const bankAccountOpts = coaItems
    .filter((c) => c.account_code.startsWith("112"))
    .map((c) => ({
      value: c.id,
      label: `${c.account_code} — ${c.account_name}`,
    }));
  return {
    coaOpts,
    debitAccountOpts:
      voucherType === "BANK_RECEIPT" ? bankAccountOpts : coaOpts,
    creditAccountOpts:
      voucherType === "BANK_PAYMENT" ? bankAccountOpts : coaOpts,
    partnerOpts: partners.map((p) => {
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
        original: p,
      };
    }),
    employeeOpts: employees.map((e) => ({
      value: e.id,
      label: `${e.employee_code ?? ""} — ${e.full_name}`
        .trim()
        .replace(/^— /, ""),
    })),
    companyBankOpts: companyBankAccounts.map((b) => ({
      value: b.id,
      label: `${b.bank_name} — ${b.account_number}`,
    })),
    bankFilterOpts: companyBankAccounts.map((b) => ({
      value: b.id,
      label: b.bank_name,
    })),
    partnerBankOpts: partnerBankAccounts.map((b) => ({
      value: b.id,
      label: `${b.bank_name} — ${b.account_number}`,
    })),
  };
}

function buildDrawerActions(args: any): DrawerAction[] {
  const {
    editing,
    drawerEditMode,
    saving,
    canUpdateVoucher,
    closeDrawer,
    handleSave,
    handleSaveRelatedDocuments,
    handleStatusTransition,
    reloadCurrentData,
  } = args;
  if (!editing || drawerEditMode)
    return [
      { label: "Hủy bỏ", onClick: closeDrawer },
      {
        label: "Lưu nháp",
        disabled: saving,
        onClick: () => handleSave("DRAFT"),
      },
      {
        label: "Gửi duyệt",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => handleSave("PENDING_APPROVAL"),
      },
    ];
  if (!canUpdateVoucher) return [{ label: "Đóng", onClick: closeDrawer }];
  if (editing.status === "DRAFT")
    return [
      { label: "Đóng", onClick: closeDrawer },
      {
        label: "Hủy phiếu",
        disabled: saving,
        onClick: () => handleStatusTransition("CANCEL", reloadCurrentData),
      },
      {
        label: "Gửi duyệt",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => handleStatusTransition("SUBMIT", reloadCurrentData),
      },
    ];
  if (editing.status === "PENDING_APPROVAL")
    return [
      { label: "Đóng", onClick: closeDrawer },
      {
        label: "Hủy phiếu",
        disabled: saving,
        onClick: () => handleStatusTransition("CANCEL", reloadCurrentData),
      },
      {
        label: "Từ chối",
        disabled: saving,
        onClick: () => handleStatusTransition("REJECT", reloadCurrentData),
      },
      {
        label: "Duyệt",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => handleStatusTransition("APPROVE", reloadCurrentData),
      },
    ];
  if (editing.status === "APPROVED" || editing.status === "CONFIRMED")
    return [
      { label: "Đóng", onClick: closeDrawer },
      {
        label: "Ghi sổ",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: () => handleStatusTransition("POST", reloadCurrentData),
      },
      {
        label: "Hủy phiếu",
        disabled: saving,
        onClick: () => handleStatusTransition("CANCEL", reloadCurrentData),
      },
    ];
  if (editing.status === "POSTED")
    return [
      { label: "Đóng", onClick: closeDrawer },
      {
        label: "Lưu chứng từ liên quan",
        primary: true,
        loading: saving,
        disabled: saving,
        onClick: handleSaveRelatedDocuments,
      },
    ];
  return [{ label: "Đóng", onClick: closeDrawer }];
}
