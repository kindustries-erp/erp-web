import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmployeesManagementPage } from "../../pages/EmployeesManagementPage";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  getNationalId: vi.fn(),
  nextCode: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setStatus: vi.fn(),
  remove: vi.fn(),
  listBranches: vi.fn(),
}));

vi.mock("../../api/employeesManagementApi", () => ({
  employeesManagementApi: api,
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
        <EmployeesManagementPage />
      </div>
    </QueryClientProvider>,
  );
};

describe("EmployeesManagementPage", () => {
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
    api.listBranches.mockResolvedValue([]);
  });

  it("loads the list through the module API", async () => {
    renderPage();
    await waitFor(() => expect(api.list).toHaveBeenCalled());
  });
});
