import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { V2OwnerFilesApi } from "./v2FilesApi";
import { v2FilesKeys } from "./v2FilesKeys";

/** Danh sách file của một owner, kèm policy và danh mục từ server */
export function useV2OwnerFilesQuery(api: V2OwnerFilesApi, enabled = true) {
  return useQuery({
    queryKey: v2FilesKeys.list(api.basePath),
    queryFn: () => api.list(),
    enabled,
    staleTime: 15_000,
  });
}

export function useV2UploadFilesMutation(api: V2OwnerFilesApi) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, category }: { files: File[]; category?: string }) =>
      api.upload(files, category),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: v2FilesKeys.list(api.basePath),
      }),
  });
}

export function useV2DeleteFileMutation(api: V2OwnerFilesApi) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => api.remove(attachmentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: v2FilesKeys.list(api.basePath),
      }),
  });
}
