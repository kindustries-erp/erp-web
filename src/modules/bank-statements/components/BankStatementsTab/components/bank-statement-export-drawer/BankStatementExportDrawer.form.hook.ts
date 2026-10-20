import { useState, useMemo, useEffect } from "react";
import { useT } from "@/core/i18n";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  generateQuarterOptions,
  initQuarter,
  quarterFirstDay,
  quarterFromExactRange,
  quarterLastDay,
} from "./BankStatementExportDrawer.quarter.helper";
import { DEFAULT_BANK_STATEMENT_EXPORT_COLUMNS } from "./BankStatementExportDrawer.columns.config";
import type { BankStatementPeriodType } from "./BankStatementExportDrawer.type";

export const BANK_STATEMENT_EXPORT_COLUMNS_STORAGE_KEY =
  "bank_statement_export_columns";

export interface UseBankStatementExportFormProps {
  type: "bank" | "cash";
  accountsData: any[];
}

function loadSavedColumns(): string[] {
  try {
    const saved = localStorage.getItem(
      BANK_STATEMENT_EXPORT_COLUMNS_STORAGE_KEY,
    );
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* empty */
  }
  return DEFAULT_BANK_STATEMENT_EXPORT_COLUMNS;
}

export function useBankStatementExportForm({
  type,
  accountsData,
}: UseBankStatementExportFormProps) {
  const t = useT();

  const [periodType, setPeriodType] =
    useState<BankStatementPeriodType>("month");
  const [period, setPeriod] = useState(initPeriod());
  const [quarter, setQuarter] = useState(initQuarter());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(loadSavedColumns);

  const handlePeriodTypeChange = (nextType: BankStatementPeriodType) => {
    setPeriodType(nextType);
    if (nextType === "month") {
      const activePeriod = period || initPeriod();
      setPeriod(activePeriod);
      setDateFrom(periodFirstDay(activePeriod));
      setDateTo(periodLastDay(activePeriod));
    } else if (nextType === "quarter") {
      const activeQuarter = quarter || initQuarter();
      setQuarter(activeQuarter);
      setDateFrom(quarterFirstDay(activeQuarter));
      setDateTo(quarterLastDay(activeQuarter));
    }
  };

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("");
      return;
    }
    setPeriod(value);
    setDateFrom(periodFirstDay(value));
    setDateTo(periodLastDay(value));
  };

  const handleQuarterChange = (next?: string) => {
    const value = next || "";
    setQuarter(value);
    if (value) {
      setDateFrom(quarterFirstDay(value));
      setDateTo(quarterLastDay(value));
    }
  };

  const handleColumnsChange = (cols: string[]) => {
    setSelectedColumns(cols);
    try {
      localStorage.setItem(
        BANK_STATEMENT_EXPORT_COLUMNS_STORAGE_KEY,
        JSON.stringify(cols),
      );
    } catch {
      /* empty */
    }
  };

  const handleResetDefaultColumns = () => {
    handleColumnsChange(DEFAULT_BANK_STATEMENT_EXPORT_COLUMNS);
  };

  useEffect(() => {
    if (periodType === "month") {
      const nextPeriod = periodFromExactRange(dateFrom, dateTo);
      setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
    } else if (periodType === "quarter") {
      const nextQuarter = quarterFromExactRange(dateFrom, dateTo);
      setQuarter((prev) => (prev === nextQuarter ? prev : nextQuarter));
    }
  }, [dateFrom, dateTo, periodType]);

  const periodOptions = useMemo(
    () => [
      ...PERIOD_OPTS,
      {
        value: "custom",
        label: t("bankStatement.exportCustomRange", "Tùy chỉnh khoảng ngày"),
      },
    ],
    [t],
  );

  const quarterOptions = useMemo(() => generateQuarterOptions(3), []);

  const accountOptions = useMemo(() => {
    const defaultLabel =
      type === "bank"
        ? t("bankStatement.allBankAccounts", "Tất cả tài khoản ngân hàng")
        : t("bankStatement.allCashBooks", "Tất cả sổ quỹ");

    return [
      { value: "", label: defaultLabel },
      ...accountsData.map((a: any) => ({
        value: a.id,
        label:
          type === "bank"
            ? `${a.bankCode} - ${a.accountNumber} (${a.accountName || ""})`
            : a.name,
      })),
    ];
  }, [accountsData, type, t]);

  const transactionTypeOptions = useMemo(
    () => [
      {
        value: "",
        label: t("bankStatement.allTypes", "Tất cả loại giao dịch"),
      },
      { value: "IN", label: t("bankStatement.typeIn", "Tiền vào (Thu)") },
      { value: "OUT", label: t("bankStatement.typeOut", "Tiền ra (Chi)") },
    ],
    [t],
  );

  return {
    periodType,
    handlePeriodTypeChange,
    period,
    handlePeriodChange,
    periodOptions,
    quarter,
    handleQuarterChange,
    quarterOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedAccountId,
    setSelectedAccountId,
    accountOptions,
    transactionType,
    setTransactionType,
    transactionTypeOptions,
    selectedColumns,
    handleColumnsChange,
    handleResetDefaultColumns,
  };
}
