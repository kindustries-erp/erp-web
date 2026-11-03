import * as React from "react";
import { BankStatementExportDrawer as BankStatementExportDrawerV2 } from "@/v2/modules/bank-statements";
import type { BankStatementExportDrawerProps } from "./BankStatementExportDrawer.type";

const NO_BASE_QUERY = () => ({});

/**
 * Drawer xuất Excel sao kê / sổ quỹ dùng bản V2 (V2ExportExcelDrawer).
 * Giữ hợp đồng props của V1 để các tab sao kê không đổi.
 */
export function BankStatementExportDrawer({
  open,
  onClose,
  type,
  accountsData,
  buildBaseQuery,
  currentFilterSummary,
}: BankStatementExportDrawerProps) {
  return (
    <BankStatementExportDrawerV2
      open={open}
      onClose={onClose}
      type={type}
      accounts={accountsData}
      buildBaseQuery={buildBaseQuery ?? NO_BASE_QUERY}
      currentFilterSummary={currentFilterSummary}
    />
  );
}
