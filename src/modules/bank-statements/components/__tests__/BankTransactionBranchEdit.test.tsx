// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { BankTransactionGeneralInfoSection } from "../BankTransactionGeneralInfoSection";

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchOptionsApi: vi.fn().mockResolvedValue([
    { value: "branch-uuid-1", label: "01 — Chi nhánh Lê Văn Lương" },
    { value: "branch-uuid-2", label: "02 — Chi nhánh Đào Trí" },
  ]),
}));

describe("BankTransactionGeneralInfoSection branch edit", () => {
  it("chọn thêm chi nhánh ở chế độ sửa gọi onBranchChange với cả mảng", async () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
    const onBranchChange = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionGeneralInfoSection
          transaction={{
            id: "txn-1",
            sourceType: "BANK",
            transDate: "2026-08-15T00:00:00.000Z",
            branchIds: ["branch-uuid-1"],
            bankAccount: { accountName: "TCB", accountNumber: "1" },
          }}
          editMode
          branchIds={["branch-uuid-1"]}
          onBranchChange={onBranchChange}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole("combobox")).toBeTruthy());
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: /Đào Trí/ }));

    expect(onBranchChange).toHaveBeenCalledWith([
      "branch-uuid-1",
      "branch-uuid-2",
    ]);
  });

  it("ở chế độ xem không hiện ô chọn, chỉ hiện tên chi nhánh", async () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BankTransactionGeneralInfoSection
          transaction={{
            id: "txn-2",
            sourceType: "BANK",
            transDate: "2026-08-15T00:00:00.000Z",
            branchIds: ["branch-uuid-2"],
            bankAccount: { accountName: "TCB", accountNumber: "1" },
          }}
          editMode={false}
          onBranchChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Đào Trí/).length).toBeGreaterThan(0),
    );
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
