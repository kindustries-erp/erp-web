import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  garageCashflowApi,
  type GarageCashflowQueryParams,
  type CreateGarageCashflowPayload,
  type UpdateGarageCashflowPayload,
} from "../api/garageCashflowApi";

export const GARAGE_CASHFLOW_QUERY_KEY = "garage-cashflow-list";
export const GARAGE_CASHFLOW_OPTIONS_KEY = "garage-cashflow-options";

export function useGarageCashflowList(params?: GarageCashflowQueryParams) {
  return useQuery({
    queryKey: [GARAGE_CASHFLOW_QUERY_KEY, params],
    queryFn: () => garageCashflowApi.getCashflow(params),
    staleTime: 10_000,
  });
}

export function useGarageCashflowColumnOptions() {
  return useQuery({
    queryKey: [GARAGE_CASHFLOW_OPTIONS_KEY],
    queryFn: () => garageCashflowApi.getColumnOptions(),
    staleTime: 60_000,
  });
}

export function useCreateGarageCashflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGarageCashflowPayload) =>
      garageCashflowApi.createCashflow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GARAGE_CASHFLOW_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["garage-cases"] });
      queryClient.invalidateQueries({ queryKey: ["garage-case"] });
    },
  });
}

export function useUpdateGarageCashflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGarageCashflowPayload;
    }) => garageCashflowApi.updateCashflow(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GARAGE_CASHFLOW_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["garage-cases"] });
      queryClient.invalidateQueries({ queryKey: ["garage-case"] });
    },
  });
}

export function useDeleteGarageCashflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => garageCashflowApi.deleteCashflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GARAGE_CASHFLOW_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["garage-cases"] });
      queryClient.invalidateQueries({ queryKey: ["garage-case"] });
    },
  });
}
