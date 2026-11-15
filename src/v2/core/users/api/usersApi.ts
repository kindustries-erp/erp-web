import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { toSummaryKeysParam } from "@/v2/shared/utils/toSummaryKeysParam";
import { toFetchOptionsResult } from "@/v2/shared/utils/v2FetchOptionsAdapter";
import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { UserFormValue, UserRecord } from "../domain/user";
import type {
  ColumnOptionsResultDto,
  CreateUserPayloadDto,
  UpdateUserPayloadDto,
  UserEmployeeOptionDto,
  UserEnvelopeDto,
  UserListResultDto,
} from "./dtos/user.dto";

const BASE = "/api/v2/users-management";
const OPTIONS_PAGE_SIZE = 20;
const EMPLOYEE_PAGE_SIZE = 200;

export const toUserListParams = (query: V2TableQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sort: query.sorts.length
    ? query.sorts
        .map((sort) =>
          sort.direction === "desc" ? `-${sort.columnKey}` : sort.columnKey,
        )
        .join(",")
    : undefined,
  column_filters: Object.keys(query.columnFilters).length
    ? JSON.stringify(query.columnFilters)
    : undefined,
  column_search: Object.keys(query.columnSearch).length
    ? JSON.stringify(query.columnSearch)
    : undefined,
  column_operators: Object.keys(query.columnOperators).length
    ? JSON.stringify(query.columnOperators)
    : undefined,
  date_ranges: Object.keys(query.dateRanges).length
    ? JSON.stringify(query.dateRanges)
    : undefined,
  summary_keys: toSummaryKeysParam(query),
});

export const toCreateUserPayload = (
  form: UserFormValue,
): CreateUserPayloadDto => ({
  email: form.email.trim(),
  password: form.password,
  employeeId: form.employeeId || undefined,
});

export const toUpdateUserPayload = (
  form: UserFormValue,
): UpdateUserPayloadDto => ({
  status: form.status,
  employeeId: form.employeeId || null,
});

const unwrap = (data: UserEnvelopeDto): UserRecord => data.data;

export const usersV2Api = {
  list: async (query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<UserListResultDto>(BASE, {
      params: toUserListParams(query),
    });
    return data;
  },
  options: async (
    params: V2FetchOptionsParams,
  ): Promise<V2FetchOptionsResult> => {
    const { data } = await v2HttpClient.get<ColumnOptionsResultDto>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: OPTIONS_PAGE_SIZE,
          filters: params.filtersStr,
        },
      },
    );
    return toFetchOptionsResult(data);
  },
  get: async (id: string): Promise<UserRecord> =>
    unwrap((await v2HttpClient.get<UserEnvelopeDto>(`${BASE}/${id}`)).data),
  create: async (form: UserFormValue) =>
    unwrap(
      (
        await v2HttpClient.post<UserEnvelopeDto>(
          BASE,
          toCreateUserPayload(form),
        )
      ).data,
    ),
  update: async (id: string, form: UserFormValue) =>
    unwrap(
      (
        await v2HttpClient.patch<UserEnvelopeDto>(
          `${BASE}/${id}`,
          toUpdateUserPayload(form),
        )
      ).data,
    ),
  activate: async (id: string) =>
    unwrap(
      (await v2HttpClient.post<UserEnvelopeDto>(`${BASE}/${id}/activate`)).data,
    ),
  deactivate: async (id: string) =>
    unwrap(
      (await v2HttpClient.post<UserEnvelopeDto>(`${BASE}/${id}/deactivate`))
        .data,
    ),
  resetPassword: async (id: string, newPassword: string) =>
    unwrap(
      (
        await v2HttpClient.post<UserEnvelopeDto>(
          `${BASE}/${id}/reset-password`,
          { newPassword },
        )
      ).data,
    ),
  /** Nhân viên để liên kết. Chưa có API v2 riêng cho nhân viên nên dùng endpoint danh sách hiện có. */
  listEmployees: async (): Promise<UserEmployeeOptionDto[]> => {
    const { data } = await v2HttpClient.get<{
      items?: UserEmployeeOptionDto[];
      data?: UserEmployeeOptionDto[];
    }>("/api/v1/employees", {
      params: { page: 1, pageSize: EMPLOYEE_PAGE_SIZE },
    });
    return data.items ?? data.data ?? [];
  },
};
