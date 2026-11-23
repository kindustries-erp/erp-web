import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type {
  BusinessPartner,
  BusinessPartnerFormValue,
  BusinessPartnerType,
} from "../../domain/entities/businessPartner";
import type { BusinessPartnerApi } from "../businessPartnerApi.type";
import type { BusinessPartnerKeys } from "../queries/businessPartnerKeys";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { businessPartnerKeys } from "../queries/businessPartnerKeys";

type Translate = (key: string, fallback?: string) => string;

export interface SaveBusinessPartnerInput {
  id: string | null;
  partnerType: BusinessPartnerType;
  form: BusinessPartnerFormValue;
}

export interface MutationConfigOption {
  api?: BusinessPartnerApi;
  keys?: BusinessPartnerKeys;
}

/** Tạo mới hoặc cập nhật; thành công làm mới danh sách và đóng drawer qua `onSaved` */
export function useSaveBusinessPartnerMutation(
  t: Translate,
  onSaved: (saved: BusinessPartner) => void,
  config?: MutationConfigOption,
) {
  const queryClient = useQueryClient();
  const api = config?.api;
  const keys = config?.keys ?? businessPartnerKeys;

  return useMutation({
    mutationFn: ({ id, partnerType, form }: SaveBusinessPartnerInput) => {
      if (api) {
        return id ? api.update(id, form) : api.create(form);
      }
      return id
        ? businessPartnersV2Api.update(id, partnerType, form)
        : businessPartnersV2Api.create(partnerType, form);
    },
    onSuccess: async (saved, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: keys.all,
      });
      // Tiêu đề tách tạo/sửa như V1
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: id
          ? t("v2.partners.form.updateSuccess", "Đã cập nhật thành công")
          : t("v2.partners.form.createSuccess", "Đã tạo mới thành công"),
      });
      onSaved(saved);
    },
    onError: (error, { id }) => {
      // Chứng từ đang tham chiếu đã được modal DOCUMENT_IN_USE giải thích
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.partners.form.saveError",
        "Không thể lưu thông tin đối tác",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: id
          ? t("v2.partners.form.updateError", "Cập nhật thất bại")
          : t("v2.partners.form.createError", "Tạo mới thất bại"),
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}

/** Xóa mềm đối tác; thành công làm mới danh sách và chạy `onRemoved` */
export function useRemoveBusinessPartnerMutation(
  t: Translate,
  onRemoved: () => void,
  config?: MutationConfigOption,
) {
  const queryClient = useQueryClient();
  const api = config?.api;
  const keys = config?.keys ?? businessPartnerKeys;

  return useMutation({
    mutationFn: (id: string) =>
      api ? api.remove(id) : businessPartnersV2Api.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: keys.all,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.partners.delete.success", "Đã xóa đối tác"),
      });
      onRemoved();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t("v2.partners.delete.error", "Không thể xóa đối tác");
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}
