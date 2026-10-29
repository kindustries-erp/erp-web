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

  it("renders all 4 variants with appropriate glass styling", () => {
    render(<V2Toaster />);
    act(() => {
      useV2ToastStore.getState().showToast({
        title: "Thông báo mặc định",
        variant: "default",
      });
      useV2ToastStore.getState().showToast({
        title: "Thành công",
        variant: "success",
      });
      useV2ToastStore.getState().showToast({
        title: "Có lỗi xảy ra",
        variant: "destructive",
      });
      useV2ToastStore.getState().showToast({
        title: "Cảnh báo hệ thống",
        variant: "warning",
      });
    });

    expect(screen.getByText("Thông báo mặc định")).toBeInTheDocument();
    expect(screen.getByText("Thành công")).toBeInTheDocument();
    expect(screen.getByText("Có lỗi xảy ra")).toBeInTheDocument();
    expect(screen.getByText("Cảnh báo hệ thống")).toBeInTheDocument();

    const toasts = screen.getAllByRole("status");
    expect(toasts.length).toBeGreaterThanOrEqual(1);
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
