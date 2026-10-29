import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { businessPartnerKeys } from "../queries/businessPartnerKeys";

type Translate = (key: string, fallback?: string) => string;

/** Đồng bộ đối tác từ hóa đơn; thành công làm mới danh sách đối tác và danh sách chọn */
export function useSyncBusinessPartnersMutation(t: Translate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => businessPartnersV2Api.syncFromInvoices(false),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: businessPartnerKeys.all,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t(
          "v2.partners.sync.success",
          "Đã tạo {{count}} đối tác từ hóa đơn",
        ).replace("{{count}}", String(result.count)),
      });
    },
    onError: () => {
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t(
          "v2.partners.sync.error",
          "Không thể đồng bộ đối tác từ hóa đơn",
        ),
      });
    },
  });
}
