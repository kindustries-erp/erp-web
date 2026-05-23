import { Wallet } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/shared/components/PageLayout";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { OpeningBalancePanel } from "@/modules/finance/components/OpeningBalancePanel";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { attachmentFileName } from "@/shared/components/AttachmentComponents";
import {
  IconPlus,
  IconCard,
  IconTrendUp as IconUp,
  IconTrendDown as IconDown,
} from "@/shared/components/icons";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
import { type FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  STATUS_FILTER_OPTS,
  COUNTERPARTY_SOURCE_OPTS,
} from "@/modules/finance/types/voucherForm";
import { VoucherKpiRow } from "@/modules/finance/components/VoucherKpiRow";
import { VoucherChartRow } from "@/modules/finance/components/VoucherChartRow";
import { VoucherTable } from "@/modules/finance/components/VoucherTable";
import { CashVoucherDrawer } from "@/modules/finance/components/CashVoucherDrawer";
import { PaymentVoucherAccountingModal } from "../PaymentVoucherAccountingModal";

export function CashFundView(p: any) {
  const {
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
    fundOptsDrawer,
    cashFunds,
    fundAccountLabel,
    partnerOpts,
    employeeOpts,
    coaOpts,
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
  } = p;
  const [accountingModalOpen, setAccountingModalOpen] = useState(false);
  const [accountingVoucher, setAccountingVoucher] = useState<any | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const filterConfig: FilterPanelConfig = {
    period: true,
    search: true,
    amountRange: true,
    channel: {
      label: t("voucher.filter.fund"),
      placeholder: t("voucher.filter.fundPlaceholder"),
      options: fundOpts ?? [],
    },
    status: { options: STATUS_FILTER_OPTS },
    counterpartySource: { options: COUNTERPARTY_SOURCE_OPTS },
  };

  // Count active filters for badge
  const activeFilterCount = [
    hasActiveFilter,
    !!searchInput,
    !!amountMinInput || !!amountMaxInput,
    !!statusFilter,
    !!counterpartySourceFilter,
    !!fundFilter,
  ].filter(Boolean).length;

  // Full reset: clear all filters including search, status, counterparty
  function resetAllFilters() {
    handleReset(); // resets period + amounts + fund
    handleSearchInput("");
    setStatusFilter("");
    setCounterpartySourceFilter("");
  }

  return (
    <PageLayout
      title={t("tienmat.title")}
      desc={t("tienmat.desc")}
      icon={<Wallet className="h-4 w-4" />}
      actions={
        canCreateVoucher ? (
          <>
            <FilterButton
              onClick={() => setFilterPanelOpen((v) => !v)}
              activeCount={activeFilterCount}
            />
            <BtnPrimary onClick={() => openNew("CASH_RECEIPT")}>
              <IconPlus /> {t("tienmat.createReceipt")}
            </BtnPrimary>
            <BtnPrimary onClick={() => openNew("CASH_PAYMENT")}>
              <IconPlus /> {t("tienmat.createPayment")}
            </BtnPrimary>
          </>
        ) : (
          <FilterButton
            onClick={() => setFilterPanelOpen((v) => !v)}
            activeCount={activeFilterCount}
          />
        )
      }
      hideHeader={p.hideHeader}
    >
      <div className="flex gap-5 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
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
          <VoucherChartRow
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
        </div>
        {/* Filter sidebar (inline column) */}
        <FilterPanel
          config={filterConfig}
          filter={{
            state: {
              period,
              dateFrom,
              dateTo,
              channel: fundFilter,
              search: searchInput,
              amountMin: amountMinInput,
              amountMax: amountMaxInput,
              status: statusFilter,
              counterpartySource: counterpartySourceFilter,
              custom: {},
            },
            inputs: {
              search: searchInput,
              amountMin: amountMinInput,
              amountMax: amountMaxInput,
            },
            panelOpen: filterPanelOpen,
            openPanel: () => setFilterPanelOpen(true),
            closePanel: () => setFilterPanelOpen(false),
            togglePanel: () => setFilterPanelOpen((v: boolean) => !v),
            setPeriod: handlePeriodChange,
            setDateFrom: handleDateFrom,
            setDateTo: handleDateTo,
            setChannel: handleFundFilter,
            setSearchInput: handleSearchInput,
            setAmountMinInput: (v: string) => handleAmountRangeInput("min", v),
            setAmountMaxInput: (v: string) => handleAmountRangeInput("max", v),
            setStatus: setStatusFilter,
            setCounterpartySource: setCounterpartySourceFilter,
            setCustom: () => {},
            resetAll: resetAllFilters,
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>
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
        fundOpts={fundOptsDrawer}
        fundAccountLabel={fundAccountLabel ?? ""}
        partnerOpts={partnerOpts}
        employeeOpts={employeeOpts}
        coaOpts={coaOpts}
        tagPresets={tagPresets}
        canUpdateVoucher={canUpdateVoucher}
        onClose={closeDrawer}
        onSave={handleSave}
        onSaveRelatedDocuments={handleSaveRelatedDocuments}
        onStatusTransition={(action, opts) => {
          if (action === "POST") {
            setAccountingVoucher(editing);
            setAccountingModalOpen(true);
            return;
          }
          handleStatusTransition(action, reloadAll, opts);
        }}
        onToggleEditMode={handleToggleEditMode}
        onFieldChange={setField}
        onDocumentDateChange={handleDocumentDateChange}
        onPostingDateChange={handlePostingDateChange}
        onAmountChange={handleAmountChange}
        onCashFundChange={handleCashFundChange}
        onPartnerChange={handlePartnerChange}
        onEmployeeChange={handleEmployeeChange}
        onTagPresetSelect={handleTagPresetSelect}
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
      <PaymentVoucherAccountingModal
        open={accountingModalOpen}
        onClose={() => {
          setAccountingModalOpen(false);
          setAccountingVoucher(null);
        }}
        voucher={accountingVoucher}
        accounts={coaItems || []}
        cashFunds={cashFunds || []}
        tagPresets={tagPresets || []}
        onSuccess={() => {
          closeDrawer();
          if (typeof reloadAll === "function") reloadAll();
        }}
      />
    </PageLayout>
  );
}
