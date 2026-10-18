import React from "react";
import {
  BankTransactionPartnerSubTab,
  type BankTransactionPartnerSubTabProps,
} from "./BankTransactionDetailTab/BankTransactionPartnerSubTab";

export type BankTransactionPartnerTabProps = BankTransactionPartnerSubTabProps;

export const BankTransactionPartnerTab = React.memo(
  function BankTransactionPartnerTab(props: BankTransactionPartnerTabProps) {
    return <BankTransactionPartnerSubTab {...props} />;
  },
);
