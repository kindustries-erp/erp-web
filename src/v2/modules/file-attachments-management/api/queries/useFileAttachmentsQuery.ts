import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { FileAttachment } from "../../domain/entities/fileAttachment";
import {
  fileAttachmentsV2Api,
  type FileAttachmentListFilter,
} from "../fileAttachmentsApi";
import { fileAttachmentsKeys } from "./fileAttachmentsKeys";

export function useFileAttachmentsQuery(
  query: V2TableQuery,
  filter: FileAttachmentListFilter,
  onError?: (error: unknown) => void,
): V2ModuleListData<FileAttachment> {
  const result = useQuery({
    queryKey: fileAttachmentsKeys.list(query, filter.deleted),
    queryFn: () => fileAttachmentsV2Api.list(query, filter),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    summaries: result.data?.summaries,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
