import * as React from "react";
import { DownloadCloud } from "lucide-react";
import { V2Button, V2TabBar, V2TabBarVariant } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { CostingMethod } from "./stockLedgerCalculator";

export interface StockLedgerToolbarProps {
  costingMethod: CostingMethod;
  onChangeMethod: (method: CostingMethod) => void;
  onExport: () => void;
  exportDisabled?: boolean;
}

export function StockLedgerToolbar({
  costingMethod,
  onChangeMethod,
  onExport,
  exportDisabled,
}: StockLedgerToolbarProps) {
  const { t } = useV2Translation();

  const tabs = React.useMemo(
    () => [
      {
        key: "WEIGHTED_AVG",
        label: t(
          "v2.inventoryMovements.ledger.methods.weightedAvg",
          "Bình quân gia quyền",
        ),
      },
      {
        key: "FIFO",
        label: t("v2.inventoryMovements.ledger.methods.fifo", "FIFO"),
      },
    ],
    [t],
  );

  return (
    <div className="flex items-center gap-2.5">
      {/* Bộ chuyển đổi FIFO / Bình quân gia quyền theo chuẩn V2TabBar */}
      <V2TabBar
        variant={V2TabBarVariant.BUTTON_GROUP}
        activeTabKey={costingMethod}
        onTabChange={(key) => onChangeMethod(key as CostingMethod)}
        tabs={tabs}
      />

      {/* Nút Xuất Excel */}
      <V2Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onExport}
        disabled={exportDisabled}
      >
        <DownloadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>{t("v2.common.exportExcel", "Xuất Excel")}</span>
      </V2Button>
    </div>
  );
}
