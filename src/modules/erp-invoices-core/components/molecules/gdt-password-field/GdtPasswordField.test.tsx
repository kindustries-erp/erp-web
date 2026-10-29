import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GdtPasswordField } from "./GdtPasswordField";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const baseProps = {
  value: "",
  onChange: vi.fn(),
  showPassword: false,
  onToggleShow: vi.fn(),
  hasSavedPassword: false,
  disabled: false,
};

describe("GdtPasswordField", () => {
  it("báo đã lưu mật khẩu khi có sẵn", () => {
    render(<GdtPasswordField {...baseProps} hasSavedPassword />);
    expect(screen.getByText("Đã lưu mật khẩu")).toBeInTheDocument();
  });

  it("gọi onChange khi nhập", () => {
    const onChange = vi.fn();
    render(<GdtPasswordField {...baseProps} onChange={onChange} />);
    fireEvent.change(
      screen.getByPlaceholderText("Nhập mật khẩu Cổng thuế..."),
      {
        target: { value: "abc" },
      },
    );
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("nút hiện/ẩn gọi onToggleShow", () => {
    const onToggleShow = vi.fn();
    const { container } = render(
      <GdtPasswordField {...baseProps} onToggleShow={onToggleShow} />,
    );
    fireEvent.click(
      container.querySelector("button[type='button']") as Element,
    );
    expect(onToggleShow).toHaveBeenCalledTimes(1);
  });
});
