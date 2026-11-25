import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CaseWorkshopBoardItem,
  CaseWorkshopBoardParams,
  CaseWorkshopBoardResponse,
} from "../../domain/caseWorkshop.type";
import { caseProgressApi } from "../caseProgressApi";
import { caseWorkshopApi } from "../caseWorkshopApi";
import { caseWorkshopKeys } from "./caseWorkshopKeys";
import { useCaseWorkshopMutations } from "./useCaseWorkshopMutations";
import {
  useCaseWorkshopBoardQuery,
  useCaseWorkshopTimelineQuery,
  useWorkshopCandidatesQuery,
} from "./useCaseWorkshopQueries";

vi.mock("../caseWorkshopApi", () => ({
  caseWorkshopApi: {
    board: vi.fn(),
    timeline: vi.fn(),
    workers: vi.fn(),
    createLog: vi.fn(),
    updateLog: vi.fn(),
    removeLog: vi.fn(),
    candidates: vi.fn(),
    track: vi.fn(),
    trackNew: vi.fn(),
    untrack: vi.fn(),
  },
}));
vi.mock("../caseProgressApi", () => ({
  caseProgressApi: { updateStatus: vi.fn() },
}));

const api = vi.mocked(caseWorkshopApi);
const progressApi = vi.mocked(caseProgressApi);

const item = (over: Partial<CaseWorkshopBoardItem> = {}) =>
  ({
    id: "c1",
    status: "IN_PROGRESS",
    progressStage: "PAINTING",
    stageStartedAt: "2026-11-24T08:00:00.000Z",
    ...over,
  }) as CaseWorkshopBoardItem;

const board = (items: CaseWorkshopBoardItem[]) =>
  ({ items, pagination: {} }) as unknown as CaseWorkshopBoardResponse;

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const PARAMS = { pageSize: 200 };
const KEY = caseWorkshopKeys.board(PARAMS, "KG1");

