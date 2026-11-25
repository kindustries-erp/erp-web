import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { garageApi } from "@/modules/garage/api/garageApi";
import { useGarageCaseSelectionModal } from "./GarageCaseSelectionModal.hook";

vi.mock("@/modules/garage/api/garageApi", () => ({
  garageApi: { getCases: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe("useGarageCaseSelectionModal", () => {
  beforeEach(() => {
    vi.mocked(garageApi.getCases).mockReset();
    vi.mocked(garageApi.getCases).mockResolvedValue({ items: [] });
  });

  it("mở modal là tải phiếu ngay, không cần chọn chi nhánh KGara", async () => {
    renderHook(
      () =>
        useGarageCaseSelectionModal({
          open: true,
          onClose: vi.fn(),
          onSelect: vi.fn(),
        }),
      { wrapper },
    );

    await waitFor(() => expect(garageApi.getCases).toHaveBeenCalledTimes(1));
    expect(vi.mocked(garageApi.getCases).mock.calls[0][0]).toBe(1);
  });

  it("modal đóng thì không tải", () => {
    renderHook(
      () =>
        useGarageCaseSelectionModal({
          open: false,
          onClose: vi.fn(),
          onSelect: vi.fn(),
        }),
      { wrapper },
    );

    expect(garageApi.getCases).not.toHaveBeenCalled();
  });
});
