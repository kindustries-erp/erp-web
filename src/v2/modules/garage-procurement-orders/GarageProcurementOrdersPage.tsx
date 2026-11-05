import { ProcurementListPage } from "@/v2/core/procurement";
import {
  garageProcurementOrdersConfig,
  garageProcurementOrdersDisplay,
} from "./garageProcurementOrders.config";
import "./garageProcurementOrders.locale";

export function GarageProcurementOrdersPage() {
  return (
    <ProcurementListPage
      config={garageProcurementOrdersConfig}
      display={garageProcurementOrdersDisplay}
    />
  );
}
