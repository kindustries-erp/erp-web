import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileAttachmentsV2Api } from "../fileAttachmentsApi";
import { fileAttachmentsKeys } from "../queries/fileAttachmentsKeys";

/** Xóa vĩnh viễn nhiều file đã xóa mềm; kết quả (purged/skipped) do nơi gọi hiển thị */
export function usePurgeFileAttachmentsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => fileAttachmentsV2Api.purge(ids),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: fileAttachmentsKeys.all }),
  });
}

export function useUpdateFileAttachmentSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fileAttachmentsV2Api.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(fileAttachmentsKeys.settings(), data);
    },
  });
}
