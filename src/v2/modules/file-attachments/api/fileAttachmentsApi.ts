import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import { toSummaryKeysParam } from "@/v2/shared/utils/toSummaryKeysParam";
import type {
  FileAttachment,
  FileAttachmentSettings,
  PurgeResult,
} from "../domain/entities/fileAttachment";
import type {
  ColumnOptionsResultDto,
  DownloadUrlEnvelopeDto,
  FileAttachmentEnvelopeDto,
  FileAttachmentListResultDto,
  PurgeEnvelopeDto,
  SettingsEnvelopeDto,
} from "./dtos/fileAttachment.dto";

const BASE = "/api/v2/file-attachments";
const OPTIONS_PAGE_SIZE = 20;

/** Bộ lọc có sẵn của trang: `deleted: "only"` chỉ xem file đã xóa mềm */
export interface FileAttachmentListFilter {
  deleted?: "only";
}

const json = (value: object) =>
  Object.keys(value).length ? JSON.stringify(value) : undefined;

export const toFileAttachmentsListParams = (
  query: V2TableQuery,
  filter: FileAttachmentListFilter = {},
) => ({
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sort: query.sorts.length
    ? query.sorts
        .map((s) => (s.direction === "desc" ? `-${s.columnKey}` : s.columnKey))
        .join(",")
    : undefined,
  column_filters: json(query.columnFilters),
  column_search: json(query.columnSearch),
  column_operators: json(query.columnOperators),
  date_ranges: json(query.dateRanges),
  summary_keys: toSummaryKeysParam(query),
  deleted: filter.deleted,
});

export const fileAttachmentsV2Api = {
  list: async (query: V2TableQuery, filter?: FileAttachmentListFilter) => {
    const { data } = await v2HttpClient.get<FileAttachmentListResultDto>(BASE, {
      params: toFileAttachmentsListParams(query, filter),
    });
    return {
      items: data.items,
      total: data.pagination.total,
      summaries: data.summaries,
    };
  },
  options: async (
    params: V2FetchOptionsParams,
    filter?: FileAttachmentListFilter,
  ) => {
    const { data } = await v2HttpClient.get<ColumnOptionsResultDto>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: OPTIONS_PAGE_SIZE,
          filters: params.filtersStr,
          deleted: filter?.deleted,
        },
      },
    );
    return {
      items: data.items,
      total: data.items.length,
      next: data.pagination?.next ?? null,
    };
  },
  get: async (id: string): Promise<FileAttachment> => {
    const { data } = await v2HttpClient.get<FileAttachmentEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  downloadUrl: async (id: string, inline = false) => {
    const { data } = await v2HttpClient.get<DownloadUrlEnvelopeDto>(
      `${BASE}/${id}/download-url`,
      { params: inline ? { inline: true } : undefined },
    );
    return data.data;
  },
  purge: async (ids: string[]): Promise<PurgeResult> => {
    const { data } = await v2HttpClient.post<PurgeEnvelopeDto>(
      `${BASE}/purge`,
      {
        ids,
      },
    );
    return data.data;
  },
  getSettings: async (): Promise<FileAttachmentSettings> => {
    const { data } = await v2HttpClient.get<SettingsEnvelopeDto>(
      `${BASE}/settings`,
    );
    return data.data;
  },
  updateSettings: async (
    patch: Partial<
      Pick<FileAttachmentSettings, "autoPurgeEnabled" | "retentionDays">
    >,
  ): Promise<FileAttachmentSettings> => {
    const { data } = await v2HttpClient.patch<SettingsEnvelopeDto>(
      `${BASE}/settings`,
      patch,
    );
    return data.data;
  },
};
