import { useQuery } from "@tanstack/react-query";
import { fileAttachmentsV2Api } from "../fileAttachmentsApi";
import { fileAttachmentsKeys } from "./fileAttachmentsKeys";

export const useFileAttachmentSettingsQuery = (enabled = true) =>
  useQuery({
    queryKey: fileAttachmentsKeys.settings(),
    queryFn: () => fileAttachmentsV2Api.getSettings(),
    enabled,
    staleTime: 30_000,
  });
