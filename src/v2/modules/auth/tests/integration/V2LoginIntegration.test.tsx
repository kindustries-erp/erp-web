import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { V2LoginPage } from "../../pages/login/V2LoginPage";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import * as viewportHook from "@/v2/shared/hooks/useViewport";

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    locale: "vi",
    setLocale: vi.fn(),
    t: (key: string) => key,
    isVietnamese: true,
    isEnglish: false,
  }),
}));

describe("V2LoginIntegration End-to-End Form Flow", () => {
  const mockLoginAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1280,
      height: 900,
    });

    vi.mocked(useAuthStore).mockReturnValue({
      loginAction: mockLoginAction,
      loading: false,
    } as any);
  });

  it("validates fields, prevents API call on invalid data", async () => {
    render(<V2LoginPage />);

    const submitBtn = screen.getByRole("button", {
      name: "v2.auth.submitButton",
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("v2.auth.errorEmailRequired"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("v2.auth.errorPasswordRequired"),
      ).toBeInTheDocument();
    });

    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it("submits valid credentials and calls loginAction", async () => {
    mockLoginAction.mockResolvedValueOnce(undefined);
    const handleSuccess = vi.fn();

    render(<V2LoginPage onSuccess={handleSuccess} />);

    const emailInput = screen.getByLabelText("v2.auth.emailLabel");
    const passwordInput = screen.getByLabelText("v2.auth.passwordLabel");
    const submitBtn = screen.getByRole("button", {
      name: "v2.auth.submitButton",
    });

    fireEvent.change(emailInput, { target: { value: "admin@liouni.com" } });
    fireEvent.change(passwordInput, { target: { value: "securepassword" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith(
        "admin@liouni.com",
        "securepassword",
      );
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it("displays alert on invalid credentials rejection", async () => {
    mockLoginAction.mockRejectedValueOnce(new Error("Invalid login"));

    render(<V2LoginPage />);

    const emailInput = screen.getByLabelText("v2.auth.emailLabel");
    const passwordInput = screen.getByLabelText("v2.auth.passwordLabel");
    const submitBtn = screen.getByRole("button", {
      name: "v2.auth.submitButton",
    });

    fireEvent.change(emailInput, { target: { value: "wrong@liouni.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "v2.auth.errorInvalid",
      );
    });
  });
});
