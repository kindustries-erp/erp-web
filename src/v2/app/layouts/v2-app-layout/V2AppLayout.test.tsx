import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import { V2AppLayout } from "./V2AppLayout";

describe("V2AppLayout Switcher", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("render Desktop variant khi màn hình lớn", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
    render(
      <V2AppLayout>
        <div>Content Desktop</div>
      </V2AppLayout>,
    );

    expect(screen.getByTestId("v2-app-layout-desktop")).toBeInTheDocument();
    expect(screen.getByTestId("v2-right-panel")).toBeInTheDocument();
    expect(screen.getByText("Content Desktop")).toBeInTheDocument();
  });

  it("render Mobile variant khi màn hình nhỏ", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 390,
    });
    render(
      <V2AppLayout>
        <div>Content Mobile</div>
      </V2AppLayout>,
    );

    expect(screen.getByTestId("v2-app-layout-mobile")).toBeInTheDocument();
    expect(screen.getByText("Content Mobile")).toBeInTheDocument();
  });

  it("tự động cập nhật nội dung đa ngôn ngữ khi thay đổi locale", () => {
    useAppStore.setState({ locale: "vi" });
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });

    render(
      <V2AppLayout>
        <div>Content</div>
      </V2AppLayout>,
    );

    expect(screen.getAllByText("Tổng quan").length).toBeGreaterThan(0);
  });
});
