import { beforeEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { rolesV2Api } from "./rolesApi";

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get: vi.fn() },
}));

describe("rolesV2Api.getAllUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gọi API V2 users-management và giữ shape {id, display, roleName}", async () => {
    vi.mocked(v2HttpClient.get).mockResolvedValue({
      data: {
        items: [
          { id: "u1", email: "a@b.vn", employee: { fullName: "An" } },
          { id: "u2", email: null, employee: null },
        ],
      },
    });
    const users = await rolesV2Api.getAllUsers();
    expect(v2HttpClient.get).toHaveBeenCalledWith(
      "/api/v2/users-management",
      expect.objectContaining({ params: { page: 1, pageSize: 1000 } }),
    );
    expect(users).toEqual([
      { id: "u1", display: "a@b.vn", roleName: "An" },
      { id: "u2", display: "u2", roleName: null },
    ]);
  });

  it("lỗi mạng trả danh sách rỗng", async () => {
    vi.mocked(v2HttpClient.get).mockRejectedValue(new Error("x"));
    expect(await rolesV2Api.getAllUsers()).toEqual([]);
  });
});
