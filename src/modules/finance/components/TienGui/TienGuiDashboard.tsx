import { Landmark } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { PageHeader } from "@/shared/components/PageHeader";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { OpeningBalancePanel } from "@/modules/finance/components/OpeningBalancePanel";
import { VoucherFilterBar } from "@/modules/finance/components/VoucherFilterBar";
import { VoucherChartRow } from "@/modules/finance/components/VoucherChartRow";
import { VoucherTable } from "@/modules/finance/components/VoucherTable";
import {
  IconBank,
  IconFileWarn,
  IconPlus,
  IconTrendDown as IconDown,
  IconTrendUp as IconUp,
} from "@/shared/components/icons";

export function TienGuiDashboard(props: any) {
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
  return (
    <>
      {!props.hideHeader && (
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
      )}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex-1">
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
        </div>
      </div>
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 mb-4">
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
        onSearchInput={(v: string) => handleSearchInput(v, () => setPage(1))}
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
    </>
  );
}
