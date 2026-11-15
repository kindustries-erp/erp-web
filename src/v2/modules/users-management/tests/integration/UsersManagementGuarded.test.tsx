import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersManagementGuarded } from "../../pages/UsersManagementGuarded";

const state = vi.hoisted(() => ({
  allowed: false,
  list: vi.fn(),
}));

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => state.allowed,
}));
vi.mock("../../api/usersManagementApi", () => ({
  usersManagementApi: {
    list: state.list,
    options: vi.fn().mockResolvedValue({ items: [], total: 0, next: null }),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn(),
    resetPassword: vi.fn(),
    timeline: vi.fn(),
  },
}));

const renderGuarded = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <div className="h-[800px]">
        <UsersManagementGuarded />
      </div>
    </QueryClientProvider>,
  );

describe("UsersManagementGuarded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.list.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        next: null,
        previous: null,
      },
    });
  });

  it("không có quyền manage: báo không có quyền và không gọi API", () => {
    state.allowed = false;
    renderGuarded();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(state.list).not.toHaveBeenCalled();
  });

  it("có quyền manage: render trang và gọi API danh sách", async () => {
    state.allowed = true;
    renderGuarded();
    await vi.waitFor(() => expect(state.list).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
