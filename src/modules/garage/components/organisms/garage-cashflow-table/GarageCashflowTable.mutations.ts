import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { garageCashflowApi } from "../../../api/garageCashflowApi";
import type { UpdateGarageCashflowVoucherDto } from "../../../api/garageCashflowApi";

export function useGarageCashflowMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["garage-cashflow-list"] });

  const createMutation = useMutation({
    mutationFn: garageCashflowApi.create,
    onSuccess: () => {
      toast.success("Tạo phiếu thu/chi thành công");
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGarageCashflowVoucherDto;
    }) => garageCashflowApi.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật phiếu thu/chi thành công");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: garageCashflowApi.delete,
    onSuccess: () => {
      toast.success("Xóa phiếu thu/chi thành công");
      invalidate();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
