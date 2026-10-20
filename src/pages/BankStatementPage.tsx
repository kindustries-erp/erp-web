import React from "react";
import { BankStatementsTab } from "@/modules/bank-statements/components/BankStatementsTab";

export interface BankStatementPageProps {
  type?: "bank" | "cash";
  initialTab?: "dashboard" | "bank" | "cash";
  instanceIndex?: 1 | 2;
}

export const BankStatementPage = ({
  type,
  initialTab,
  instanceIndex = 1,
}: BankStatementPageProps = {}) => {
  const targetTab = type || initialTab;
  return (
    <BankStatementsTab initialTab={targetTab} instanceIndex={instanceIndex} />
  );
};
