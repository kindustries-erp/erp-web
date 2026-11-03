import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GdtPortalAuthForm } from "./GdtPortalAuthForm";
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

// Trả về chuỗi mặc định tiếng Việt để giữ nguyên các assertion theo nhãn
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string"
        ? fallback
        : ((fallback as { defaultValue?: string })?.defaultValue ?? key),
  }),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};

describe("GdtPortalAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (erpInvoicesCoreApi.getPortalConfig as any).mockResolvedValue({
      username: "0318334886-003",
      hasPassword: true,
      hasToken: true,
    });
    (erpInvoicesCoreApi.getPortalCaptcha as any).mockResolvedValue({
      content: "base64image",
      key: "captcha-key-123",
    });
  });

  it("renders form fields and loads initial config and captcha", async () => {
    renderWithClient(<GdtPortalAuthForm />);

    expect(
      screen.getByText("Đăng nhập Cổng Hóa đơn điện tử"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getPortalConfig).toHaveBeenCalled();
      expect(erpInvoicesCoreApi.getPortalCaptcha).toHaveBeenCalled();
      const usernameInput = screen.getByPlaceholderText(
        "Ví dụ: 0318334886 hoặc 0318334886-003",
      ) as HTMLInputElement;
      expect(usernameInput.value).toBe("0318334886-003");
    });
    expect(
      screen.getByText("Đã có Token kết nối Cổng Thuế"),
    ).toBeInTheDocument();
  });

  it("submits login with username, password, captcha and key", async () => {
    (erpInvoicesCoreApi.loginPortal as any).mockResolvedValue({
      success: true,
      hasToken: true,
      message: "Đăng nhập Cổng Thuế thành công!",
    });
    const onSuccess = vi.fn();

    renderWithClient(<GdtPortalAuthForm onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getPortalCaptcha).toHaveBeenCalled();
    });

    const passwordInput = screen.getByPlaceholderText(
      "Nhập mật khẩu Cổng thuế...",
    ) as HTMLInputElement;
    fireEvent.change(passwordInput, {
      target: { value: "MySecurePassword123" },
    });

    const captchaInput = screen.getByPlaceholderText(
      "Nhập mã...",
    ) as HTMLInputElement;
    fireEvent.change(captchaInput, { target: { value: "vmrbxr" } });
    expect(captchaInput.value).toBe("VMRBXR");

    fireEvent.click(screen.getByRole("button", { name: /Đăng nhập & Lưu/i }));

    await waitFor(() => {
      expect(erpInvoicesCoreApi.loginPortal).toHaveBeenCalledWith({
        username: "0318334886-003",
        password: "MySecurePassword123",
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
      text: "AUTO88",
    });

    renderWithClient(<GdtPortalAuthForm />);

    await waitFor(() => {
      const captchaInput = screen.getByPlaceholderText(
        "Nhập mã...",
      ) as HTMLInputElement;
      expect(captchaInput.value).toBe("AUTO88");
    });
  });
});
