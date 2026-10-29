import * as React from "react";
import {
  KeyRound,
  RefreshCw,
  V2Button,
  V2Text,
} from "@/v2/shared/components/atoms";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2ExportPeriodFields } from "@/v2/shared/components/molecules/v2-export-condition-section";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { InvoiceSyncPeriodState } from "./InvoiceSyncDrawer.period.hook";
import type {
  InvoiceSyncDirection,
  InvoiceSyncDrawerProps,
  InvoiceSyncMethod,
} from "./InvoiceSyncDrawer.type";

export interface InvoiceSyncConditionsProps extends Pick<
  InvoiceSyncDrawerProps,
  | "direction"
  | "onDirectionChange"
  | "method"
  | "onMethodChange"
  | "canEditInvoice"
  | "noCredential"
  | "syncing"
  | "bulkXmlLoading"
  | "onOpenLogin"
  | "onBulkXml"
  | "onSync"
> {
  period: InvoiceSyncPeriodState;
  estimatedRuns: number;
  windowDays: number;
}

/** Cột phải: chọn chiều, nguồn, kỳ đồng bộ và các nút thao tác GDT */
export const InvoiceSyncConditions: React.FC<InvoiceSyncConditionsProps> = ({
  direction,
  onDirectionChange,
  method,
  onMethodChange,
  canEditInvoice,
  noCredential,
  syncing,
  bulkXmlLoading,
  onOpenLogin,
  onBulkXml,
  onSync,
  period,
  estimatedRuns,
  windowDays,
}) => {
  const { t } = useV2Translation();
  const busy = syncing || bulkXmlLoading;

  const directionOptions = [
    {
      value: "IN",
      label: t("v2.financeInvoiceSync.direction.in", "Hóa đơn mua vào"),
    },
    {
      value: "OUT",
      label: t("v2.financeInvoiceSync.direction.out", "Hóa đơn bán ra"),
    },
  ];
  const methodOptions = [
    {
      value: "GDT",
      label: t("v2.financeInvoiceSync.method.gdt", "Từ hệ thống GDT"),
    },
    {
      value: "XML",
      label: t("v2.financeInvoiceSync.method.xml", "Tải file từ máy tính"),
    },
  ];

  return (
    <div className="space-y-4">
      <DrawerSection
        title={t("v2.financeInvoiceSync.conditions.title", "Điều kiện đồng bộ")}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <V2Combobox
            options={directionOptions}
            value={direction}
            onValueChange={(v) =>
              v && onDirectionChange(v as InvoiceSyncDirection)
            }
            searchable={false}
            aria-label={t(
              "v2.financeInvoiceSync.direction.label",
              "Chiều hóa đơn",
            )}
          />
          <V2Combobox
            options={methodOptions}
            value={method}
            onValueChange={(v) => v && onMethodChange(v as InvoiceSyncMethod)}
            searchable={false}
            aria-label={t("v2.financeInvoiceSync.method.label", "Nguồn")}
          />
        </div>
      </DrawerSection>

      {method === "GDT" && (
        <DrawerSection
          title={t("v2.financeInvoiceSync.gdt.title", "Từ hệ thống GDT")}
        >
          <div className="space-y-4">
            <V2ExportPeriodFields
              periodType={period.periodType}
              onPeriodTypeChange={period.handlePeriodTypeChange}
              period={period.period}
              onPeriodChange={period.handlePeriodChange}
              periodOptions={period.periodOptions}
              quarter={period.quarter}
              onQuarterChange={period.handleQuarterChange}
              quarterOptions={period.quarterOptions}
              year={period.year}
              onYearChange={period.handleYearChange}
              yearOptions={period.yearOptions}
              dateFrom={period.dateFrom}
              onDateFromChange={period.setDateFrom}
              dateTo={period.dateTo}
              onDateToChange={period.setDateTo}
            />

            <V2Text variant="helper">
              {t("v2.financeInvoiceSync.gdt.estimate", {
                defaultValue:
                  "Ước tính {{count}} lượt quét ({{days}} ngày/lượt)",
                count: estimatedRuns,
                days: windowDays,
              })}
            </V2Text>

            {noCredential && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {t(
                  "v2.financeInvoiceSync.gdt.noCredential",
                  "Vui lòng cấu hình tài khoản Cổng thuế trước",
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                {canEditInvoice && (
                  <V2Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenLogin}
                    className="gap-1.5"
                  >
                    <KeyRound className="h-4 w-4 text-primary" />
                    {t(
                      "v2.financeInvoiceSync.gdt.login",
                      "Đăng nhập Cổng Thuế",
                    )}
                  </V2Button>
                )}
                <V2Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkXml}
                  disabled={busy || noCredential}
                  className="gap-1.5"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${bulkXmlLoading ? "animate-spin" : ""}`}
                  />
                  {bulkXmlLoading
                    ? t(
                        "v2.financeInvoiceSync.gdt.bulkXmlLoading",
                        "Đang xử lý...",
                      )
                    : t("v2.financeInvoiceSync.gdt.bulkXml", "Tải lại XML")}
                </V2Button>
              </div>
              <V2Button
                onClick={onSync}
                disabled={busy || noCredential}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing
                  ? t("v2.financeInvoiceSync.gdt.syncing", "Đang xử lý...")
                  : t("v2.financeInvoiceSync.gdt.sync", "Bắt đầu đồng bộ")}
              </V2Button>
            </div>
          </div>
        </DrawerSection>
      )}
    </div>
  );
};
