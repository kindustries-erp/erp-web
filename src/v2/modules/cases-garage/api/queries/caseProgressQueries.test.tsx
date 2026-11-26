import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CaseProgressItem,
  CaseProgressListResponse,
} from "../../domain/caseProgress.type";
import { caseProgressApi } from "../caseProgressApi";
import { caseProgressKeys } from "./caseProgressKeys";
import { useCaseProgressMutations } from "./useCaseProgressMutations";
import { useCaseProgressQuery } from "./useCaseProgressQuery";

vi.mock("../caseProgressApi", () => ({
  caseProgressApi: {
    list: vi.fn(),
    updateStatus: vi.fn(),
    updateProgress: vi.fn(),
    revert: vi.fn(),
  },
}));

const api = vi.mocked(caseProgressApi);

const item = (over: Partial<CaseProgressItem> = {}) =>
  ({
    id: "c1",
    status: "QUOTED",
    progressStage: null,
    overriddenFields: [],
    ...over,
  }) as CaseProgressItem;

const list = (items: CaseProgressItem[]) =>
  ({ items, pagination: {} }) as unknown as CaseProgressListResponse;

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const KEY = caseProgressKeys.list({ status: "ALL" });

describe("hook tiến độ xe cases-garage", () => {
  beforeEach(() => {
    api.list.mockReset().mockResolvedValue(list([item()]));
    api.updateStatus.mockReset();
    api.updateProgress.mockReset();
    api.revert.mockReset();
  });

  it("useCaseProgressQuery gọi API với tham số", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useCaseProgressQuery({ status: "ALL" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.list).toHaveBeenCalledWith({ status: "ALL" });
  });

  it("updateStatus: cập nhật lạc quan trước khi API trả về, rồi gọi đúng API", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(KEY, list([item()]));
    let release!: () => void;
    api.updateStatus.mockReturnValue(
      new Promise((r) => {
        release = () => r({});
      }),
    );
    const { result } = renderHook(() => useCaseProgressMutations(), {
      wrapper,
    });

    act(() => {
      result.current.updateStatus.mutate({ id: "c1", status: "INTAKE" });
    });
    await waitFor(() =>
      expect(
        client.getQueryData<CaseProgressListResponse>(KEY)?.items[0].status,
      ).toBe("INTAKE"),
    );
    expect(api.updateStatus).toHaveBeenCalledWith("c1", "INTAKE", undefined);
    release();
    await waitFor(() =>
      expect(result.current.updateStatus.isSuccess).toBe(true),
    );
  });

  it("updateStatus lỗi: hoàn lại trạng thái cũ trong cache", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(KEY, list([item()]));
    api.updateStatus.mockRejectedValue(new Error("400"));
    api.list.mockResolvedValue(list([item()]));
    const { result } = renderHook(() => useCaseProgressMutations(), {
      wrapper,
    });

    await act(async () => {
      await result.current.updateStatus
        .mutateAsync({ id: "c1", status: "INTAKE" })
        .catch(() => undefined);
    });
    expect(
      client.getQueryData<CaseProgressListResponse>(KEY)?.items[0].status,
    ).toBe("QUOTED");
  });

  it("updateProgress: đổi công đoạn lạc quan và gọi đúng payload", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(KEY, list([item({ status: "IN_PROGRESS" })]));
    api.updateProgress.mockResolvedValue({});
    const { result } = renderHook(() => useCaseProgressMutations(), {
      wrapper,
    });

    await act(async () => {
      await result.current.updateProgress.mutateAsync({
        id: "c1",
        payload: { progressStage: "PAINTING" },
      });
    });
    expect(api.updateProgress).toHaveBeenCalledWith(
      "c1",
      { progressStage: "PAINTING" },
      undefined,
    );
  });

  it("revert gọi API với field status và tải lại danh sách", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(KEY, list([item()]));
    api.revert.mockResolvedValue({});
    const spy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCaseProgressMutations(), {
      wrapper,
    });

    await act(async () => {
      await result.current.revert.mutateAsync({
        id: "c1",
        fields: ["status"],
      });
    });
    expect(api.revert).toHaveBeenCalledWith("c1", ["status"], undefined);
    expect(spy).toHaveBeenCalledWith({ queryKey: caseProgressKeys.all });
  });

  it("cập nhật lạc quan cả cache mảng đủ trang (listAll) và hoàn lại khi lỗi", async () => {
    const { client, wrapper } = setup();
    const KEY_ALL = caseProgressKeys.listAll({ status: "ALL" }, "ext-1");
    client.setQueryData(KEY_ALL, [item(), item({ id: "c2" })]);
    api.updateStatus.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCaseProgressMutations("ext-1"), {
      wrapper,
    });
    await act(async () => {
      await result.current.updateStatus
        .mutateAsync({ id: "c1", status: "INTAKE" })
        .catch(() => undefined);
    });
    expect(api.updateStatus).toHaveBeenCalledWith("c1", "INTAKE", "ext-1");
    expect(
      client.getQueryData<CaseProgressItem[]>(KEY_ALL)?.map((i) => i.status),
    ).toEqual(["QUOTED", "QUOTED"]);
  });
});
