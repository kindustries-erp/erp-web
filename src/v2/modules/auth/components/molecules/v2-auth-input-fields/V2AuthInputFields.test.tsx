import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2AuthInputFields } from "./V2AuthInputFields";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string) => key,
  }),
}));

describe("V2AuthInputFields", () => {
  it("renders email and password inputs correctly", () => {
    const handleEmail = vi.fn();
    const handlePassword = vi.fn();
    const handleToggle = vi.fn();

    render(
      <V2AuthInputFields
        email="test@domain.com"
        onEmailChange={handleEmail}
        password="secret"
        onPasswordChange={handlePassword}
        showPassword={false}
        onToggleShowPassword={handleToggle}
        errors={{}}
      />,
    );

    const emailInput = screen.getByLabelText("v2.auth.emailLabel");
    expect(emailInput).toHaveValue("test@domain.com");

    const passwordInput = screen.getByLabelText("v2.auth.passwordLabel");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(toggleButton);
    expect(handleToggle).toHaveBeenCalled();
  });

  it("displays validation errors when present", () => {
    render(
      <V2AuthInputFields
        email=""
        onEmailChange={vi.fn()}
        password=""
        onPasswordChange={vi.fn()}
        showPassword={false}
        onToggleShowPassword={vi.fn()}
        errors={{
          email: "Email required",
          password: "Password required",
        }}
      />,
    );

    expect(screen.getByText("Email required")).toBeInTheDocument();
    expect(screen.getByText("Password required")).toBeInTheDocument();
  });
});
