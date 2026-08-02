import axiosInstance, { API_BASE_URL } from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface EmailFileRef {
  id: string;
  filename_download: string;
  filename_disk: string;
  type: string;
  filesize: number;
}

export interface EmailAttachment {
  id: string;
  messageId: string;
  sysFileId: string;
  filename: string | null;
  contentType: string | null;
  size: number | null;
  contentId: string | null;
  disposition: string | null;
  attachmentIndex: number;
  metadataJson: unknown;
  sysFile: EmailFileRef | null;
}

export interface EmailAddress {
  name: string | null;
  address: string | null;
}

export interface EmailMessage {
  id: string;
  mailbox: string;
  uid: string | null;
  messageId: string | null;
  sourceHost: string | null;
  sourceProvider: string;
  subject: string | null;
  fromJson: EmailAddress[] | null;
  toJson: EmailAddress[] | null;
  ccJson: EmailAddress[] | null;
  bccJson: EmailAddress[] | null;
  bodyText: string | null;
  bodyHtml: string | null;
  headersJson: Array<{ key: string; value: string }> | null;
  rawMetaJson: Record<string, unknown> | null;
  sentAt: string | null;
  receivedAt: string | null;
  ingestedAt: string | null;
  attachmentCount: number;
  attachments: EmailAttachment[];
}

export interface EmailMessageDetailResponse {
  message: string;
  data: EmailMessage;
}

export interface SyncEmailRequest {
  mailbox?: string;
  limit?: number;
  sinceUid?: number;
}

export async function getEmailMessagesApi(
  params: ListParams & { mailbox?: string; sort?: string | string[] } = {},
): Promise<PaginatedResponse<EmailMessage>> {
  const sortValue = Array.isArray(params.sort)
    ? params.sort.join(",")
    : params.sort || "-createdAt";
  const { data } = await axiosInstance.get<PaginatedResponse<EmailMessage>>(
    "/api/v1/email-ingest/emails",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        sort: sortValue,
        ...(params.search ? { search: params.search } : {}),
        ...(params.mailbox ? { mailbox: params.mailbox } : {}),
      },
    },
  );
  return data;
}

export async function getEmailMessageApi(id: string): Promise<EmailMessage> {
  const { data } = await axiosInstance.get<EmailMessageDetailResponse>(
    `/api/v1/email-ingest/emails/${id}`,
  );
  return data.data;
}

export async function syncEmailMailboxApi(payload: SyncEmailRequest) {
  const { data } = await axiosInstance.post<{ message: string; data: unknown }>(
    "/api/v1/email-ingest/sync",
    payload,
  );
  return data.data;
}

export function getEmailFileViewUrl(fileId: string) {
  return `${API_BASE_URL}/api/v1/files/${encodeURIComponent(fileId)}`;
}
