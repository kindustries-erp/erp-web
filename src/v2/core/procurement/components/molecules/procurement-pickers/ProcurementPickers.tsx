import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { V2Combobox, V2DatePicker, V2ReadValue } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  listBranchOptions,
  listSupplierOptions,
} from "../../../api/procurementLookups";

/** Chọn chi nhánh (bắt buộc cho PR và PO). Danh sách ít thay đổi nên cache lâu. */
export function ProcurementBranchPicker({
  value,
  label,
  viewing,
  onChange,
}: {
  value: string;
  label: string;
  viewing: boolean;
  onChange: (branchId: string) => void;
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
      options={options.data ?? []}
      loading={options.isFetching}
      value={value || null}
      fallbackLabel={label || undefined}
      onValueChange={(v) => onChange(v ?? "")}
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
