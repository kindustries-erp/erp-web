import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockCases } from "@/v2/core/cases-garage/kanban/garageCaseKanban.fixtures";
import { caseProgressApi } from "../api/caseProgressApi";
import { GarageCasesKanbanContainer } from "./GarageCasesKanbanContainer";

vi.mock("../api/caseProgressApi", () => ({
  caseProgressApi: {
    listAll: vi.fn(),
    updateStatus: vi.fn(),
    updateProgress: vi.fn(),
    revert: vi.fn(),
  },
}));

const renderIt = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <GarageCasesKanbanContainer cases={mockCases} branchId="b-1" />
    </QueryClientProvider>,
  );

describe("GarageCasesKanbanContainer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("xếp xe theo status v2 thay vì mã KGara và hiện dấu đã chỉnh", async () => {
    // Phiếu 1 mang mã KGara 2 (Đang làm) nhưng v2 đã đổi về INTAKE.
    vi.mocked(caseProgressApi.listAll).mockResolvedValue([
      {
        id: "1",
        status: "INTAKE",
        progressStage: null,
        overriddenFields: ["status"],
      },
    ] as never);
    renderIt();
    expect(await screen.findByText("Đã chỉnh ở v2")).toBeInTheDocument();
    await waitFor(() =>
      expect(caseProgressApi.listAll).toHaveBeenCalledWith(
        { status: "ALL" },
        "b-1",
      ),
    );
  });
});
