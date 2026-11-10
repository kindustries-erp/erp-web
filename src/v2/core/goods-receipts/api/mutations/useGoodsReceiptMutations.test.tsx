import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGoodsReceiptKeys } from "../goodsReceiptKeys";
import type { GoodsReceiptApi } from "../goodsReceiptApi.type";
import { emptyGoodsReceiptForm } from "../../domain/goodsReceipt";
import { useGoodsReceiptMutations } from "./useGoodsReceiptMutations";

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/v2/shared/stores/useV2ToastStore", () => ({
  useV2ToastStore: { getState: () => ({ showToast }) },
}));

const makeApi = () =>
  ({
    list: vi.fn(),
    options: vi.fn(),
    get: vi.fn(),
    nextCode: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: "new" }),
    update: vi.fn().mockResolvedValue({ id: "r1" }),
    post: vi.fn().mockResolvedValue({ id: "r1" }),
    cancel: vi.fn().mockResolvedValue({ id: "r1" }),
    remove: vi.fn().mockResolvedValue({ id: "r1" }),
  }) as unknown as Record<string, ReturnType<typeof vi.fn>>;

const asApi = (mock: Record<string, ReturnType<typeof vi.fn>>) =>
  mock as unknown as GoodsReceiptApi;

const t = (_key: string, fallback?: string) => fallback ?? "";
const keys = createGoodsReceiptKeys(["v2-test-goods-receipts"]);

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, invalidate };
};

describe("useGoodsReceiptMutations", () => {
  let api: ReturnType<typeof makeApi>;

  beforeEach(() => {
    api = makeApi();
    showToast.mockReset();
  });

  it("lưu phiếu mới: gọi create, làm mới khóa và đóng drawer", async () => {
    const onSaved = vi.fn();
    const { wrapper, invalidate } = makeWrapper();
    const form = emptyGoodsReceiptForm();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t, onSaved }),
      { wrapper },
    );

    await act(async () => {
      await result.current.save.mutateAsync({ id: null, form });
    });

    expect(api.create).toHaveBeenCalledWith(form);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.all });
    expect(onSaved).toHaveBeenCalled();
  });

  it("lưu phiếu có sẵn: gọi update với đúng id", async () => {
    const { wrapper } = makeWrapper();
    const form = emptyGoodsReceiptForm();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t }),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.save.mutateAsync({ id: "r1", form });
    });

    expect(api.update).toHaveBeenCalledWith("r1", form);
  });

  it("lưu lỗi: hiện toast destructive và không gọi onSaved", async () => {
    api.create.mockRejectedValue(new Error("boom"));
    const onSaved = vi.fn();
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t, onSaved }),
      { wrapper },
    );

    await act(async () => {
      await result.current.save
        .mutateAsync({ id: null, form: emptyGoodsReceiptForm() })
        .catch(() => undefined);
    });

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" }),
      ),
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("hủy thành công: gọi cancel, toast thành công và onCancelled", async () => {
    const onCancelled = vi.fn();
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t, onCancelled }),
      { wrapper },
    );

    await act(async () => {
      await result.current.cancel.mutateAsync("r1");
    });

    expect(api.cancel).toHaveBeenCalledWith("r1");
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success" }),
    );
    expect(onCancelled).toHaveBeenCalled();
  });

  it("hủy lỗi: hiện toast destructive và không gọi onCancelled", async () => {
    api.cancel.mockRejectedValue(new Error("boom"));
    const onCancelled = vi.fn();
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t, onCancelled }),
      { wrapper },
    );

    await act(async () => {
      await result.current.cancel.mutateAsync("r1").catch(() => undefined);
    });

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" }),
      ),
    );
    expect(onCancelled).not.toHaveBeenCalled();
  });

  it("ghi sổ thành công: gọi post và toast thành công", async () => {
    const onPosted = vi.fn();
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t, onPosted }),
      { wrapper },
    );

    await act(async () => {
      await result.current.post.mutateAsync("r1");
    });

    expect(api.post).toHaveBeenCalledWith("r1");
    expect(onPosted).toHaveBeenCalled();
  });

  it("xóa mềm thành công: gọi remove và onRemoved", async () => {
    const onRemoved = vi.fn();
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useGoodsReceiptMutations({ api: asApi(api), keys, t, onRemoved }),
      { wrapper },
    );

    await act(async () => {
      await result.current.remove.mutateAsync("r1");
    });

    expect(api.remove).toHaveBeenCalledWith("r1");
    expect(onRemoved).toHaveBeenCalled();
  });
});
