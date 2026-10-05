import { useState, useMemo, useEffect } from "react";
import { useT } from "@/core/i18n";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";

export interface UseBankStatementExportFormProps {
  type: "bank" | "cash";
  accountsData: any[];
}

export function useBankStatementExportForm({
  type,
  accountsData,
}: UseBankStatementExportFormProps) {
  const t = useT();

  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("custom");
      return;
    }
    setPeriod(value);
    setDateFrom(periodFirstDay(value));
    setDateTo(periodLastDay(value));
  };

  useEffect(() => {
    const nextPeriod = periodFromExactRange(dateFrom, dateTo);
    setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
  }, [dateFrom, dateTo]);

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
    period,
    handlePeriodChange,
    periodOptions,
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
  };
}
