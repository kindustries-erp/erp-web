import { TableSortState } from "@/v2/shared/types/v2-table";
import type {
  V2DateRange,
  V2OperatorFilter,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import { getDefaultPageSize, normalizePageSize } from "./v2TableFormat";
import { updateV2SearchParams } from "./v2Url";

const paramKey = (prefix: string | undefined, name: string) =>
  prefix ? `${prefix}.${name}` : name;

const isEmptyRecord = (record: object) => Object.keys(record).length === 0;

const parseJsonRecord = (raw: string | null): Record<string, unknown> => {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const pickRecord = <V>(
  raw: Record<string, unknown>,
  isValid: (value: unknown) => value is V,
): Record<string, V> =>
  Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, V] =>
      isValid(entry[1]),
    ),
  );

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isString = (value: unknown): value is string => typeof value === "string";

const isOperatorFilter = (value: unknown): value is V2OperatorFilter =>
  typeof value === "object" &&
  value !== null &&
  isString((value as V2OperatorFilter).operator) &&
  isString((value as V2OperatorFilter).value);

const isDateRange = (value: unknown): value is V2DateRange =>
  typeof value === "object" && value !== null;

/** Ghi query bảng vào `params`. Giá trị mặc định/rỗng thì xóa khóa để URL gọn */
export const writeV2TableQuery = (
  params: URLSearchParams,
  query: V2TableQuery,
  prefix?: string,
): void => {
  const put = (name: string, value: string | undefined) => {
    const key = paramKey(prefix, name);
    if (value === undefined || value === "") params.delete(key);
    else params.set(key, value);
  };
  const json = (record: object) =>
    isEmptyRecord(record) ? undefined : JSON.stringify(record);

  put("page", query.page > 1 ? String(query.page) : undefined);
  put(
    "size",
    query.pageSize !== getDefaultPageSize()
      ? String(query.pageSize)
      : undefined,
  );
  put(
    "sort",
    query.sorts
      .map(
        (sort) =>
          `${sort.direction === TableSortState.DESC ? "-" : ""}${sort.columnKey}`,
      )
      .join(","),
  );
  put("q", query.search);
  put("cf", json(query.columnFilters));
  put("cs", json(query.columnSearch));
  put("co", json(query.columnOperators));
  put("dr", json(query.dateRanges));
};

/** Đọc query bảng từ `params`. Giá trị hỏng bị bỏ qua, chỉ trả về những trường hợp lệ */
export const parseV2TableQuery = (
  params: URLSearchParams,
  prefix?: string,
): Partial<V2TableQuery> => {
  const get = (name: string) => params.get(paramKey(prefix, name));
  const result: Partial<V2TableQuery> = {};

  const page = Number.parseInt(get("page") ?? "", 10);
  if (page >= 1) result.page = page;

  const size = Number.parseInt(get("size") ?? "", 10);
  if (size > 0) result.pageSize = normalizePageSize(size);

  const sort = get("sort");
  if (sort) {
    result.sorts = sort
      .split(",")
      .filter(Boolean)
      .map((token) =>
        token.startsWith("-")
          ? {
              columnKey: token.slice(1),
              direction: TableSortState.DESC as const,
            }
          : { columnKey: token, direction: TableSortState.ASC as const },
      );
  }

  const search = get("q");
  if (search) result.search = search;

  const filters = pickRecord(parseJsonRecord(get("cf")), isStringArray);
  if (!isEmptyRecord(filters)) result.columnFilters = filters;
  const texts = pickRecord(parseJsonRecord(get("cs")), isString);
  if (!isEmptyRecord(texts)) result.columnSearch = texts;
  const operators = pickRecord(parseJsonRecord(get("co")), isOperatorFilter);
  if (!isEmptyRecord(operators)) result.columnOperators = operators;
  const ranges = pickRecord(parseJsonRecord(get("dr")), isDateRange);
  if (!isEmptyRecord(ranges)) result.dateRanges = ranges;

  return result;
};

/** Xóa mọi khóa của một tiền tố (một bảng hoặc một tab) khỏi `params` */
export const clearV2TablePrefix = (
  params: URLSearchParams,
  prefix: string,
): void => {
  const owned = `${prefix}.`;
  [...params.keys()]
    .filter((key) => key.startsWith(owned))
    .forEach((key) => params.delete(key));
};

/** Xóa query của một bảng trên URL, dùng cùng `resetKey` của tab để đưa bảng về trạng thái ban đầu */
export const resetV2TableUrl = (prefix: string): void =>
  updateV2SearchParams((params) => clearV2TablePrefix(params, prefix));
