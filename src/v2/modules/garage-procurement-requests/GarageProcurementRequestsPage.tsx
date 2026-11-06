import { ProcurementListPage } from "@/v2/core/procurement";
import {
  garageProcurementRequestsConfig,
  garageProcurementRequestsDisplay,
} from "./garageProcurementRequests.config";
import "./garageProcurementRequests.locale";

export function GarageProcurementRequestsPage() {
  return (
    <ProcurementListPage
      config={garageProcurementRequestsConfig}
      display={garageProcurementRequestsDisplay}
    />
  );
}
