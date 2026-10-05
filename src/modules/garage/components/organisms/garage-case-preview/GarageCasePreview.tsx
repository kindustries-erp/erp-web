import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FileSpreadsheet } from "lucide-react";
import type { GarageCasePreviewProps } from "./GarageCasePreview.type";
import { useGarageCasePreview } from "./GarageCasePreview.hook";
import { QuotePreviewViewSwitch } from "./components/QuotePreviewViewSwitch";
import { QuotePreviewDocument } from "./components/QuotePreviewDocument";
import { QuotePreviewTables } from "./components/QuotePreviewTables";

export function GarageCasePreview(props: GarageCasePreviewProps) {
  const { t } = useTranslation(["garage", "common"]);
  const {
    viewMode,
    setViewMode,
    rawData,
    parts,
    services,
    allLines,
    financialItems,
    profitSummary,
    dateStr,
    partsTotalAmount,
    partsTotalCost,
    servicesTotalAmount,
  } = useGarageCasePreview(props);

  return (
    <DrawerSection
      title={
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
          {t("cases.drawer.quotePreview", "Sổ báo giá & Lợi nhuận dự kiến")}
        </span>
      }
      titleExtra={
        <QuotePreviewViewSwitch
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      }
      collapsible
      defaultCollapsed={false}
      fitViewportHeight
      peekRelatedDeck
      className={props.className}
    >
      {viewMode === "DOCUMENT" ? (
        <QuotePreviewDocument
          caseData={props.caseData}
          rawData={rawData}
          dateStr={dateStr}
          parts={parts}
          services={services}
          partsTotalAmount={partsTotalAmount}
          partsTotalCost={partsTotalCost}
          servicesTotalAmount={servicesTotalAmount}
          profitSummary={profitSummary}
        />
      ) : (
        <QuotePreviewTables lines={allLines} financialItems={financialItems} />
      )}
    </DrawerSection>
  );
}
