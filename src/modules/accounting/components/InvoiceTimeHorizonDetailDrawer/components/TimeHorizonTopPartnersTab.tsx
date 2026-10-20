import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { TimeHorizonTopPartnersTable } from "./TimeHorizonTopPartnersTable";
import type { TimeHorizonTopPartnerItem } from "../types";

export interface TimeHorizonTopPartnersTabProps {
  partners: TimeHorizonTopPartnerItem[];
  direction: "IN" | "OUT";
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
  isLoading?: boolean;
  t: (key: string, fallback?: any) => string;
}

export function TimeHorizonTopPartnersTab({
  partners,
  direction,
  onOpenPartnerDetail,
  isLoading,
  t,
}: TimeHorizonTopPartnersTabProps) {
  const sectionTitle = `${t("debts:horizonDrawer.topPartnersSectionTitle", "TOP ĐỐI TÁC CHI PHỐI DÒNG TIỀN")} (${partners.length})`;

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col pt-0.5">
      <DrawerSection
        title={sectionTitle}
        collapsible
        defaultCollapsed={false}
        bodyClassName="p-0"
      >
        <TimeHorizonTopPartnersTable
          partners={partners}
          direction={direction}
          onOpenPartnerDetail={onOpenPartnerDetail}
          isLoading={isLoading}
          t={t}
        />
      </DrawerSection>
    </div>
  );
}
