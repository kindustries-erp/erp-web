import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { useBankStatementExportDrawer } from "./BankStatementExportDrawer.hook";
import { useBankStatementExportColumns } from "./BankStatementExportDrawer.columns";
import { BankStatementExportConditionSection } from "./components/BankStatementExportConditionSection";
import type { BankStatementExportDrawerProps } from "./BankStatementExportDrawer.type";

export type { BankStatementExportDrawerProps };

export function BankStatementExportDrawer(
  props: BankStatementExportDrawerProps,
) {
  const {
    open,
    onClose,
    type,
    accountsData,
    buildBaseQuery,
    currentFilterSummary,
  } = props;
  const t = useT();

  const hook = useBankStatementExportDrawer({
    open,
    type,
    accountsData,
    buildBaseQuery,
  });

  const columns = useBankStatementExportColumns({
    downloadingJobId: hook.downloadingJobId,
    progress: hook.progress,
    onDownload: hook.handleDownload,
  });

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={
        type === "bank"
          ? t("bankStatement.exportBankTitle", "Xuất Excel sao kê ngân hàng")
          : t("bankStatement.exportCashTitle", "Xuất Excel sổ quỹ tiền mặt")
      }
      subtitle={t(
        "bankStatement.exportSubtitle",
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t("bankStatement.historyTitle", "Lịch sử xuất file")}
            collapsible
            defaultCollapsed={false}
          >
            <StandardTable
              tableId="bank-statement-export-history"
              variant="spreadsheet"
              enableColumnResizing={true}
              items={hook.historyQuery.data?.items || []}
              columns={columns}
              getRowKey={(row) => row.jobId}
              loading={
                hook.historyQuery.isLoading || hook.historyQuery.isFetching
              }
              page={hook.page}
              pageSize={hook.pageSize}
              total={hook.historyQuery.data?.total || 0}
              totalPages={hook.historyQuery.data?.totalPages || 1}
              onPage={hook.setPage}
              onPageSize={hook.setPageSize}
              emptyLabel={t(
                "bankStatement.emptyHistory",
                "Chưa có file xuất nào",
              )}
            />
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <BankStatementExportConditionSection
            type={type}
            exportMode={hook.exportMode}
            onExportModeChange={hook.setExportMode}
            period={hook.period}
            onPeriodChange={hook.handlePeriodChange}
            periodOptions={hook.periodOptions}
            dateFrom={hook.dateFrom}
            onDateFromChange={(val) => hook.setDateFrom(val || "")}
            dateTo={hook.dateTo}
            onDateToChange={(val) => hook.setDateTo(val || "")}
            accountOptions={hook.accountOptions}
            selectedAccountId={hook.selectedAccountId}
            onSelectedAccountIdChange={(val) =>
              hook.setSelectedAccountId(val || "")
            }
            transactionTypeOptions={hook.transactionTypeOptions}
            transactionType={hook.transactionType}
            onTransactionTypeChange={(val) =>
              hook.setTransactionType(val || "")
            }
            currentFilterSummary={currentFilterSummary}
            starting={hook.starting}
            onStartExport={hook.handleStartExport}
          />
        </div>
      }
    />
  );
}
