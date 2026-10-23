import { KeyRound, RefreshCw } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import type { usePortalSync } from "@/modules/erp-invoices-core/hooks/usePortalSync";
import type { getPastMonthPresets } from "@/shared/utils/datePresets";
import { InvoiceGdtDateRange } from "./InvoiceGdtDateRange";
import { InvoiceGdtSyncResult } from "./InvoiceGdtSyncResult";

export interface InvoiceGdtSyncPanelProps {
  portal: ReturnType<typeof usePortalSync>;
  canEditInvoice: boolean;
  presetOptions: ReturnType<typeof getPastMonthPresets>;
  selectedPreset: string;
  setSelectedPreset: (val: string) => void;
  bulkXmlLoading: boolean;
  onOpenConfig: () => void;
  onBulkXml: () => void;
  onSync: () => void;
}

export function InvoiceGdtSyncPanel({
  portal,
  canEditInvoice,
  presetOptions,
  selectedPreset,
  setSelectedPreset,
  bulkXmlLoading,
  onOpenConfig,
  onBulkXml,
  onSync,
}: InvoiceGdtSyncPanelProps) {
  const noCredential = !portal.token && !portal.hasPassword;
  const noCredentialTitle = noCredential
    ? "Vui lòng cấu hình tài khoản Cổng thuế trước"
    : "";

  return (
    <div className="flex flex-col gap-4">
      <InvoiceGdtDateRange
        dateFrom={portal.dateFrom}
        dateTo={portal.dateTo}
        setDateFrom={portal.setDateFrom}
        setDateTo={portal.setDateTo}
        presetOptions={presetOptions}
        selectedPreset={selectedPreset}
        setSelectedPreset={setSelectedPreset}
      />

      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          {canEditInvoice && (
            <V2Button
              variant="outline"
              size="sm"
              onClick={onOpenConfig}
              className="gap-1.5"
            >
              <KeyRound className="h-4 w-4 text-primary" />
              Đăng nhập Cổng Thuế
            </V2Button>
          )}
          <div title={noCredentialTitle}>
            <V2Button
              variant="outline"
              size="sm"
              onClick={onBulkXml}
              disabled={bulkXmlLoading || portal.loading || noCredential}
              className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${bulkXmlLoading ? "animate-spin" : ""}`}
              />
              {bulkXmlLoading ? "Đang xử lý..." : "Tải lại XML"}
            </V2Button>
          </div>
        </div>

        <div title={noCredentialTitle}>
          <V2Button
            onClick={onSync}
            disabled={portal.loading || bulkXmlLoading || noCredential}
            className="gap-2 w-36 justify-center disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${portal.loading ? "animate-spin" : ""}`}
            />
            {portal.loading ? "Đang xử lý..." : "Bắt đầu đồng bộ"}
          </V2Button>
        </div>
      </div>

      {portal.result && <InvoiceGdtSyncResult result={portal.result} />}
    </div>
  );
}
