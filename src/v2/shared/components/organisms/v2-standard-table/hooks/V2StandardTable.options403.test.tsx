import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { V2FetchOptions } from "@/v2/shared/types/v2-table";
import { useV2ColumnOptions } from "./V2StandardTable.options.hook";

/** Client giống app thật: retry mặc định 1 lần, không tắt retry */
const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 1 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status } });

const base = { columnKey: "code", search: "", queryKeyPrefix: "test-403" };

describe("useV2ColumnOptions: lỗi 403 từ column-options", () => {
  it("đánh dấu forbidden và không retry khi API trả 403", async () => {
    const fetchOptions = vi.fn<V2FetchOptions>(async () => {
      throw httpError(403);
    });
    const { result } = renderHook(
      () => useV2ColumnOptions({ ...base, fetchOptions }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.status).toBe("forbidden"));
    expect(fetchOptions).toHaveBeenCalledTimes(1);
  });

  it("lỗi khác 403 vẫn là error và được retry một lần như mặc định", async () => {
    const fetchOptions = vi.fn<V2FetchOptions>(async () => {
      throw httpError(500);
    });
    const { result } = renderHook(
      () => useV2ColumnOptions({ ...base, fetchOptions }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.status).toBe("error"), {
      timeout: 4000,
    });
    expect(fetchOptions).toHaveBeenCalledTimes(2);
  });
});
