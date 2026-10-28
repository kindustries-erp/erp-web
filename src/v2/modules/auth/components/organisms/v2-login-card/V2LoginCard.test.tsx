import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2LoginCard } from "./V2LoginCard";
import * as loginFormHook from "../../../domain/hooks/useV2LoginForm";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string) => key,
  }),
}));

describe("V2LoginCard", () => {
  it("renders card title, subtitle and form fields", () => {
    render(<V2LoginCard />);

    expect(screen.getByTestId("v2-login-card")).toBeInTheDocument();
    expect(screen.getByText("v2.auth.title")).toBeInTheDocument();
    expect(screen.getByText("v2.auth.subtitle")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "v2.auth.submitButton" }),
    ).toBeInTheDocument();
  });

  it("calls handleSubmit when form submitted and triggers onSuccess", async () => {
    const handleSuccess = vi.fn();
    const mockHandleSubmit = vi.fn().mockResolvedValue(true);

    vi.spyOn(loginFormHook, "useV2LoginForm").mockReturnValue({
      email: "admin@liouni.com",
      setEmail: vi.fn(),
      password: "pass",
      setPassword: vi.fn(),
      showPassword: false,
      toggleShowPassword: vi.fn(),
      errors: {},
      setErrors: vi.fn(),
      loading: false,
      handleSubmit: mockHandleSubmit,
      handleDevQuickFill: vi.fn(),
      hasDevPassword: true,
    });

    render(<V2LoginCard onSuccess={handleSuccess} />);

    const submitBtn = screen.getByRole("button", {
      name: "v2.auth.submitButton",
    });
    fireEvent.click(submitBtn);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("displays general error alert when error exists", () => {
    vi.spyOn(loginFormHook, "useV2LoginForm").mockReturnValue({
      email: "",
      setEmail: vi.fn(),
      password: "",
      setPassword: vi.fn(),
      showPassword: false,
      toggleShowPassword: vi.fn(),
      errors: { general: "Invalid credentials" },
      setErrors: vi.fn(),
      loading: false,
      handleSubmit: vi.fn(),
      handleDevQuickFill: vi.fn(),
      hasDevPassword: true,
    });

    render(<V2LoginCard />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
