import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GdtPortalAuthForm } from "../GdtPortalAuthForm";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getPortalConfig: vi.fn(),
    getPortalCaptcha: vi.fn(),
    loginPortal: vi.fn(),
    savePortalConfig: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("GdtPortalAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (erpInvoicesCoreApi.getPortalConfig as any).mockResolvedValue({
      username: "0318334886-003",
      password: "ExistingPassword",
      token: "existing-token",
      cookies: "existing-cookie",
    });
    (erpInvoicesCoreApi.getPortalCaptcha as any).mockResolvedValue({
      content: "base64image",
      key: "captcha-key-123",
    });
  });

  it("renders form fields and loads initial config and captcha", async () => {
    render(<GdtPortalAuthForm />);

    expect(
      screen.getByText("Đăng nhập Cổng Hóa đơn điện tử"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getPortalConfig).toHaveBeenCalled();
      expect(erpInvoicesCoreApi.getPortalCaptcha).toHaveBeenCalled();
    });

    const usernameInput = screen.getByPlaceholderText(
      "Ví dụ: 0318334886 hoặc 0318334886-003",
    ) as HTMLInputElement;
    expect(usernameInput.value).toBe("0318334886-003");

    const passwordInput = screen.getByPlaceholderText(
      "Nhập mật khẩu Cổng thuế...",
    ) as HTMLInputElement;
    expect(passwordInput.value).toBe("ExistingPassword");
  });

  it("submits login with username, password, captcha and key", async () => {
    (erpInvoicesCoreApi.loginPortal as any).mockResolvedValue({
      success: true,
      token: "new-token-999",
      message: "Đăng nhập Cổng Thuế thành công!",
    });
    const onSuccess = vi.fn();

    render(<GdtPortalAuthForm onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getPortalCaptcha).toHaveBeenCalled();
    });

    const captchaInput = screen.getByPlaceholderText(
      "Nhập mã...",
    ) as HTMLInputElement;
    fireEvent.change(captchaInput, { target: { value: "vmrbxr" } });
    expect(captchaInput.value).toBe("VMRBXR");

    const submitBtn = screen.getByRole("button", {
      name: /Đăng nhập & Lưu/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(erpInvoicesCoreApi.loginPortal).toHaveBeenCalledWith({
        username: "0318334886-003",
        password: "ExistingPassword",
        cvalue: "VMRBXR",
        ckey: "captcha-key-123",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("automatically populates captcha text when solver provides it", async () => {
    (erpInvoicesCoreApi.getPortalCaptcha as any).mockResolvedValue({
      content: "base64image",
      key: "captcha-key-123",
      text: "8A9AWD",
    });

    render(<GdtPortalAuthForm />);

    await waitFor(() => {
      const captchaInput = screen.getByPlaceholderText(
        "Nhập mã...",
      ) as HTMLInputElement;
      expect(captchaInput.value).toBe("8A9AWD");
    });
  });
});
