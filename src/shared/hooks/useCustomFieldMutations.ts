import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

export function useCustomFieldMutations(
  moduleKey: string,
  t: (key: string, fallback: string) => string,
) {
  const queryClient = useQueryClient();

  const invalidateModuleConfig = () => {
    queryClient.invalidateQueries({
      queryKey: ["module-config-global-defs", moduleKey],
    });
    queryClient.invalidateQueries({
      queryKey: ["module-config-categories", moduleKey],
    });
    queryClient.invalidateQueries({
      queryKey: ["module-config-category-defs"],
    });
    queryClient.invalidateQueries({
      queryKey: ["module-entity-values"],
    });
  };

  const deleteAttributeMutation = useMutation({
    mutationFn: (attrId: string) => moduleConfigApi.deleteAttributeDef(attrId),
    onSuccess: () => {
      toast.success(
        t("moduleConfig.deleteAttrSuccess", "Xóa thuộc tính thành công"),
      );
      invalidateModuleConfig();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi xóa thuộc tính";
      toast.error(msg);
    },
  });

  const toggleAttributeActiveMutation = useMutation({
    mutationFn: ({ attrId, isActive }: { attrId: string; isActive: boolean }) =>
      moduleConfigApi.updateAttributeDef(attrId, { isActive }),
    onSuccess: () => {
      toast.success(
        t("moduleConfig.updateAttrSuccess", "Cập nhật trạng thái thành công"),
      );
      invalidateModuleConfig();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Lỗi khi cập nhật";
      toast.error(msg);
    },
  });

  return {
    invalidateModuleConfig,
    deleteAttributeMutation,
    toggleAttributeActiveMutation,
  };
}
