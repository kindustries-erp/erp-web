import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import { GarageCashflowDrawerViewSection } from "./GarageCashflowDrawerViewSection";
import { GarageCashflowDrawerEditSection } from "./GarageCashflowDrawerEditSection";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export const GarageCashflowDrawerGeneralSection: React.FC<
  DrawerSectionProps
> = (props) => {
  const t = useT();

  return (
    <DrawerSection
      title={t("garage:cashflowDrawer.generalInfo", "THÔNG TIN CHUNG")}
    >
      {props.mode === "edit" ? (
        <GarageCashflowDrawerEditSection {...props} />
      ) : (
        <GarageCashflowDrawerViewSection voucher={props.voucher} />
      )}
    </DrawerSection>
  );
};
