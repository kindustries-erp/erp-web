import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RolesPage } from "../../pages/RolesPage";

const api = vi.hoisted(() => ({
  list: vi.fn(),
  options: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../api/rolesApi", () => ({
  rolesV2Api: api,
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
        <RolesPage />
      </div>
    </QueryClientProvider>,
  );
};

describe("RolesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue({
      items: [
        {
          id: "r1",
          code: "Bản ghi mẫu",
          name: "Bản ghi mẫu",
          description: "Bản ghi mẫu",
          status: "Bản ghi mẫu",
          createdAt: "2026-01-01",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        next: null,
        previous: null,
      },
    });
    api.options.mockResolvedValue({ items: [], total: 0, next: null });
  });

  it("loads the list through the module API", async () => {
    renderPage();
    expect(await screen.findAllByText("Bản ghi mẫu")).not.toHaveLength(0);
    await waitFor(() => expect(api.list).toHaveBeenCalled());
  });
});
