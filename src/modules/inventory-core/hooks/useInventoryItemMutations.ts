import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/hooks/useAppQuery";
import { createInventoryItemsListKey } from "@/shared/lib/queryKeys";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";

export interface InventoryItemSaveVariables {
  id?: string;
  payload: CreateInventoryItemPayload;
}

export interface InventoryItemDeleteVariables {
  id: string;
}

function getInventoryItemsBaseKey() {
  return ["inventory-items", "list"] as const;
}

export function useInventoryItemSaveMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<ErpInventoryItem, Error, InventoryItemSaveVariables>({
    mutationFn: async ({ id, payload }) => {
      if (id) return inventoryCoreApi.update(id, payload);
      return inventoryCoreApi.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getInventoryItemsBaseKey(),
      });
    },
  });
}

export function useInventoryItemDeleteMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<void, Error, InventoryItemDeleteVariables>({
    mutationFn: async ({ id }) => inventoryCoreApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getInventoryItemsBaseKey(),
      });
    },
  });
}
