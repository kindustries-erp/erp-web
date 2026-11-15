import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUserKeys } from "../api/userKeys";
import type { UserApi } from "../api/userApi.type";
import type { UserModuleConfig } from "../users.config.type";
import "../users.locale";
import { UserDrawer } from "./UserDrawer";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  activate: vi.fn(),
  deactivate: vi.fn(),
  resetPassword: vi.fn(),
  timeline: vi.fn(),
}));

const config: UserModuleConfig = {
  api: api as unknown as UserApi,
  keys: createUserKeys(["test-users"]),
  tableId: "test-users-table",
  permissionCollection: "admin_users",
  requiredFields: [],
  viewVisibility: {},
};

const renderDrawer = (recordId: string | null) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <UserDrawer
        open
        mode="view"
        recordId={recordId}
        canUpdate
        onClose={vi.fn()}
        config={config}
      />
    </QueryClientProvider>,
  );
};

describe("UserDrawer: tab Lịch sử", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      id: "u1",
      email: "a@b.vn",
      status: "ACTIVE",
      employeeId: null,
      employee: null,
    });
    api.timeline.mockResolvedValue([
      {
        id: "l1",
        actionType: "RESET_PASSWORD",
        actorEmail: "admin@liouni.com",
        message: null,
        status: "SUCCESS",
        createdAt: "2026-11-15T10:00:00Z",
      },
    ]);
  });

  it("chỉ gọi timeline khi mở tab Lịch sử và hiện dòng audit", async () => {
    renderDrawer("u1");
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("u1"));
    expect(api.timeline).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByText("Lịch sử"));
    await waitFor(() => expect(api.timeline).toHaveBeenCalledWith("u1"));
    expect(await screen.findByText("Đặt lại mật khẩu")).toBeTruthy();
  });

  it("view mode hiển thị thông tin, không có ô nhập; sửa thì có ô nhập", async () => {
    renderDrawer("u1");
    // Email xuất hiện ở phụ đề và ở dòng thông tin
    expect((await screen.findAllByText("a@b.vn")).length).toBeGreaterThan(1);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);

    fireEvent.click(screen.getByText("Chỉnh sửa"));
    await waitFor(() =>
      expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0),
    );
  });

  it("tạo mới không có tab Lịch sử", async () => {
    renderDrawer(null);
    await waitFor(() => expect(screen.queryByText("Lịch sử")).toBeNull());
    expect(api.timeline).not.toHaveBeenCalled();
  });
});
