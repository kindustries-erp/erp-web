import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { useProcurementRequestBranchLink } from "./useProcurementRequestBranchLink";
import type {
  ProcurementApi,
  ProcurementRequestDetail,
} from "../procurement.types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const detail = {
  id: "r1",
  branchId: "b-1",
  overriddenFields: ["branchName"],
  sourceSnapshot: { branchName: "Chi nhánh 1" },
} as unknown as ProcurementRequestDetail;

const apiWith = (refreshLink?: ProcurementApi<unknown>["refreshLink"]) =>
  ({ refreshLink }) as unknown as ProcurementApi<unknown>;

describe("useProcurementRequestBranchLink", () => {
  it("họ không hỗ trợ link-override thì trả undefined", () => {
    const { result } = renderHook(
      () =>
        useProcurementRequestBranchLink({
          api: apiWith(),
          documentId: "r1",
          branchId: "b-1",
          creating: false,
          detail,
          onRefreshed: vi.fn(),
        }),
      { wrapper },
    );
    expect(result.current).toBeUndefined();
  });

  it("đọc nguồn và trạng thái đã chỉnh từ detail", () => {
    const { result } = renderHook(
      () =>
        useProcurementRequestBranchLink({
          api: apiWith(vi.fn()),
          documentId: "r1",
          branchId: "b-1",
          creating: false,
          detail,
          onRefreshed: vi.fn(),
        }),
      { wrapper },
    );
    expect(result.current?.sourceValue).toBe("Chi nhánh 1");
    expect(result.current?.overridden).toBe(true);
  });

  it("đang tạo mới thì không có nút làm mới", () => {
    const { result } = renderHook(
      () =>
        useProcurementRequestBranchLink({
          api: apiWith(vi.fn()),
          documentId: null,
          branchId: "",
          creating: true,
          onRefreshed: vi.fn(),
        }),
      { wrapper },
    );
    expect(result.current?.onRefresh).toBeUndefined();
  });

  it("làm mới gọi API đúng field, đẩy tên mới về form và cập nhật nguồn", async () => {
    const refreshLink = vi
      .fn()
      .mockResolvedValue({ branchName: "Chi nhánh 9" });
    const onRefreshed = vi.fn();
    const { result } = renderHook(
      () =>
        useProcurementRequestBranchLink({
          api: apiWith(refreshLink),
          documentId: "r1",
          branchId: "b-1",
          creating: false,
          detail,
          onRefreshed,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current?.onRefresh?.();
    });

    expect(refreshLink).toHaveBeenCalledWith("r1", "branchName");
    expect(onRefreshed).toHaveBeenCalledWith("Chi nhánh 9");
    await waitFor(() =>
      expect(result.current?.sourceValue).toBe("Chi nhánh 9"),
    );
  });

  it("đã chọn chi nhánh khác (chưa lưu) thì không có nút làm mới", () => {
    const { result } = renderHook(
      () =>
        useProcurementRequestBranchLink({
          api: apiWith(vi.fn()),
          documentId: "r1",
          branchId: "b-2",
          creating: false,
          detail,
          onRefreshed: vi.fn(),
        }),
      { wrapper },
    );
    expect(result.current?.onRefresh).toBeUndefined();
  });

  it("snapshot đổi sau khi làm mới thì dùng snapshot mới, không giữ giá trị cũ", async () => {
    const refreshLink = vi
      .fn()
      .mockResolvedValue({ branchName: "Chi nhánh 9" });
    const { result, rerender } = renderHook(
      ({ d }: { d: ProcurementRequestDetail }) =>
        useProcurementRequestBranchLink({
          api: apiWith(refreshLink),
          documentId: "r1",
          branchId: "b-1",
          creating: false,
          detail: d,
          onRefreshed: vi.fn(),
        }),
      { wrapper, initialProps: { d: detail } },
    );
    await act(async () => {
      await result.current?.onRefresh?.();
    });
    await waitFor(() =>
      expect(result.current?.sourceValue).toBe("Chi nhánh 9"),
    );

    rerender({
      d: {
        ...detail,
        sourceSnapshot: { branchName: "Chi nhánh 2" },
      } as unknown as ProcurementRequestDetail,
    });
    expect(result.current?.sourceValue).toBe("Chi nhánh 2");
  });

  it("làm mới lỗi thì từ chối promise để field giữ nguyên nguồn đã chọn", async () => {
    const refreshLink = vi.fn().mockRejectedValue(new Error("500"));
    const onRefreshed = vi.fn();
    const { result } = renderHook(
      () =>
        useProcurementRequestBranchLink({
          api: apiWith(refreshLink),
          documentId: "r1",
          branchId: "b-1",
          creating: false,
          detail,
          onRefreshed,
        }),
      { wrapper },
    );
    await act(async () => {
      await expect(result.current?.onRefresh?.()).rejects.toThrow("500");
    });
    expect(onRefreshed).not.toHaveBeenCalled();
  });
});
