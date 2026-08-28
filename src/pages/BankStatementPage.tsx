import React from "react";
import { BankStatementsTab } from "@/modules/bank-statements/components/BankStatementsTab";

export const BankStatementPage = ({ type }: { type: "bank" | "cash" }) => {
  return <BankStatementsTab type={type} />;
};
