import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useBulkDownloadXmlMutation } from "./useBulkDownloadXmlMutation";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: { bulkDownloadXml: vi.fn() },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useBulkDownloadXmlMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gọi tải lại XML đúng chiều và trả về thông điệp của server", async () => {
    vi.mocked(erpInvoicesCoreApi.bulkDownloadXml).mockResolvedValueOnce({
      message: "Đã xếp hàng 4 file XML",
    } as never);

    const { result } = renderHook(() => useBulkDownloadXmlMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("OUT");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(erpInvoicesCoreApi.bulkDownloadXml).toHaveBeenCalledWith({
      direction: "OUT",
    });
    expect(result.current.data).toEqual({ message: "Đã xếp hàng 4 file XML" });
  });
});
