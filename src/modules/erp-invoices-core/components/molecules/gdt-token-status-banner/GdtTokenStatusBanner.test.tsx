import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GdtTokenStatusBanner } from "./GdtTokenStatusBanner";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

describe("GdtTokenStatusBanner", () => {
  it("hiện trạng thái đã kết nối khi có token", () => {
    render(<GdtTokenStatusBanner hasToken />);
    expect(
      screen.getByText("Đã có Token kết nối Cổng Thuế"),
    ).toBeInTheDocument();
  });

  it("hiện cảnh báo chưa có token khi thiếu", () => {
    render(<GdtTokenStatusBanner hasToken={false} />);
    expect(
      screen.getByText("Chưa có Token đăng nhập Cổng Thuế"),
    ).toBeInTheDocument();
  });
});
