import * as React from "react";
import { Play, V2Button, V2Text } from "@/v2/shared/components/atoms";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2PeriodPicker } from "@/v2/shared/components/organisms/v2-period-picker";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { InvoiceSyncCredentialRow } from "./InvoiceSyncCredentialRow";
import { InvoiceSyncSourceFields } from "./InvoiceSyncSourceFields";
import type { InvoiceSyncPeriodState } from "./InvoiceSyncDrawer.period.hook";
import type { InvoiceSyncDrawerProps } from "./InvoiceSyncDrawer.type";

export interface InvoiceSyncConditionsProps extends Pick<
  InvoiceSyncDrawerProps,
  | "direction"
  | "onDirectionChange"
  | "method"
  | "onMethodChange"
  | "canEditInvoice"
  | "noCredential"
  | "syncing"
  | "onOpenLogin"
  | "onSync"
> {
  period: InvoiceSyncPeriodState;
  estimatedRuns: number;
  windowDays: number;
}

/**
 * Một section "Điều kiện đồng bộ" ở cột phải, bố cục như "Điều kiện xuất dữ liệu" của drawer Garage:
 * nguồn, chiều, trạng thái tài khoản, kỳ, ước tính và nút đồng bộ full width.
 */
export const InvoiceSyncConditions: React.FC<InvoiceSyncConditionsProps> = ({
  direction,
  onDirectionChange,
  method,
  onMethodChange,
  canEditInvoice,
  noCredential,
  syncing,
  onOpenLogin,
  onSync,
  period,
  estimatedRuns,
  windowDays,
}) => {
  const { t } = useV2Translation();
  const isGdt = method === "GDT";

  return (
    <DrawerSection
      title={t("v2.financeInvoiceSync.conditions.title", "Điều kiện đồng bộ")}
      collapsible
      defaultCollapsed={false}
      className="border-transparent dark:border-transparent"
    >
      <div className="space-y-4">
        <InvoiceSyncSourceFields
          method={method}
          onMethodChange={onMethodChange}
          direction={direction}
          onDirectionChange={onDirectionChange}
        />

        {isGdt && (
          <>
            <InvoiceSyncCredentialRow
              noCredential={noCredential}
              canEditInvoice={canEditInvoice}
              onOpenLogin={onOpenLogin}
            />

            <div className="space-y-1.5">
              <V2Text variant="label">
                {t("v2.financeInvoiceSync.period.label", "Kỳ đồng bộ")}
              </V2Text>
              <V2PeriodPicker
                unit={period.unit}
                onUnitChange={period.handleUnitChange}
                period={period.period}
                onPeriodChange={period.handlePeriodChange}
                periodOptions={period.periodOptions}
                dateFrom={period.dateFrom}
                onDateFromChange={period.setDateFrom}
                dateTo={period.dateTo}
                onDateToChange={period.setDateTo}
              />
            </div>

            <V2Text variant="helper">
              {t("v2.financeInvoiceSync.gdt.estimate", {
                defaultValue:
                  "Ước tính {{count}} lượt quét ({{days}} ngày/lượt)",
                count: estimatedRuns,
                days: windowDays,
              })}
            </V2Text>

            <V2Button
              variant="primary"
              fullWidth
              isLoading={syncing}
              loadingText={t(
                "v2.financeInvoiceSync.gdt.syncing",
                "Đang xử lý...",
              )}
              disabled={syncing || noCredential}
              leftIcon={<Play className="h-4 w-4" />}
              onClick={onSync}
            >
              {t("v2.financeInvoiceSync.gdt.sync", "Bắt đầu đồng bộ")}
            </V2Button>
          </>
        )}
      </div>
    </DrawerSection>
  );
};
