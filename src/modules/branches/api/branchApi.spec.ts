import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/core/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from "@/core/api/axiosInstance";
import { createBranchApi, getBranchesApi, updateBranchApi } from "./branchApi";

describe("branchApi normalize is_active", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps isActive:false from API to is_active:false on list", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        items: [
          { id: "b1", code: "HN", name: "Hà Nội", isActive: false },
          { id: "b2", code: "HCM", name: "HCM", isActive: true },
        ],
      },
    } as any);

    const list = await getBranchesApi();

    expect(list.find((b) => b.id === "b1")?.is_active).toBe(false);
    expect(list.find((b) => b.id === "b2")?.is_active).toBe(true);
  });

  it("falls back to legacy is_active when isActive is missing", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        items: [{ id: "b1", code: "HN", name: "Hà Nội", is_active: false }],
      },
    } as any);

    const [branch] = await getBranchesApi();

    expect(branch.is_active).toBe(false);
  });

  it("defaults to active when neither field is present", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { items: [{ id: "b1", code: "HN", name: "Hà Nội" }] },
    } as any);

    const [branch] = await getBranchesApi();

    expect(branch.is_active).toBe(true);
  });

  it("maps isActive:false from create and update responses", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        message: "ok",
        data: { id: "b1", code: "HN", name: "Hà Nội", isActive: false },
      },
    } as any);
    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: {
        message: "ok",
        data: { id: "b1", code: "HN", name: "Đổi tên", isActive: false },
      },
    } as any);

    const created = await createBranchApi({
      code: "HN",
      name: "Hà Nội",
      is_active: false,
    });
    const updated = await updateBranchApi("b1", { name: "Đổi tên" });

    expect(created.is_active).toBe(false);
    expect(updated.is_active).toBe(false);
  });

  it("sends the unchanged payload shape to the API", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        message: "ok",
        data: { id: "b1", code: "HN", name: "Hà Nội", isActive: true },
      },
    } as any);
    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: {
        message: "ok",
        data: { id: "b1", code: "HN", name: "Hà Nội", isActive: true },
      },
    } as any);

    await createBranchApi({ code: "HN", name: "Hà Nội", is_active: true });
    await updateBranchApi("b1", { is_active: false });

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/v2/branches", {
      code: "HN",
      name: "Hà Nội",
      is_active: true,
    });
    expect(axiosInstance.patch).toHaveBeenCalledWith("/api/v2/branches/b1", {
      is_active: false,
    });
  });
});
