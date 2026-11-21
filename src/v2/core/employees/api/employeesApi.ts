import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { toSummaryKeysParam } from "@/v2/shared/utils/toSummaryKeysParam";
import { toFetchOptionsResult } from "@/v2/shared/utils/v2FetchOptionsAdapter";
import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { EmployeeFormValue, EmployeeRecord } from "../domain/employee";
import { vnDateToIso } from "../domain/rules/employeeDates";
import type {
  ColumnOptionsResultDto,
  EmployeeBranchOptionDto,
  EmployeeEnvelopeDto,
  EmployeeListResultDto,
  EmployeeNationalIdEnvelopeDto,
  EmployeeNextCodeDto,
  EmployeePayloadDto,
} from "./dtos/employee.dto";

const BASE = "/api/v2/employees";
const BRANCHES = "/api/v2/branches";
const OPTIONS_PAGE_SIZE = 20;
const BRANCH_PAGE_SIZE = 200;

export const toEmployeeListParams = (query: V2TableQuery) => ({
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

const text = (value: string): string | undefined => value.trim() || undefined;
/** Khi sửa, giá trị rỗng gửi `null` để xóa; khi tạo bỏ khỏi payload */
const nullable = (value: string, creating: boolean) =>
  creating ? text(value) : text(value) || null;

/** Form sang payload API. Ngày `yyyy-MM-dd` (giờ VN) đổi thành ISO lúc 00:00 giờ VN. */
export const toEmployeePayload = (
  form: EmployeeFormValue,
  creating: boolean,
): EmployeePayloadDto => ({
  employeeCode: text(form.employeeCode),
  fullName: form.fullName.trim(),
  status: form.status,
  email: nullable(form.email, creating),
  phone: nullable(form.phone, creating),
  address: nullable(form.address, creating),
  notes: nullable(form.notes, creating),
  jobTitle: nullable(form.jobTitle, creating),
  department: nullable(form.department, creating),
  branchId: form.branchId || (creating ? undefined : null),
  nationalId: nullable(form.nationalId, creating),
  birthDate: vnDateToIso(form.birthDate) ?? (creating ? undefined : null),
  startDate: vnDateToIso(form.startDate) ?? (creating ? undefined : null),
  leaveDate: vnDateToIso(form.leaveDate) ?? (creating ? undefined : null),
});

const unwrap = (data: EmployeeEnvelopeDto): EmployeeRecord => data.data;

export const employeesV2Api = {
  list: async (query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<EmployeeListResultDto>(BASE, {
      params: toEmployeeListParams(query),
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
  get: async (id: string): Promise<EmployeeRecord> =>
    unwrap((await v2HttpClient.get<EmployeeEnvelopeDto>(`${BASE}/${id}`)).data),
  getNationalId: async (id: string): Promise<string> => {
    const { data } = await v2HttpClient.get<EmployeeNationalIdEnvelopeDto>(
      `${BASE}/${id}/national-id`,
    );
    return data.data.nationalId ?? "";
  },
  nextCode: async (): Promise<string> =>
    (await v2HttpClient.get<EmployeeNextCodeDto>(`${BASE}/next-code`)).data
      .nextCode,
  create: async (form: EmployeeFormValue) =>
    unwrap(
      (
        await v2HttpClient.post<EmployeeEnvelopeDto>(
          BASE,
          toEmployeePayload(form, true),
        )
      ).data,
    ),
  update: async (id: string, form: EmployeeFormValue) =>
    unwrap(
      (
        await v2HttpClient.patch<EmployeeEnvelopeDto>(
          `${BASE}/${id}`,
          toEmployeePayload(form, false),
        )
      ).data,
    ),
  setStatus: async (id: string, status: "ACTIVE" | "INACTIVE") =>
    unwrap(
      (
        await v2HttpClient.post<EmployeeEnvelopeDto>(`${BASE}/${id}/status`, {
          status,
        })
      ).data,
    ),
  remove: async (id: string) =>
    unwrap(
      (await v2HttpClient.delete<EmployeeEnvelopeDto>(`${BASE}/${id}`)).data,
    ),
  /** Chi nhánh cho ô chọn; API chi nhánh trả danh sách phẳng `{ items }` */
  listBranches: async (): Promise<EmployeeBranchOptionDto[]> => {
    const { data } = await v2HttpClient.get<{
      items?: EmployeeBranchOptionDto[];
    }>(BRANCHES, { params: { page: 1, pageSize: BRANCH_PAGE_SIZE } });
    return data.items ?? [];
  },
};
