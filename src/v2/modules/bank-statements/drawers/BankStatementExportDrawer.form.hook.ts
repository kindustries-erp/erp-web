import { useMemo, useState } from "react";
import type { V2ColumnSelectorGroup } from "@/v2/shared/components/molecules/v2-column-selector";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  BankStatementExportAccount,
  BankStatementFilterSummaryInput,
} from "../api/dtos/bankStatementExport.dto";
import {
  BANK_STATEMENT_EXPORT_COLUMN_GROUPS,
  BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS,
} from "./BankStatementExportDrawer.columns.config";
import {
  buildFilterSummary,
  type BankStatementFilterSummary,
} from "./BankStatementExportDrawer.helper";
import { useBankStatementExportPeriod } from "./BankStatementExportDrawer.period.hook";

export const BANK_STATEMENT_EXPORT_COLUMNS_STORAGE_KEY =
  "v2_bank_statement_export_columns";

/** Đọc cột đã lưu trên trình duyệt; lỗi hoặc rỗng thì dùng mặc định */
function loadSavedColumns(): string[] {
  try {
    const saved = localStorage.getItem(
      BANK_STATEMENT_EXPORT_COLUMNS_STORAGE_KEY,
    );
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
    }
  } catch {
    /* localStorage không khả dụng: dùng mặc định */
  }
  return BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS;
}

const accountLabelOf = (
  type: "bank" | "cash",
  a: BankStatementExportAccount,
) =>
  type === "bank"
    ? `${a.bankCode ?? ""} - ${a.accountNumber ?? ""} (${a.accountName ?? ""})`
    : (a.name ?? "");

export function useBankStatementExportForm(
  type: "bank" | "cash",
  accounts: BankStatementExportAccount[],
  currentFilterSummary?: BankStatementFilterSummaryInput,
) {
  const { t } = useV2Translation();
  const period = useBankStatementExportPeriod();
  const [accountId, setAccountId] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(loadSavedColumns);

  // Tóm tắt bộ lọc bảng, hiển thị ở chế độ "Theo filter hiện tại"
  const filterSummary: BankStatementFilterSummary = buildFilterSummary(
    currentFilterSummary,
    {
      accountLabel: t("v2.bankStatements.export.filter.account", "Tài khoản"),
      transactionTypeLabel: t(
        "v2.bankStatements.export.filter.transactionType",
        "Loại giao dịch",
      ),
      branchLabel: t("v2.bankStatements.export.filter.branch", "Chi nhánh"),
      keywordLabel: t("v2.bankStatements.export.filter.keyword", "Từ khóa"),
      allLabel: t("v2.bankStatements.export.filter.all", "Tất cả"),
      noKeyword: t("v2.bankStatements.export.filter.noKeyword", "Không có"),
    },
  );

  const columnGroups = useMemo<V2ColumnSelectorGroup[]>(
    () =>
      BANK_STATEMENT_EXPORT_COLUMN_GROUPS.map((group) => ({
        key: group.key,
        label: t(group.labelKey, group.key),
        columns: group.columns.map((column) => ({
          key: column.key,
          label: t(column.labelKey, column.key),
        })),
      })),
    [t],
  );

  // `null` là chưa chọn = tất cả (V2Combobox không nhận chuỗi rỗng làm lựa chọn)
  const accountOptions = useMemo<V2ComboboxOption[]>(
    () =>
      accounts.map((a) => ({ value: a.id, label: accountLabelOf(type, a) })),
    [accounts, type],
  );

  const transactionTypeOptions = useMemo<V2ComboboxOption[]>(
    () => [
      {
        value: "IN",
        label: t("v2.bankStatements.export.typeIn", "Tiền vào (Thu)"),
      },
      {
        value: "OUT",
        label: t("v2.bankStatements.export.typeOut", "Tiền ra (Chi)"),
      },
    ],
    [t],
  );

  const handleColumnsChange = (keys: string[]) => {
    setSelectedColumns(keys);
    try {
      localStorage.setItem(
        BANK_STATEMENT_EXPORT_COLUMNS_STORAGE_KEY,
        JSON.stringify(keys),
      );
    } catch {
      /* localStorage không khả dụng: chỉ giữ trong phiên */
    }
  };

  return {
    ...period,
    accountId,
    setAccountId,
    accountOptions,
    transactionType,
    setTransactionType,
    transactionTypeOptions,
    columnGroups,
    selectedColumns,
    setSelectedColumns: handleColumnsChange,
    filterSummary,
  };
}
