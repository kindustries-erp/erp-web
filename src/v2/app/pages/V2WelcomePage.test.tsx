import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import { V2WelcomePage } from "./V2WelcomePage";

describe("V2WelcomePage", () => {
  it("render nội dung mặc định tiếng Việt", () => {
    useAppStore.setState({ locale: "vi" });
    render(<V2WelcomePage />);

    expect(screen.getByText("Khung Ứng Dụng ERP V2")).toBeInTheDocument();
    expect(screen.getByText("Nền tảng V2 Sẵn sàng")).toBeInTheDocument();
    expect(screen.getByText("Khám phá giao diện V2")).toBeInTheDocument();
  });

  it("render nội dung tiếng Anh khi thay đổi locale sang EN", () => {
    useAppStore.setState({ locale: "en" });
    const { rerender } = render(<V2WelcomePage />);

    expect(screen.getByText("ERP V2 Application Shell")).toBeInTheDocument();
    expect(screen.getByText("V2 Platform Ready")).toBeInTheDocument();
    expect(screen.getByText("Explore V2 Interface")).toBeInTheDocument();

    // Switch back to VI
    act(() => {
      useAppStore.getState().setLocale("vi");
    });
    rerender(<V2WelcomePage />);

    expect(screen.getByText("Khung Ứng Dụng ERP V2")).toBeInTheDocument();
  });
});
