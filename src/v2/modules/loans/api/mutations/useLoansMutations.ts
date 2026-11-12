import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loansApi } from "../loansApi";
import { loansKeys } from "../queries/loansKeys";
import {
  CreateLoanPayload,
  RecordPaymentPayload,
  UpdateLoanPayload,
} from "../dtos/loan-api.types";

export function useCreateLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLoanPayload) => loansApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: loansKeys.all });
    },
  });
}

export function useCreateBatchLoansMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { loans: CreateLoanPayload[] }) =>
      loansApi.createBatch(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: loansKeys.all });
    },
  });
}

export function useUpdateLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLoanPayload }) =>
      loansApi.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: loansKeys.all });
      void queryClient.invalidateQueries({
        queryKey: loansKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => loansApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: loansKeys.all });
    },
  });
}

export function usePurgeLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => loansApi.purge(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: loansKeys.all });
    },
  });
}

export function useRecordPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      loanId,
      payload,
    }: {
      loanId: string;
      payload: RecordPaymentPayload;
    }) => loansApi.recordPayment(loanId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: loansKeys.all });
      void queryClient.invalidateQueries({
        queryKey: loansKeys.detail(variables.loanId),
      });
    },
  });
}
