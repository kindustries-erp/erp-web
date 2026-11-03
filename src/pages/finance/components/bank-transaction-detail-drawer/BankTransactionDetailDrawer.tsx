import React from "react";
import { BankTransactionDetailDrawer as V2BankTransactionDetailDrawer } from "@/v2/modules/bank-statements";
import type { BankTransactionDetailDrawerProps } from "./BankTransactionDetailDrawer.type";

/**
 * Facade adapter tương thích ngược cho BankTransactionDetailDrawer (V1 -> V2).
 * Tự động chuyển tiếp toàn bộ props sang V2StandardDrawer component mới.
 */
export const BankTransactionDetailDrawer = React.memo(
  function BankTransactionDetailDrawer(
    props: BankTransactionDetailDrawerProps,
  ) {
    return <V2BankTransactionDetailDrawer {...(props as any)} />;
  },
);
