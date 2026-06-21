import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/hooks/useAppQuery";
import {
  inventoryCoreApi,
  type CreateInventoryMasterPayload,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";

export type InventoryMasterMutationKind =
  | "uom"
  | "item-type"
  | "tracking-category";

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
  return [
    "inventory-masters",
    kind === "uom"
      ? "uoms"
      : kind === "item-type"
        ? "item-types"
        : "tracking-categories",
  ] as const;
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
      if (kind === "item-type") {
        if (id) return inventoryCoreApi.updateItemType(id, payload);
        return inventoryCoreApi.createItemType(payload);
      }
      if (id) return inventoryCoreApi.updateTrackingCategory(id, payload);
      return inventoryCoreApi.createTrackingCategory(payload);
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
      if (kind === "item-type") return inventoryCoreApi.deleteItemType(id);
      return inventoryCoreApi.deleteTrackingCategory(id);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(variables.kind),
      });
    },
  });
}
