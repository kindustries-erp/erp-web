import { beforeEach, describe, expect, it } from "vitest";
import { useV2ToastStore } from "./useV2ToastStore";

describe("useV2ToastStore", () => {
  beforeEach(() => {
    useV2ToastStore.setState({ toasts: [] });
  });

  it("queues toasts with a default variant and unique ids", () => {
    const { showToast } = useV2ToastStore.getState();
    showToast({ title: "Đã lưu" });
    showToast({ title: "Lỗi", variant: "destructive", description: "x" });
    showToast({ title: "Cảnh báo", variant: "warning" });

    const [first, second, third] = useV2ToastStore.getState().toasts;
    expect(first).toMatchObject({ title: "Đã lưu", variant: "default" });
    expect(second).toMatchObject({ variant: "destructive", description: "x" });
    expect(third).toMatchObject({ title: "Cảnh báo", variant: "warning" });
    expect(first.id).not.toBe(second.id);
    expect(second.id).not.toBe(third.id);
  });

  it("dismisses only the requested toast", () => {
    const { showToast } = useV2ToastStore.getState();
    showToast({ title: "A" });
    showToast({ title: "B" });
    const [first, second] = useV2ToastStore.getState().toasts;

    useV2ToastStore.getState().dismissToast(first.id);

    expect(useV2ToastStore.getState().toasts).toEqual([second]);
  });
});
