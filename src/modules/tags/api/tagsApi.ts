import axiosInstance from "@/core/api/axiosInstance";

export interface SysTag {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  connectionCount?: number;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  description?: string;
}

export type UpdateTagDto = Partial<CreateTagDto>;

const BASE = "/api/v1/sys-tags";

export async function getTags(): Promise<SysTag[]> {
  const { data } = await axiosInstance.get<SysTag[]>(BASE);
  return data;
}

export async function createTag(payload: CreateTagDto): Promise<SysTag> {
  const { data } = await axiosInstance.post<SysTag>(BASE, payload);
  return data;
}

export async function updateTag(
  id: string,
  payload: UpdateTagDto,
): Promise<SysTag> {
  const { data } = await axiosInstance.patch<SysTag>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

export async function getEntityTags(
  entityType: string,
  entityId: string,
): Promise<SysTag[]> {
  const { data } = await axiosInstance.get<SysTag[]>(
    `${BASE}/entity-tags/list`,
    {
      params: { entityType, entityId },
    },
  );
  return data;
}

export async function updateEntityTags(
  entityType: string,
  entityId: string,
  tagIds: string[],
): Promise<void> {
  await axiosInstance.post(`${BASE}/entity-tags`, {
    entityType,
    entityId,
    tagIds,
  });
}

export async function getTagConnections(
  tagId: string,
): Promise<Record<string, unknown>[]> {
  const { data } = await axiosInstance.get(`${BASE}/${tagId}/connections`);
  return data;
}

export async function getBatchEntityTags(
  queries: { entityType: string; entityId: string }[],
): Promise<SysTag[][]> {
  const { data } = await axiosInstance.post<SysTag[][]>(
    `${BASE}/entity-tags/batch`,
    { queries },
  );
  return data;
}
