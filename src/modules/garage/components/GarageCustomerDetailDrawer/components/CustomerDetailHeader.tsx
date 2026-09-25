import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { Building2, RefreshCw } from "lucide-react";

interface CustomerDetailHeaderProps {
  customerCode: string | null;
  customerName?: string;
  branchId?: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const CustomerDetailHeader = React.memo(function CustomerDetailHeader({
  customerCode,
  customerName,
  branchId,
  onRefresh,
  isLoading,
}: CustomerDetailHeaderProps) {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground">
              {customerName ||
                customerCode ||
                t("customers.unknownCustomer", "Khách hàng")}
            </h3>
            {customerCode && (
              <Badge variant="secondary" className="font-mono text-xs">
                {customerCode}
              </Badge>
            )}
            {branchId && (
              <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60">
                {branchId}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "customers.drawer.title",
              "Hồ sơ công nợ & Lịch sử phiếu dịch vụ tại xưởng",
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 text-xs gap-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>{t("common:refresh", "Làm mới")}</span>
        </Button>
      </div>
    </div>
  );
});
