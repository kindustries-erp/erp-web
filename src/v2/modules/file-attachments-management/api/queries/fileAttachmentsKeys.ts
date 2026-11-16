import type { V2TableQuery } from "@/v2/shared/types/v2-table";

export const fileAttachmentsKeys = {
  all: ["v2-file-attachments"] as const,
  list: (query: V2TableQuery, deleted?: string) =>
    [...fileAttachmentsKeys.all, "list", query, deleted ?? ""] as const,
  detail: (id: string) => [...fileAttachmentsKeys.all, "detail", id] as const,
  settings: () => [...fileAttachmentsKeys.all, "settings"] as const,
};
