import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axiosInstance";

export interface CompanyProfile {
  id: string;
  company_name: string;
  tax_code: string | null;
  address: string | null;
  mobi_phone: string | null;
  email: string | null;
  note: string | null;
  logo: string | null;
}

export const useCompanyProfile = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/company-profile");
      return res.data.data as CompanyProfile;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<CompanyProfile>) => {
      const res = await axiosInstance.patch("/api/v1/company-profile", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyProfile"] });
    },
  });

  return {
    ...query,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};