describe("hook trang tiến độ xưởng", () => {
  beforeEach(() => {
    api.board.mockReset().mockResolvedValue(board([item()]));
    api.timeline.mockReset().mockResolvedValue([]);
    api.createLog.mockReset().mockResolvedValue({} as never);
    progressApi.updateStatus.mockReset();
  });

  it("không chọn chi nhánh vẫn gọi API (mọi chi nhánh); timeline chỉ gọi khi có xe", async () => {
    const { wrapper } = setup();
    renderHook(() => useCaseWorkshopTimelineQuery(null, "KG1"), { wrapper });
    expect(api.timeline).not.toHaveBeenCalled();
    const { result } = renderHook(
      () => useCaseWorkshopBoardQuery(PARAMS, undefined),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.board).toHaveBeenCalledWith(PARAMS, undefined);
    const withBranch = renderHook(
      () => useCaseWorkshopBoardQuery(PARAMS, "KG1"),
      { wrapper },
    );
    await waitFor(() => expect(withBranch.result.current.isSuccess).toBe(true));
    expect(api.board).toHaveBeenCalledWith(PARAMS, "KG1");
  });

  it("moveStatus đổi thẻ lạc quan (status mới, bỏ status nhỏ), lỗi thì hoàn lại", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(KEY, board([item()]));
    let reject: (e: Error) => void = () => undefined;
    progressApi.updateStatus.mockImplementation(
      () => new Promise((_res, rej) => (reject = rej)),
    );
    const { result } = renderHook(() => useCaseWorkshopMutations("KG1"), {
      wrapper,
    });
    act(() => {
      result.current.moveStatus.mutate({ id: "c1", status: "COMPLETED" });
    });
    await waitFor(() =>
      expect(
        client.getQueryData<CaseWorkshopBoardResponse>(KEY)?.items[0],
      ).toMatchObject({
        status: "COMPLETED",
        progressStage: null,
        stageStartedAt: null,
      }),
    );
    expect(progressApi.updateStatus).toHaveBeenCalledWith(
      "c1",
      "COMPLETED",
      "KG1",
    );
    act(() => reject(new Error("400")));
    await waitFor(() =>
      expect(
        client.getQueryData<CaseWorkshopBoardResponse>(KEY)?.items[0].status,
      ).toBe("IN_PROGRESS"),
    );
  });

  it("createLog gọi API với chi nhánh và làm mới board", async () => {
    const { client, wrapper } = setup();
    const spy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCaseWorkshopMutations("KG1"), {
      wrapper,
    });
    await act(() =>
      result.current.createLog.mutateAsync({
        caseId: "c1",
        payload: { kind: "NOTE", note: "x" },
      }),
    );
    expect(api.createLog).toHaveBeenCalledWith(
      "c1",
      { kind: "NOTE", note: "x" },
      "KG1",
    );
    expect(spy).toHaveBeenCalledWith({ queryKey: caseWorkshopKeys.all });
  });

  it("candidates chỉ gọi khi gõ từ 2 ký tự", async () => {
    api.candidates.mockReset().mockResolvedValue([]);
    const { wrapper } = setup();
    renderHook(() => useWorkshopCandidatesQuery("5", "KG1"), { wrapper });
    expect(api.candidates).not.toHaveBeenCalled();
    const { result } = renderHook(
      () => useWorkshopCandidatesQuery(" 51 ", "KG1"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.candidates).toHaveBeenCalledWith("51", "KG1");
  });

  it("track/trackNew gọi API và làm mới board", async () => {
    api.track.mockReset().mockResolvedValue({} as never);
    api.trackNew.mockReset().mockResolvedValue({} as never);
    const { client, wrapper } = setup();
    const spy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCaseWorkshopMutations("KG1"), {
      wrapper,
    });
    await act(() => result.current.track.mutateAsync({ caseId: "c1" }));
    expect(api.track).toHaveBeenCalledWith({ caseId: "c1" }, "KG1");
    await act(() =>
      result.current.trackNew.mutateAsync({ licensePlate: "30A-1" }),
    );
    expect(api.trackNew).toHaveBeenCalledWith({ licensePlate: "30A-1" }, "KG1");
    expect(spy).toHaveBeenCalledWith({ queryKey: caseWorkshopKeys.all });
  });

  it("xem mọi chi nhánh: trackNew gắn chi nhánh tạo mới, track không gửi chi nhánh", async () => {
    api.track.mockReset().mockResolvedValue({} as never);
    api.trackNew.mockReset().mockResolvedValue({} as never);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useCaseWorkshopMutations(undefined, "GR"),
      { wrapper },
    );
    await act(() => result.current.track.mutateAsync({ caseId: "c1" }));
    expect(api.track).toHaveBeenCalledWith({ caseId: "c1" }, undefined);
    await act(() =>
      result.current.trackNew.mutateAsync({ licensePlate: "30A-1" }),
    );
    expect(api.trackNew).toHaveBeenCalledWith({ licensePlate: "30A-1" }, "GR");
  });

  it("board giữ dữ liệu cũ khi đổi bộ lọc cùng chi nhánh, không giữ khi đổi chi nhánh", async () => {
    const { wrapper } = setup();
    type Props = { params: CaseWorkshopBoardParams; branch?: string };
    const initialProps: Props = { params: PARAMS, branch: "KG1" };
    const { result, rerender } = renderHook(
      (p: Props) => useCaseWorkshopBoardQuery(p.params, p.branch),
      { wrapper, initialProps },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    api.board.mockReturnValue(new Promise(() => {}));
    rerender({ params: { ...PARAMS, classification: "OJ" }, branch: "KG1" });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.items).toHaveLength(1);
    rerender({ params: PARAMS, branch: undefined });
    expect(result.current.data).toBeUndefined();
  });

  it("untrack gỡ thẻ lạc quan, lỗi thì hoàn lại", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(KEY, board([item(), item({ id: "c2" })]));
    let reject: (e: Error) => void = () => undefined;
    api.untrack
      .mockReset()
      .mockImplementation(() => new Promise((_r, rej) => (reject = rej)));
    const { result } = renderHook(() => useCaseWorkshopMutations("KG1"), {
      wrapper,
    });
    act(() => result.current.untrack.mutate("c1"));
    await waitFor(() =>
      expect(
        client
          .getQueryData<CaseWorkshopBoardResponse>(KEY)
          ?.items.map((i) => i.id),
      ).toEqual(["c2"]),
    );
    act(() => reject(new Error("500")));
    await waitFor(() =>
      expect(
        client.getQueryData<CaseWorkshopBoardResponse>(KEY)?.items,
      ).toHaveLength(2),
    );
  });
});
