import React from "react";
import { ImportStatementDrawer } from "@/pages/finance/components/ImportStatementDrawer";
import { OriginalStatementFilesDrawer } from "@/pages/finance/components/OriginalStatementFilesDrawer";
import { CreateCashTransactionDrawer } from "@/pages/finance/components/CreateCashTransactionDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { BankStatementExportDrawer } from "@/pages/finance/components/BankStatementExportDrawer";
import { PartnerTransactionsDrawer } from "@/pages/components/PartnerTransactionsDrawer";

export interface BankStatementDrawersProps {
  type: "bank" | "cash";
  branches: any[];
  accountsData: any[];
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  isOriginalFilesOpen: boolean;
  setIsOriginalFilesOpen: (open: boolean) => void;
  isImportOpen: boolean;
  setIsImportOpen: (open: boolean) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  detailTransactionId: string | null;
  setDetailTransactionId: (id: string | null) => void;
  partnerDrawerOpen: boolean;
  setPartnerDrawerOpen: (open: boolean) => void;
  selectedPartner: { account?: string; name?: string } | null;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  onRefresh: () => void;
}

export function BankStatementDrawers({
  type,
  branches,
  accountsData,
  isExportOpen,
  setIsExportOpen,
  isOriginalFilesOpen,
  setIsOriginalFilesOpen,
  isImportOpen,
  setIsImportOpen,
  isCreateOpen,
  setIsCreateOpen,
  detailTransactionId,
  setDetailTransactionId,
  partnerDrawerOpen,
  setPartnerDrawerOpen,
  selectedPartner,
  dateFrom,
  dateTo,
  branchId,
  onRefresh,
}: BankStatementDrawersProps) {
  return (
    <>
      <BankStatementExportDrawer
        open={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        type={type}
        branches={branches}
        accountsData={accountsData}
      />

      <OriginalStatementFilesDrawer
        isOpen={isOriginalFilesOpen}
        onClose={() => setIsOriginalFilesOpen(false)}
        type={type}
      />

      <ImportStatementDrawer
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        type={type}
        onSuccess={() => {
          setIsImportOpen(false);
          onRefresh();
        }}
      />

      {type === "cash" && (
        <CreateCashTransactionDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            onRefresh();
          }}
        />
      )}

      <BankTransactionDetailDrawer
        isOpen={!!detailTransactionId}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
        onSaved={() => {
          onRefresh();
        }}
      />

      <PartnerTransactionsDrawer
        open={partnerDrawerOpen}
        onClose={() => setPartnerDrawerOpen(false)}
        correspondentAccount={selectedPartner?.account}
        correspondentName={selectedPartner?.name}
        globalStartDate={dateFrom}
        globalEndDate={dateTo}
        globalBranchId={branchId}
      />
    </>
  );
}
