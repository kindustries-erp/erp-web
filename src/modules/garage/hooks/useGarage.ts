import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";
import { toast } from "react-hot-toast";

export const useGarageBranches = () => {
  return useQuery({
    queryKey: ["garage-branches"],
    queryFn: garageApi.getBranches,
  });
};

export function useGarageCases(
  branchId?: string,
  page: number = 1,
  pageSize: number = 20,
  q: string = "",
  from?: string,
  to?: string,
) {
  return useQuery({
    queryKey: ["garage", "cases", branchId, page, pageSize, q, from, to],
    queryFn: () => garageApi.getCases(branchId!, page, pageSize, q, from, to),
    enabled: !!branchId,
    staleTime: 1000 * 60,
  });
}

export const useGarageCaseById = (id?: string) => {
  return useQuery({
    queryKey: ["garage-case", id],
    queryFn: () => garageApi.getCaseById(id!),
    enabled: !!id,
  });
};

export const useGarageCaseByExternalId = (
  externalId?: string,
  branchId?: string,
) => {
  return useQuery({
    queryKey: ["garage-case-external", externalId, branchId],
    queryFn: () => garageApi.getCaseByExternalId(externalId!, branchId),
    enabled: !!externalId,
    retry: false,
  });
};

export const useGarageCaseByCode = (code?: string) => {
  return useQuery({
    queryKey: ["garage-case-code", code],
    queryFn: () => garageApi.getCaseByCode(code!),
    enabled: !!code,
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

export function useGarageGrossProfit(
  branchId?: string,
  from?: string,
  to?: string,
) {
  return useQuery({
    queryKey: ["garage", "grossProfitReport", branchId, from, to],
    queryFn: () => garageApi.getGrossProfitReport(branchId!, from, to),
    enabled: !!branchId,
  });
}

export function useGarageGrossProfitJournal(
  branchId?: string,
  from?: string,
  to?: string,
) {
  return useQuery({
    queryKey: ["garage", "grossProfitJournal", branchId, from, to],
    queryFn: () => garageApi.getGrossProfitJournal(branchId!, from, to),
    enabled: !!branchId,
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

export const useSyncGarageGrossProfit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { branchId: string; from?: string; to?: string }) =>
      garageApi.syncGrossProfit(params.branchId, params.from, params.to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garage-cases"] });
      queryClient.invalidateQueries({ queryKey: ["garage-gross-profit"] });
      toast.success("Đồng bộ lợi nhuận gộp thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Đồng bộ thất bại");
    },
  });
};

export function useGarageGrossProfitLinkedInvoices(grossProfitId?: string) {
  return useQuery({
    queryKey: ["garage", "grossProfitLinkedInvoices", grossProfitId],
    queryFn: () => garageApi.getGrossProfitLinkedInvoices(grossProfitId!),
    enabled: !!grossProfitId,
  });
}

export function useMutateGrossProfitLinkedInvoices() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (variables: {
      grossProfitId: string;
      invoiceId: string;
      linkType: "IN" | "OUT";
      note?: string;
    }) =>
      garageApi.addGrossProfitLinkedInvoice(
        variables.grossProfitId,
        variables.invoiceId,
        variables.linkType,
        variables.note,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "garage",
          "grossProfitLinkedInvoices",
          variables.grossProfitId,
        ],
      });
      toast.success("Đã liên kết chứng từ.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Lỗi khi thêm chứng từ liên kết");
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({
      grossProfitId,
      linkedId,
    }: {
      grossProfitId: string;
      linkedId: string;
    }) => garageApi.removeGrossProfitLinkedInvoice(grossProfitId, linkedId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "garage",
          "grossProfitLinkedInvoices",
          variables.grossProfitId,
        ],
      });
      toast.success("Đã hủy liên kết chứng từ.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Lỗi khi xóa chứng từ liên kết");
    },
  });

  return { addMutation, removeMutation };
}

export function useGarageCaseGrossProfit(caseCode?: string) {
  return useQuery({
    queryKey: ["garage", "grossProfitDetail", caseCode],
    queryFn: async () => {
      const res = await garageApi.getGrossProfitByCode(caseCode!);
      return res || null;
    },
    enabled: !!caseCode,
    retry: false,
  });
}
