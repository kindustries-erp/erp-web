import { Landmark } from "lucide-react";
import { useState } from "react";
import { KpiCard } from "@/shared/components/KpiCard";
import { PageLayout } from "@/shared/components/PageLayout";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { OpeningBalancePanel } from "@/modules/finance/components/OpeningBalancePanel";
import { VoucherChartRow } from "@/modules/finance/components/VoucherChartRow";
import { VoucherTable } from "@/modules/finance/components/VoucherTable";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
import { type FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  STATUS_FILTER_OPTS,
  COUNTERPARTY_SOURCE_OPTS,
} from "@/modules/finance/types/voucherForm";
import {
  IconBank,
  IconFileWarn,
  IconPlus,
  IconTrendDown as IconDown,
  IconTrendUp as IconUp,
} from "@/shared/components/icons";

export function BankDepositDashboard(props: any) {
  const {
    t,
    canCreateVoucher,
    openNew,
    period,
    dateFrom,
    dateTo,
    bankFilter,
    bankFilterOpts,
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
  } = props;

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const filterConfig: FilterPanelConfig = {
    period: true,
    search: true,
    amountRange: true,
    channel: {
      label: t("voucher.filter.bank"),
      placeholder: t("voucher.filter.bankPlaceholder"),
      options: bankFilterOpts ?? [],
    },
    status: { options: STATUS_FILTER_OPTS },
    counterpartySource: { options: COUNTERPARTY_SOURCE_OPTS },
  };

  // Count active filters for badge
  const defaultPeriod = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const periodChanged =
    period !== defaultPeriod || dateFrom !== `${defaultPeriod}-01`;
  const activeFilterCount = [
    periodChanged,
    !!bankFilter,
    !!searchInput,
    !!amountMinInput || !!amountMaxInput,
    !!statusFilter,
    !!counterpartySourceFilter,
  ].filter(Boolean).length;

  function resetAllFilters() {
    handleReset();
    handleSearchInput("");
    handleStatusFilter("");
    setCounterpartySourceFilter("");
  }

  return (
    <PageLayout
      title={t("tiengui.title")}
      desc={t("tiengui.desc")}
      icon={<Landmark className="h-4 w-4" />}
      actions={
        canCreateVoucher ? (
          <>
            <FilterButton
              onClick={() => setFilterPanelOpen((v) => !v)}
              activeCount={activeFilterCount}
            />
            <BtnPrimary onClick={() => openNew("BANK_RECEIPT")}>
              <IconPlus /> {t("tiengui.createUNT")}
            </BtnPrimary>
            <BtnPrimary onClick={() => openNew("BANK_PAYMENT")}>
              <IconPlus /> {t("tiengui.createUNC")}
            </BtnPrimary>
          </>
        ) : (
          <FilterButton
            onClick={() => setFilterPanelOpen((v) => !v)}
            activeCount={activeFilterCount}
          />
        )
      }
      hideHeader={props.hideHeader}
    >
      <div className="flex items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3">
            <KpiCard
              label={t("tiengui.kpi.balance")}
              value={openingLoading ? "..." : fmtAmount(currentClosing)}
              icon={<IconBank />}
            />
            <KpiCard
              label={t("tiengui.kpi.unt")}
              value={summaryLoading ? "..." : fmtAmount(summary?.receipt ?? 0)}
              icon={<IconUp />}
            />
            <KpiCard
              label={t("tiengui.kpi.unc")}
              value={summaryLoading ? "..." : fmtAmount(summary?.payment ?? 0)}
              icon={<IconDown />}
            />
            <KpiCard
              label={t("tiengui.kpi.pending")}
              value={String(pendingCount)}
              icon={<IconFileWarn />}
              warn={pendingCount > 0}
            />
          </div>
          <VoucherChartRow
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
            onSearchInput={(v: string) =>
              handleSearchInput(v, () => setPage(1))
            }
            onAmountMin={(v: string) =>
              handleAmountRangeInput("min", v, () => setPage(1))
            }
            onAmountMax={(v: string) =>
              handleAmountRangeInput("max", v, () => setPage(1))
            }
            onStatusFilter={handleStatusFilter}
            counterpartySourceFilter={counterpartySourceFilter}
            onCounterpartySourceFilter={(v: any) => {
              setCounterpartySourceFilter(v);
              setPage(1);
            }}
          />
          <div className="mt-4">
            <OpeningBalancePanel type="BANK" />
          </div>
        </div>
        {/* Filter sidebar */}
        <FilterPanel
          config={filterConfig}
          filter={{
            state: {
              period,
              dateFrom,
              dateTo,
              channel: bankFilter,
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
            setChannel: handleBankFilter,
            setSearchInput: (v: string) =>
              handleSearchInput(v, () => setPage(1)),
            setAmountMinInput: (v: string) =>
              handleAmountRangeInput("min", v, () => setPage(1)),
            setAmountMaxInput: (v: string) =>
              handleAmountRangeInput("max", v, () => setPage(1)),
            setStatus: handleStatusFilter,
            setCounterpartySource: (v: string) => {
              setCounterpartySourceFilter(v);
              setPage(1);
            },
            setCustom: () => {},
            resetAll: resetAllFilters,
            hasActiveFilter: activeFilterCount > 0,
            activeFilterCount,
          }}
        />
      </div>
    </PageLayout>
  );
}
