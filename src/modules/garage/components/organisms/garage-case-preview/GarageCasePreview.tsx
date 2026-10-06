import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FileSpreadsheet } from "lucide-react";
import type { GarageCasePreviewProps } from "./GarageCasePreview.type";
import { useGarageCasePreview } from "./GarageCasePreview.hook";
import { QuotePreviewDocument } from "./components/QuotePreviewDocument";

export function GarageCasePreview(props: GarageCasePreviewProps) {
  const { t } = useTranslation(["garage", "common"]);
  const {
    rawData,
    parts,
    services,
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
      collapsible
      defaultCollapsed={false}
      fitViewportHeight
      peekRelatedDeck
      className={props.className}
    >
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
    </DrawerSection>
  );
}
