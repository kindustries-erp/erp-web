import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { BranchOptionDto } from "./dtos/partnerStats.dto";

interface BranchRowDto {
  id: string;
  code: string;
  name: string;
}

/** Chi nhánh cho ô chọn: `GET /branches`, trả `{ items }` hoặc `{ data }` tùy bản API */
export const branchOptionsApi = {
  listBranchOptions: async (): Promise<BranchOptionDto[]> => {
    const { data } = await v2HttpClient.get<{
      items?: BranchRowDto[];
      data?: BranchRowDto[];
    }>("/api/v1/branches", {
      params: { page: 1, pageSize: 500, sort: "code" },
    });
    const rows = data.items ?? data.data ?? [];
    return rows.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` }));
  },
};
