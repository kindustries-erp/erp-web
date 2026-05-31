import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "@/pages/Login";
import { vi as viLocale } from "@/core/locale/vi";

// -- Mocks --------------------------------------------------------------------

const mockToggleLocale = vi.fn();
const mockToggleAppTheme = vi.fn();
let mockLocale: "vi" | "en" = "vi";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({
    locale: mockLocale,
    toggleLocale: mockToggleLocale,
    appTheme: "orcaq",
    toggleAppTheme: mockToggleAppTheme,
  }),
}));

const mockLoginAction = vi.fn();
let mockLoading = false;

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    loginAction: mockLoginAction,
    loading: mockLoading,
  }),
}));

// Use the real Vietnamese dictionary so assertions read like the UI.
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const parts = key.split(".");
    let cur: unknown = viLocale;
    for (const p of parts) {
      if (cur == null || typeof cur !== "object") return key;
      cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === "string" ? cur : key;
  },
}));

const L = viLocale.login;

describe("Login", () => {
  beforeEach(() => {
    mockToggleLocale.mockClear();
    mockToggleAppTheme.mockClear();
    mockLoginAction.mockReset();
    mockLocale = "vi";
    mockLoading = false;
  });

  it("renders title, subtitle and submit button", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: L.title })).toBeInTheDocument();
    expect(screen.getByText(L.subtitle)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: L.submit })).toBeInTheDocument();
  });

  it("does NOT render the theme switch button (only the language toggle)", () => {
    render(<Login />);
    const buttons = screen.getAllByRole("button");
    // Expected buttons: language toggle, password show/hide, submit. No theme switch.
    const themeButton = buttons.find((b) =>
      b.getAttribute("title")?.startsWith(viLocale.nav.bottom.themeStyle),
    );
    expect(themeButton).toBeUndefined();
    expect(mockToggleAppTheme).not.toHaveBeenCalled();
  });

  it("shows the language toggle button", () => {
    render(<Login />);
    const langButton = screen.getByTitle("Switch to English");
    expect(langButton).toBeInTheDocument();
    fireEvent.click(langButton);
    expect(mockToggleLocale).toHaveBeenCalledTimes(1);
  });

  it("validates required email and password", async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: L.submit }));

    expect(await screen.findByText(L.errorEmailRequired)).toBeInTheDocument();
    expect(screen.getByText(L.errorPasswordRequired)).toBeInTheDocument();
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    render(<Login />);
    const [emailInput] = screen.getAllByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: L.submit }));

    expect(await screen.findByText(L.errorEmailFormat)).toBeInTheDocument();
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it("toggles password visibility", () => {
    const { container } = render(<Login />);
    const passwordInput = container.querySelector(
      'input[autocomplete="current-password"]',
    ) as HTMLInputElement;
    const toggleButton = passwordInput.parentElement!.querySelector(
      'button[type="button"]',
    ) as HTMLButtonElement;

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("calls loginAction with trimmed credentials on valid submit", async () => {
    mockLoginAction.mockResolvedValueOnce(undefined);
    const { container } = render(<Login />);

    const emailInput = container.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[autocomplete="current-password"]',
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "  user@test.com  " } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: L.submit }));

    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith(
        "user@test.com",
        "secret123",
      );
    });
  });

  it("shows a general error when loginAction rejects", async () => {
    mockLoginAction.mockRejectedValueOnce(new Error("bad credentials"));
    const { container } = render(<Login />);

    const emailInput = container.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[autocomplete="current-password"]',
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: L.submit }));

    expect(await screen.findByText(L.errorInvalid)).toBeInTheDocument();
  });

  it("disables the submit button and shows loading label while loading", () => {
    mockLoading = true;
    render(<Login />);
    const submit = screen.getByRole("button", {
      name: L.loading,
    }) as HTMLButtonElement;
    expect(submit).toBeDisabled();
  });
});
