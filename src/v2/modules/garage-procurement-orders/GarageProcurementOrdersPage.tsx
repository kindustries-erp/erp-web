import * as React from "react";
import { ClipboardList, ShoppingCart } from "lucide-react";
import { ProcurementListPage } from "@/v2/core/procurement";
import { useAppStore } from "@/core/config/appStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2TabComboboxItem } from "@/v2/shared/components/molecules/v2-tab-combobox";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "./garageProcurementOrders.config";
import "./garageProcurementOrders.locale";

export function GarageProcurementOrdersPage() {
  const navigate = useAppStore((s) => s.navigate);
  const { t } = useV2Translation();

  const pageTabs = React.useMemo<V2TabComboboxItem[]>(
    () => [
      {
        value: "garage-procurement-requests",
        label: t("v2.garageProcurementRequests.tab", "Đề nghị mua hàng"),
        icon: <ClipboardList className="h-3.5 w-3.5 shrink-0" />,
      },
      {
        value: "garage-procurement-orders",
        label: t("v2.garageProcurementOrders.tab", "Đơn mua hàng"),
        icon: <ShoppingCart className="h-3.5 w-3.5 shrink-0" />,
      },
    ],
    [t],
  );

  return (
    <ProcurementListPage
      config={garageProcurementOrdersConfig}
      display={garageProcurementOrdersDisplay}
      pageTabs={pageTabs}
      activePageTab="garage-procurement-orders"
      onPageTabSelect={(key) => navigate(key as any)}
    />
  );
}
