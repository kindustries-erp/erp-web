import React, { useMemo } from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2FormGrid } from "@/v2/shared/components/molecules/v2-form-grid";
import { useT } from "@/core/i18n";
import { buildSettlementFieldConfigs } from "./garageCashflowDrawer.settlementFields";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export const GarageCashflowDrawerSettlementSection: React.FC<
  DrawerSectionProps
> = ({ mode, voucher, formData, setFormData }) => {
  const t = useT();

  const fields = useMemo(
    () => buildSettlementFieldConfigs({ voucher, t }),
    [voucher, t],
  );

  return (
    <DrawerSection
      title={t("garage:cashflowDrawer.settlementTitle", "THAM CHIẾU LIÊN KẾT")}
      collapsible
      defaultCollapsed={false}
    >
      <V2FormGrid
        fields={fields}
        values={formData}
        onChange={(name, val) =>
          setFormData((prev) => ({ ...prev, [name]: val }))
        }
        viewing={mode === "view"}
      />
    </DrawerSection>
  );
};
