import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  V2ExportConditionSection,
  type V2ExportConditionSectionProps,
} from "@/v2/shared/components/molecules/v2-export-condition-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { InvoicePartnerType } from "../api/dtos/invoiceDebtsExport.dto";

export type InvoiceDebtsExportConditionsProps = Omit<
  V2ExportConditionSectionProps,
  "className" | "children"
> & {
  /** Chưa chọn cột nào thì vô hiệu hóa nút xuất */
  noColumnSelected: boolean;
  partnerType: InvoicePartnerType | undefined;
  onPartnerTypeChange: (next: InvoicePartnerType | undefined) => void;
};

/**
 * Điều kiện xuất dữ liệu báo cáo công nợ:
 * Tích hợp V2ExportConditionSection và thêm trường chọn Đối tượng (Tất cả / Khách hàng / Nhà cung cấp) qua V2TabBar pill.
 */
export const InvoiceDebtsExportConditions: React.FC<
  InvoiceDebtsExportConditionsProps
> = ({ noColumnSelected, partnerType, onPartnerTypeChange, ...props }) => {
  const { t } = useV2Translation();

  const partnerTabs = React.useMemo(
    () => [
      { id: "ALL", label: t("v2.invoiceDebts.export.partnerAll", "Tất cả") },
      {
        id: "CUSTOMER",
        label: t("v2.invoiceDebts.export.customer", "Khách hàng"),
      },
      {
        id: "SUPPLIER",
        label: t("v2.invoiceDebts.export.supplier", "Nhà cung cấp"),
      },
    ],
    [t],
  );

  return (
    <V2ExportConditionSection {...props} startDisabled={noColumnSelected}>
      <div className="space-y-1.5 pt-1">
        <V2Text variant="label">
          {t("v2.invoiceDebts.export.partnerType", "Đối tượng công nợ")}
        </V2Text>
        <V2TabBar
          variant="button-group"
          tabs={partnerTabs}
          activeTabId={partnerType || "ALL"}
          onTabSelect={(id) =>
            onPartnerTypeChange(
              id === "ALL" ? undefined : (id as InvoicePartnerType),
            )
          }
          ariaLabel={t(
            "v2.invoiceDebts.export.partnerType",
            "Đối tượng công nợ",
          )}
        />
      </div>
    </V2ExportConditionSection>
  );
};
