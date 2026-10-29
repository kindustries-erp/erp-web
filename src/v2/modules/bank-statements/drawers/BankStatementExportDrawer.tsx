import * as React from "react";
import {
  FileSpreadsheet,
  RefreshCw,
  V2Button,
} from "@/v2/shared/components/atoms";
import { V2ExportExcelDrawer } from "@/v2/shared/components/organisms/v2-export-excel-drawer";
import { V2ExportHistoryList } from "@/v2/shared/components/molecules/v2-export-history-list";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  BankStatementExportAccount,
  BankStatementFilterSummaryInput,
} from "../api/dtos/bankStatementExport.dto";
import { BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS } from "./BankStatementExportDrawer.columns.config";
import { useBankStatementExportDrawer } from "./BankStatementExportDrawer.hook";
import { BankStatementExportConditions } from "./BankStatementExportConditions";
import "../bankStatements.locale";

export interface BankStatementExportDrawerProps {
  open: boolean;
  onClose: () => void;
  type: "bank" | "cash";
  accounts: BankStatementExportAccount[];
  buildBaseQuery: () => Record<string, unknown>;
  currentFilterSummary?: BankStatementFilterSummaryInput;
}

export function BankStatementExportDrawer({
  open,
  onClose,
  type,
  accounts,
  buildBaseQuery,
  currentFilterSummary,
}: BankStatementExportDrawerProps) {
  const { t } = useV2Translation();
  const vm = useBankStatementExportDrawer({
    open,
    type,
    accounts,
    buildBaseQuery,
    currentFilterSummary,
  });
  const isBank = type === "bank";

  return (
    <V2ExportExcelDrawer
      open={open}
      onClose={onClose}
      title={
        isBank
          ? t("v2.bankStatements.export.title", "Xuất Excel sao kê ngân hàng")
          : t(
              "v2.bankStatements.export.cashTitle",
              "Xuất Excel sổ quỹ tiền mặt",
            )
      }
      subtitle={t(
        "v2.bankStatements.export.subtitle",
        "Mỗi tài khoản ngân hàng được tách thành một sheet riêng.",
      )}
      icon={<FileSpreadsheet className="h-4 w-4" />}
      columnGroups={vm.columnGroups}
      selectedColumns={vm.selectedColumns}
      defaultColumns={BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS}
      onColumnsChange={vm.setSelectedColumns}
      columnsTitle={t("v2.exportExcel.columnSelector.title", "Cột xuất Excel")}
      historyTitle={t("v2.exportExcel.history.title", "Lịch sử xuất file")}
      historyExtra={
        <V2Button
          size="icon-xs"
          variant="ghost"
          aria-label={t("v2.exportExcel.history.refresh", "Làm mới lịch sử")}
          disabled={vm.historyLoading}
          onClick={vm.refreshHistory}
        >
          <RefreshCw
            className={
              vm.historyLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"
            }
          />
        </V2Button>
      }
      history={
        <V2ExportHistoryList
          items={vm.historyItems}
          isLoading={vm.historyLoading}
          emptyLabel={t(
            "v2.exportExcel.history.empty",
            "Chưa có file xuất nào",
          )}
          downloadLabel={t("v2.exportExcel.history.download", "Tải file")}
          downloadingLabel={t(
            "v2.exportExcel.history.downloading",
            "Đang tải...",
          )}
          downloadingId={vm.downloadingJobId}
          onDownload={(jobId) => vm.handleDownloadRow(jobId)}
          page={vm.page}
          pageSize={vm.pageSize}
          total={vm.historyTotal}
          onPageChange={vm.setPage}
          onPageSizeChange={vm.setPageSize}
        />
      }
      conditions={
        <BankStatementExportConditions
          exportMode={vm.exportMode}
          onExportModeChange={vm.setExportMode}
          periodType={vm.periodType}
          onPeriodTypeChange={vm.handlePeriodTypeChange}
          period={vm.period}
          onPeriodChange={vm.handlePeriodChange}
          periodOptions={vm.periodOptions}
          quarter={vm.quarter}
          onQuarterChange={vm.handleQuarterChange}
          quarterOptions={vm.quarterOptions}
          dateFrom={vm.dateFrom}
          onDateFromChange={vm.setDateFrom}
          dateTo={vm.dateTo}
          onDateToChange={vm.setDateTo}
          filterSummaryRows={vm.filterSummary.rows}
          filterCount={vm.filterSummary.filterCount}
          starting={vm.starting}
          noColumnSelected={vm.selectedColumns.length === 0}
          onStart={() => void vm.handleStartExport()}
          accountLabel={
            isBank
              ? t("v2.bankStatements.export.account", "Tài khoản ngân hàng")
              : t("v2.bankStatements.export.cashBook", "Sổ quỹ")
          }
          accountPlaceholder={
            isBank
              ? t(
                  "v2.bankStatements.export.allBankAccounts",
                  "Tất cả tài khoản ngân hàng",
                )
              : t("v2.bankStatements.export.allCashBooks", "Tất cả sổ quỹ")
          }
          accountOptions={vm.accountOptions}
          accountId={vm.accountId}
          onAccountChange={vm.setAccountId}
          transactionTypeLabel={t(
            "v2.bankStatements.export.transactionType",
            "Loại giao dịch",
          )}
          transactionTypePlaceholder={t(
            "v2.bankStatements.export.allTypes",
            "Tất cả loại giao dịch",
          )}
          transactionTypeOptions={vm.transactionTypeOptions}
          transactionType={vm.transactionType}
          onTransactionTypeChange={vm.setTransactionType}
        />
      }
    />
  );
}
