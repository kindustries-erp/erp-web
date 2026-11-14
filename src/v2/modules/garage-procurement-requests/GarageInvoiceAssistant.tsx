import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AiInvoiceAssistant,
  type AiCreateRequestResult,
  createAiInvoiceApi,
} from "@/v2/core/ai-hub";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { garageProcurementRequestsConfig } from "./garageProcurementRequests.config";

/** API trợ lý hóa đơn của garage (module ai-hub-garage, API v2). */
export const garageInvoiceAssistantApi = createAiInvoiceApi(
  "/api/v2/ai-hub-garage",
);

export interface GarageInvoiceAssistantProps {
  /** Mở phiếu vừa tạo (id của đề nghị mua) */
  onCreated: (requestId: string) => void;
}

/**
 * Trợ lý AI đọc hóa đơn cho trang đề nghị mua garage.
 * Chỉ hiện khi người dùng có quyền dùng trợ lý và quyền tạo đề nghị mua.
 */
export function GarageInvoiceAssistant({
  onCreated,
}: GarageInvoiceAssistantProps) {
  const queryClient = useQueryClient();
  const canUseAi = useV2HasPermission({
    collection: "ai_hub_garage",
    action: "create",
  });
  const canCreateRequest = useV2HasPermission({
    collection: garageProcurementRequestsConfig.permissionCollection,
    action: "create",
  });

  const handleCreated = React.useCallback(
    (result: AiCreateRequestResult) => {
      void queryClient.invalidateQueries({
        queryKey: [garageProcurementRequestsConfig.queryKey],
      });
      onCreated(result.requestId);
    },
    [onCreated, queryClient],
  );

  if (!canUseAi || !canCreateRequest) return null;
  return (
    <AiInvoiceAssistant
      api={garageInvoiceAssistantApi}
      onCreated={handleCreated}
    />
  );
}
