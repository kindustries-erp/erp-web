import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";

interface BranchRowDto {
  id: string;
  code: string;
  name: string;
}

interface SupplierRowDto {
  id: string;
  code?: string | null;
  name: string;
  taxCode?: string | null;
}

/** Chi nhánh cho ô chọn; API trả `items` hoặc `data` tùy bản. */
export async function listBranchOptions(): Promise<V2ComboboxOption[]> {
  const { data } = await v2HttpClient.get<{
    items?: BranchRowDto[];
    data?: BranchRowDto[];
  }>("/api/v1/branches", {
    params: { page: 1, pageSize: 500, sort: "code" },
  });
  return (data.items ?? data.data ?? []).map((b) => ({
    value: b.id,
    label: `${b.code} — ${b.name}`,
  }));
}

/** NCC có mã thật (đối tác loại VENDOR) để gán `supplierId`; tìm trên server. */
export async function listSupplierOptions(
  search: string,
): Promise<V2ComboboxOption[]> {
  const { data } = await v2HttpClient.get<{ items: SupplierRowDto[] }>(
    "/api/v2/business-partners",
    {
      params: {
        partnerType: "VENDOR",
        search: search.trim() || undefined,
        page: 1,
        pageSize: 20,
      },
    },
  );
  return data.items.map((s) => ({
    value: s.id,
    label: s.name,
    description: [s.code, s.taxCode].filter(Boolean).join(" · ") || undefined,
  }));
}
