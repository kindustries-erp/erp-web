import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { V2Combobox, V2DatePicker, V2ReadValue } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  listBranchOptions,
  listSupplierOptions,
} from "../../../api/procurementLookups";
import type {
  ProcurementApi,
  ProcurementRequestRow,
} from "../../../procurement.types";

/**
 * Chọn một chi nhánh. `clearable` cho phép bỏ trống (chi nhánh tùy chọn).
 * `onChange` nhận id và tên chi nhánh; bỏ trống thì nhận chuỗi rỗng.
 * Danh sách ít thay đổi nên cache lâu.
 */
export function ProcurementBranchPicker({
  value,
  label,
  viewing,
  locked = false,
  clearable = false,
  onChange,
}: {
  value: string;
  label: string;
  viewing: boolean;
  /** Khóa theo đề nghị: hiện combobox vô hiệu hóa (giống kiểu ô của đề nghị), không đổi được */
  locked?: boolean;
  clearable?: boolean;
  onChange: (branchId: string, branchName: string) => void;
}) {
  const { t } = useV2Translation();
  const options = useQuery({
    queryKey: ["v2-procurement", "branch-options"],
    queryFn: listBranchOptions,
    staleTime: 5 * 60_000,
  });
  if (viewing) return <V2ReadValue value={label || value} />;
  return (
    <V2Combobox
      aria-label={t("v2.procurement.fields.branch", "Chi nhánh")}
      placeholder={
        locked && !value
          ? "—"
          : t("v2.procurement.fields.branchPlaceholder", "Chọn chi nhánh")
      }
      options={options.data ?? []}
      loading={options.isFetching}
      value={value || null}
      fallbackLabel={label || undefined}
      disabled={locked}
      clearable={clearable && !locked}
      onValueChange={(v) => {
        const picked = options.data?.find((o) => o.value === v);
        onChange(v ?? "", picked?.label ?? "");
      }}
    />
  );
}

/** Chọn NCC theo mã thật (`supplierId`); tìm trên server khi gõ. */
export function ProcurementSupplierPicker({
  value,
  label,
  viewing,
  onChange,
}: {
  value: string | null;
  label: string;
  viewing: boolean;
  onChange: (supplierId: string | null, supplierName: string) => void;
}) {
  const { t } = useV2Translation();
  const [search, setSearch] = React.useState("");
  const options = useQuery({
    queryKey: ["v2-procurement", "supplier-options", search],
    queryFn: () => listSupplierOptions(search),
    staleTime: 30_000,
  });
  if (viewing) return <V2ReadValue value={label} />;
  return (
    <V2Combobox
      aria-label={t("v2.procurement.fields.supplier", "Nhà cung cấp")}
      options={options.data ?? []}
      loading={options.isFetching}
      value={value}
      fallbackLabel={label || undefined}
      onSearchChange={setSearch}
      clearable
      onValueChange={(v) => {
        const picked = options.data?.find((o) => o.value === v);
        onChange(v, picked?.label ?? "");
      }}
    />
  );
}

/** Ô ngày yyyy-MM-dd; ở chế độ xem hiện chữ. */
export function ProcurementDateField({
  value,
  viewing,
  onChange,
  minDate,
}: {
  value: string;
  viewing: boolean;
  onChange: (value: string) => void;
  minDate?: string;
}) {
  if (viewing) return <V2ReadValue value={value} />;
  return (
    <V2DatePicker
      value={value || null}
      minDate={minDate}
      clearable
      onValueChange={(v) => onChange(v ?? "")}
    />
  );
}

/**
 * Chọn một đề nghị mua đã duyệt để điền sẵn đơn mua. Chỉ liệt kê đề nghị còn số lượng chưa đặt
 * (bỏ đề nghị đã đặt đủ). `onChange(null)` khi bỏ chọn. Tìm trên server khi gõ.
 */
export function ProcurementRequestPicker({
  value,
  label,
  requestApi,
  onChange,
}: {
  value: string | null;
  label: string;
  requestApi: ProcurementApi<unknown>;
  onChange: (requestId: string | null) => void;
}) {
  const { t } = useV2Translation();
  const [search, setSearch] = React.useState("");
  const options = useQuery({
    queryKey: ["v2-procurement", "request-options", search],
    queryFn: async () => {
      const { items } = await requestApi.list({
        page: 1,
        pageSize: 50,
        sorts: [],
        columnFilters: {},
        columnSearch: {},
        columnOperators: {},
        dateRanges: {},
        search: search.trim() || undefined,
        status: "APPROVED",
      });
      return (items as ProcurementRequestRow[])
        .filter((r) => r.orderingStatus !== "FULL")
        .map((r) => ({
          value: r.id,
          label: r.title ? `${r.requestNo} · ${r.title}` : r.requestNo,
        }));
    },
    staleTime: 30_000,
  });
  return (
    <V2Combobox
      aria-label={t("v2.procurement.fields.request", "Từ đề nghị mua")}
      placeholder={t(
        "v2.procurement.fields.requestPlaceholder",
        "Chọn đề nghị mua hàng",
      )}
      options={options.data ?? []}
      loading={options.isFetching}
      value={value}
      fallbackLabel={label || undefined}
      onSearchChange={setSearch}
      clearable
      onValueChange={(v) => onChange(v ?? null)}
    />
  );
}
