// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEnsureValidCurrentBranch } from "../hooks/useEnsureValidCurrentBranch";
import { getBranchesApi } from "@/modules/branches/api/branchApi";

const appState = vi.hoisted(() => ({
  currentBranchId: null as string | null,
  setCurrentBranchId: vi.fn(),
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector: (s: typeof appState) => unknown) =>
    selector(appState),
}));

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchesApi: vi.fn(),
}));

const branches = [
  { id: "branch-1", name: "Lê Văn Lương" },
  { id: "branch-2", name: "Phổ Quang" },
];

// Cho query resolve và effect chạy xong trước khi khẳng định không gọi setter
const flushQuery = () => new Promise((resolve) => setTimeout(resolve, 20));

const renderWithClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEnsureValidCurrentBranch(), { wrapper });
};

describe("useEnsureValidCurrentBranch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appState.currentBranchId = null;
    vi.mocked(getBranchesApi).mockResolvedValue(branches as any);
  });

  it("chọn chi nhánh đầu tiên khi currentBranchId đang null", async () => {
    renderWithClient();

    await waitFor(() =>
      expect(appState.setCurrentBranchId).toHaveBeenCalledWith("branch-1"),
    );
  });

  it("đưa currentBranchId đã cũ (không có trong danh sách) về chi nhánh đầu", async () => {
    appState.currentBranchId = "branch-removed";
    renderWithClient();

    await waitFor(() =>
      expect(appState.setCurrentBranchId).toHaveBeenCalledWith("branch-1"),
    );
  });

  it("giữ nguyên khi currentBranchId hợp lệ", async () => {
    appState.currentBranchId = "branch-2";
    renderWithClient();

    await waitFor(() => expect(getBranchesApi).toHaveBeenCalled());
    await flushQuery();
    expect(appState.setCurrentBranchId).not.toHaveBeenCalled();
  });

  it("không đổi gì khi danh sách chi nhánh rỗng", async () => {
    vi.mocked(getBranchesApi).mockResolvedValue([] as any);
    appState.currentBranchId = "branch-removed";
    renderWithClient();

    await waitFor(() => expect(getBranchesApi).toHaveBeenCalled());
    await flushQuery();
    expect(appState.setCurrentBranchId).not.toHaveBeenCalled();
  });
});
