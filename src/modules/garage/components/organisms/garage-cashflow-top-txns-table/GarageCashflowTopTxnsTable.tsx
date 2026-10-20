import React from "react";
import { Panel } from "@/shared/components/Panel";
import { useT } from "@/core/i18n";
import { CashflowTopRow } from "../../molecules/cashflow-top-row";
import type { GarageCashflowTopTxnsTableProps } from "./GarageCashflowTopTxnsTable.type";

export const GarageCashflowTopTxnsTable: React.FC<
  GarageCashflowTopTxnsTableProps
> = ({ topTransactions, loading = false, onClickItem, onClickCase }) => {
  const t = useT();
  const topIn = topTransactions?.in || [];
  const topOut = topTransactions?.out || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel
        title={t(
          "garage.cashflow.topTxns.topInTitle",
          "Top giao dịch thu lớn nhất",
        )}
      >
        <div className="flex flex-col gap-1 min-h-[160px]">
          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 bg-muted/60 rounded animate-pulse"
                />
              ))}
            </div>
          ) : topIn.length > 0 ? (
            topIn.map((item, idx) => (
              <CashflowTopRow
                key={item.id}
                item={item}
                type="RECEIPT"
                index={idx}
                onClickItem={onClickItem}
                onClickCase={onClickCase}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              {t("common.noData", "Chưa có dữ liệu")}
            </div>
          )}
        </div>
      </Panel>

      <Panel
        title={t(
          "garage.cashflow.topTxns.topOutTitle",
          "Top giao dịch chi lớn nhất",
        )}
      >
        <div className="flex flex-col gap-1 min-h-[160px]">
          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 bg-muted/60 rounded animate-pulse"
                />
              ))}
            </div>
          ) : topOut.length > 0 ? (
            topOut.map((item, idx) => (
              <CashflowTopRow
                key={item.id}
                item={item}
                type="PAYMENT"
                index={idx}
                onClickItem={onClickItem}
                onClickCase={onClickCase}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              {t("common.noData", "Chưa có dữ liệu")}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};
