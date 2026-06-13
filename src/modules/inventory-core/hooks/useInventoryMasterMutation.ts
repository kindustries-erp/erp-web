import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/hooks/useAppQuery";
import {
  inventoryCoreApi,
  type CreateInventoryMasterPayload,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";

export type InventoryMasterMutationKind = "uom" | "item-type";

export interface InventoryMasterSaveVariables {
  kind: InventoryMasterMutationKind;
  id?: string;
  payload: CreateInventoryMasterPayload;
}

export interface InventoryMasterDeleteVariables {
  kind: InventoryMasterMutationKind;
  id: string;
}

function getQueryKey(kind: InventoryMasterMutationKind) {
  return ["inventory-masters", kind === "uom" ? "uoms" : "item-types"] as const;
}

export function useInventoryMasterSaveMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<
    InventoryMasterOption,
    Error,
    InventoryMasterSaveVariables
  >({
    mutationFn: async ({ kind, id, payload }) => {
      if (kind === "uom") {
        if (id) return inventoryCoreApi.updateUom(id, payload);
        return inventoryCoreApi.createUom(payload);
      }

      if (id) return inventoryCoreApi.updateItemType(id, payload);
      return inventoryCoreApi.createItemType(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(variables.kind),
      });
    },
  });
}

export function useInventoryMasterDeleteMutation() {
  const queryClient = useQueryClient();

  return useAppMutation<void, Error, InventoryMasterDeleteVariables>({
    mutationFn: async ({ kind, id }) => {
      if (kind === "uom") return inventoryCoreApi.deleteUom(id);
      return inventoryCoreApi.deleteItemType(id);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(variables.kind),
      });
    },
  });
}
