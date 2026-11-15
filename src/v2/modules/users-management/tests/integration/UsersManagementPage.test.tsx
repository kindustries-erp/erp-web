import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersManagementPage } from "../../pages/UsersManagementPage";

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

vi.mock("../../api/usersManagementApi", () => ({
  usersManagementApi: api,
}));
vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <div className="h-[800px]">
        <UsersManagementPage />
      </div>
    </QueryClientProvider>,
  );
};

describe("UsersManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue({
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
    api.options.mockResolvedValue({ items: [], total: 0, next: null });
  });

  it("loads the list through the module API", async () => {
    renderPage();
    await waitFor(() => expect(api.list).toHaveBeenCalled());
  });
});
