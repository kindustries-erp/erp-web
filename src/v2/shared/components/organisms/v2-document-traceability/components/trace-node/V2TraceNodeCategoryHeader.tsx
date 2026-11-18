import React from "react";
import { BookOpen, CreditCard, Package, Receipt } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type {
  TraceabilityNodeType,
  TraceabilityStageKey,
} from "../../types/traceability.type";
import { getStageForDocType } from "../../utils/traceability.helper";

export interface V2TraceNodeCategoryHeaderProps {
  docType: TraceabilityNodeType;
}

interface StageTheme {
  barCls: string;
  textCls: string;
  numCls: string;
  icon: React.ReactNode;
}

const STAGE_THEMES: Record<TraceabilityStageKey, StageTheme> = {
  ORDER_STOCK: {
    barCls:
      "bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 dark:border-emerald-800/40",
    textCls: "text-emerald-800 dark:text-emerald-300",
    numCls: "text-emerald-700/80 dark:text-emerald-400/80",
    icon: (
      <Package className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  INVOICE: {
    barCls:
      "bg-purple-500/10 dark:bg-purple-950/40 border-b border-purple-500/20 dark:border-purple-800/40",
    textCls: "text-purple-800 dark:text-purple-300",
    numCls: "text-purple-700/80 dark:text-purple-400/80",
    icon: (
      <Receipt className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
    ),
  },
  PAYMENT: {
    barCls:
      "bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 dark:border-amber-800/40",
    textCls: "text-amber-800 dark:text-amber-300",
    numCls: "text-amber-700/80 dark:text-amber-400/80",
    icon: (
      <CreditCard className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
    ),
  },
  GENERAL_LEDGER: {
    barCls:
      "bg-sky-500/10 dark:bg-sky-950/40 border-b border-sky-500/20 dark:border-sky-800/40",
    textCls: "text-sky-800 dark:text-sky-300",
    numCls: "text-sky-700/80 dark:text-sky-400/80",
    icon: (
      <BookOpen className="h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400" />
    ),
  },
};

/** Dải Header phân loại trên đỉnh thẻ chứng từ theo chuẩn Foundry AI Node Editor */
export const V2TraceNodeCategoryHeader = React.memo(
  function V2TraceNodeCategoryHeader({
    docType,
  }: V2TraceNodeCategoryHeaderProps) {
    const { t } = useV2Translation();
    const stage = getStageForDocType(docType);
    const theme = STAGE_THEMES[stage.key] ?? STAGE_THEMES.ORDER_STOCK;
    const stageTitle = t(stage.shortTitleKey);

    return (
      <div
        data-testid="v2-trace-node-category-header"
        className={cn(
          "flex items-center justify-between px-3 py-1.5 transition-colors duration-200",
          theme.barCls,
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {theme.icon}
          <V2Text
            as="span"
            className={cn(
              "truncate font-mono text-[10px] font-bold tracking-wider uppercase",
              theme.textCls,
            )}
          >
            {stageTitle}
          </V2Text>
        </div>
        <V2Text
          as="span"
          className={cn(
            "font-mono text-[10px] font-bold tracking-tight",
            theme.numCls,
          )}
        >
          #{stage.stageNo}
        </V2Text>
      </div>
    );
  },
);
