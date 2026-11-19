import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FileDownloadUrl,
  V2FilePolicy,
  V2OwnerFile,
  V2OwnerFilesResult,
} from "./v2Files.types";

interface ListResponse {
  items: V2OwnerFile[];
  extraData?: { policy?: V2FilePolicy; categories?: string[] };
}

export interface V2OwnerFilesApi {
  basePath: string;
  list: () => Promise<V2OwnerFilesResult>;
  upload: (files: File[], category?: string) => Promise<V2OwnerFile[]>;
  remove: (attachmentId: string) => Promise<void>;
  downloadUrl: (
    attachmentId: string,
    inline?: boolean,
  ) => Promise<V2FileDownloadUrl>;
}

/** Client cho controller file theo owner, ví dụ `/api/v2/invoices/:id/attachments` */
export function createV2OwnerFilesApi(basePath: string): V2OwnerFilesApi {
  return {
    basePath,
    list: async () => {
      const { data } = await v2HttpClient.get<ListResponse>(basePath);
      return {
        items: data.items ?? [],
        policy: data.extraData?.policy ?? null,
        categories: data.extraData?.categories ?? [],
      };
    },
    upload: async (files, category) => {
      const form = new FormData();
      files.forEach((file) => form.append("files", file, file.name));
      if (category) form.append("category", category);
      const { data } = await v2HttpClient.post<{ data: V2OwnerFile[] }>(
        basePath,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120_000,
        },
      );
      return data.data ?? [];
    },
    remove: async (attachmentId) => {
      await v2HttpClient.delete(`${basePath}/${attachmentId}`);
    },
    downloadUrl: async (attachmentId, inline) => {
      const { data } = await v2HttpClient.get<{ data: V2FileDownloadUrl }>(
        `${basePath}/${attachmentId}/download-url`,
        { params: inline ? { inline: true } : undefined },
      );
      return data.data;
    },
  };
}
