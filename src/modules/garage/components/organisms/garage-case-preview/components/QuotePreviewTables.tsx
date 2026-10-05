import React from "react";
import { useTranslation } from "react-i18next";
import { Wrench, DollarSign } from "lucide-react";
import type {
  QuoteFinancialItem,
  QuoteLineItem,
} from "../GarageCasePreview.type";
import { QuoteLinesTable } from "./tables/QuoteLinesTable";
import { QuoteFinancialsTable } from "./tables/QuoteFinancialsTable";

export interface QuotePreviewTablesProps {
  lines: QuoteLineItem[];
  financialItems: QuoteFinancialItem[];
  loading?: boolean;
}

export function QuotePreviewTables({
  lines,
  financialItems,
  loading = false,
}: QuotePreviewTablesProps) {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="w-full space-y-6 pt-1">
      {/* Section 1: Detailed Lines */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t(
                "cases.quotePreview.tableLinesTitle",
                "1. Bảng chi tiết vật tư & nhân công dịch vụ",
              )}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              ({lines.length})
            </span>
          </div>
        </div>

        <QuoteLinesTable lines={lines} loading={loading} />
      </div>

      {/* Section 2: Cashflow, Tax & Commission */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t(
                "cases.quotePreview.tableFinancialTitle",
                "2. Bảng tổng hợp dòng tiền, thuế & hoa hồng",
              )}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              ({financialItems.length})
            </span>
          </div>
        </div>

        <QuoteFinancialsTable items={financialItems} loading={loading} />
      </div>
    </div>
  );
}
