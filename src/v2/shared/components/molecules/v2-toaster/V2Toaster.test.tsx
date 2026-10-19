import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { V2Toaster } from "./V2Toaster";

describe("V2Toaster", () => {
  beforeEach(() => {
    useV2ToastStore.setState({ toasts: [] });
  });

  it("renders queued toasts with their description", () => {
    render(<V2Toaster />);
    act(() => {
      useV2ToastStore
        .getState()
        .showToast({ title: "Đã xóa đối tác", description: "KH-001" });
    });

    expect(screen.getByText("Đã xóa đối tác")).toBeInTheDocument();
    expect(screen.getByText("KH-001")).toBeInTheDocument();
  });

  it("removes a toast from the store when its close button is pressed", () => {
    render(<V2Toaster />);
    act(() => {
      useV2ToastStore
        .getState()
        .showToast({ title: "Lỗi", variant: "destructive" });
    });

    act(() => {
      screen.getByRole("button", { name: "Đóng" }).click();
    });

    expect(useV2ToastStore.getState().toasts).toHaveLength(0);
  });
});
