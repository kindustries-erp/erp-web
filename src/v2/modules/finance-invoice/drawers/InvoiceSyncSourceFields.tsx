import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  InvoiceSyncDirection,
  InvoiceSyncMethod,
} from "./InvoiceSyncDrawer.type";

export interface InvoiceSyncSourceFieldsProps {
  method: InvoiceSyncMethod;
  onMethodChange: (method: InvoiceSyncMethod) => void;
  direction: InvoiceSyncDirection;
  onDirectionChange: (direction: InvoiceSyncDirection) => void;
}

/** Hai nhóm pill: nguồn (hệ thống / file lên) và chiều hóa đơn (mua vào / bán ra) */
export const InvoiceSyncSourceFields: React.FC<
  InvoiceSyncSourceFieldsProps
> = ({ method, onMethodChange, direction, onDirectionChange }) => {
  const { t } = useV2Translation();

  const methodTabs = [
    { key: "GDT", label: t("v2.financeInvoiceSync.source.gdt", "Từ hệ thống") },
    {
      key: "XML",
      label: t("v2.financeInvoiceSync.source.xml", "Tải file lên"),
    },
  ];
  const directionTabs = [
    { key: "IN", label: t("v2.financeInvoiceSync.direction.in", "Mua vào") },
    { key: "OUT", label: t("v2.financeInvoiceSync.direction.out", "Bán ra") },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <V2Text variant="label">
          {t("v2.financeInvoiceSync.source.label", "Nguồn")}
        </V2Text>
        <V2TabBar
          variant="sub"
          stretch
          tabs={methodTabs}
          activeTabKey={method}
          onTabChange={(key) => onMethodChange(key as InvoiceSyncMethod)}
          ariaLabel={t("v2.financeInvoiceSync.source.label", "Nguồn")}
        />
      </div>
      <div className="space-y-1.5">
        <V2Text variant="label">
          {t("v2.financeInvoiceSync.direction.label", "Chiều hóa đơn")}
        </V2Text>
        <V2TabBar
          variant="sub"
          stretch
          tabs={directionTabs}
          activeTabKey={direction}
          onTabChange={(key) => onDirectionChange(key as InvoiceSyncDirection)}
          ariaLabel={t(
            "v2.financeInvoiceSync.direction.label",
            "Chiều hóa đơn",
          )}
        />
      </div>
    </div>
  );
};
