import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";
import { toast } from "react-hot-toast";

export const useGarageBranches = () => {
  return useQuery({
    queryKey: ["garage-branches"],
    queryFn: garageApi.getBranches,
  });
};

export const useGarageCases = (
  branchId?: string,
  page: number = 1,
  pageSize: number = 20,
  q: string = "",
) => {
  return useQuery({
    queryKey: ["garage-cases", branchId, page, pageSize, q],
    queryFn: () => garageApi.getCases(branchId, page, pageSize, q),
    enabled: !!branchId,
  });
};

export function useGarageDashboard(
  branchId?: string,
  from?: string,
  to?: string,
) {
  return useQuery({
    queryKey: ["garage", "dashboard", branchId, from, to],
    queryFn: () => garageApi.getDashboard(branchId!, from, to),
    enabled: !!branchId,
  });
}

export function useGarageReceivables(branchId?: string) {
  return useQuery({
    queryKey: ["garage", "receivables", branchId],
    queryFn: () => garageApi.getReceivables(branchId!),
    enabled: !!branchId,
  });
}

export function useGaragePayables(branchId?: string) {
  return useQuery({
    queryKey: ["garage", "payables", branchId],
    queryFn: () => garageApi.getPayables(branchId!),
    enabled: !!branchId,
  });
}

export function useGarageCaseServices(caseId?: string) {
  return useQuery({
    queryKey: ["garage", "caseServices", caseId],
    queryFn: () => garageApi.getCaseServices(caseId!),
    enabled: !!caseId,
  });
}

export function useGarageCasePayments(caseId?: string) {
  return useQuery({
    queryKey: ["garage", "casePayments", caseId],
    queryFn: () => garageApi.getCasePayments(caseId!),
    enabled: !!caseId,
  });
}

export const useSyncGarageBranches = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: garageApi.syncBranches,
    onSuccess: () => {
      toast.success("Branches synced successfully");
      qc.invalidateQueries({ queryKey: ["garage-branches"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to sync branches");
    },
  });
};

export const useSyncGarageCases = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      branchId,
      from,
      to,
    }: {
      branchId: string;
      from?: string;
      to?: string;
    }) => garageApi.syncCases(branchId, from, to),
    onSuccess: (_, { branchId }) => {
      toast.success("Cases synced successfully");
      qc.invalidateQueries({ queryKey: ["garage-cases", branchId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to sync cases");
    },
  });
};

export function useSyncGarageCaseDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, caseId }: { branchId: string; caseId: string }) =>
      garageApi.syncCaseDetail(branchId, caseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["garage", "caseServices", variables.caseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage", "casePayments", variables.caseId],
      });
      queryClient.invalidateQueries({ queryKey: ["garage-cases"] });
      toast.success("Case details synced successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync case detail.");
    },
  });
}

export function useSyncGarageReceivables() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      from,
      to,
    }: {
      branchId: string;
      from?: string;
      to?: string;
    }) => garageApi.syncReceivables(branchId, from, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garage", "receivables"] });
      toast.success("Receivables synced successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync receivables.");
    },
  });
}

export function useSyncGaragePayables() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      from,
      to,
    }: {
      branchId: string;
      from?: string;
      to?: string;
    }) => garageApi.syncPayables(branchId, from, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garage", "payables"] });
      toast.success("Payables synced successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync payables.");
    },
  });
}
