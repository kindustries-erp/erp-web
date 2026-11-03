import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GdtCaptchaField } from "./GdtCaptchaField";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const baseProps = {
  img: "data:image/png;base64,AAAA",
  isLoading: false,
  value: "",
  onValueChange: vi.fn(),
  onReload: vi.fn(),
  disabled: false,
};

describe("GdtCaptchaField", () => {
  it("hiện ảnh captcha khi đã có", () => {
    render(<GdtCaptchaField {...baseProps} />);
    expect(screen.getByAltText("Captcha")).toHaveAttribute(
      "src",
      "data:image/png;base64,AAAA",
    );
  });

  it("hiện chữ Trống khi chưa có ảnh", () => {
    render(<GdtCaptchaField {...baseProps} img={null} />);
    expect(screen.getByText("Trống")).toBeInTheDocument();
  });

  it("viết hoa chữ người dùng nhập", () => {
    const onValueChange = vi.fn();
    render(<GdtCaptchaField {...baseProps} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByPlaceholderText("Nhập mã..."), {
      target: { value: "abc" },
    });
    expect(onValueChange).toHaveBeenCalledWith("ABC");
  });

  it("nút Đổi mã gọi onReload", () => {
    const onReload = vi.fn();
    render(<GdtCaptchaField {...baseProps} onReload={onReload} />);
    fireEvent.click(screen.getByRole("button", { name: /Đổi mã/ }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
