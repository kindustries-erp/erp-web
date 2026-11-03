import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useV2LoginForm } from "./useV2LoginForm";
import { useAuthStore } from "@/modules/auth/domain/authStore";

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string) => key,
  }),
}));

describe("useV2LoginForm", () => {
  const mockLoginAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      loginAction: mockLoginAction,
      loading: false,
    } as any);
  });

  it("should initialize with empty credentials and false showPassword", () => {
    const { result } = renderHook(() => useV2LoginForm());

    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.showPassword).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("should toggle password visibility", () => {
    const { result } = renderHook(() => useV2LoginForm());

    act(() => {
      result.current.toggleShowPassword();
    });
    expect(result.current.showPassword).toBe(true);

    act(() => {
      result.current.toggleShowPassword();
    });
    expect(result.current.showPassword).toBe(false);
  });

  it("should fail validation on empty credentials", async () => {
    const { result } = renderHook(() => useV2LoginForm());

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(result.current.errors.email).toBe("v2.auth.errorEmailRequired");
    expect(result.current.errors.password).toBe(
      "v2.auth.errorPasswordRequired",
    );
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it("should fail validation on invalid email format", async () => {
    const { result } = renderHook(() => useV2LoginForm());

    act(() => {
      result.current.setEmail("invalid-email");
      result.current.setPassword("secret123");
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(result.current.errors.email).toBe("v2.auth.errorEmailFormat");
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it("should call loginAction when valid and return true", async () => {
    mockLoginAction.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useV2LoginForm());

    act(() => {
      result.current.setEmail("user@example.com");
      result.current.setPassword("valid-password");
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(mockLoginAction).toHaveBeenCalledWith(
      "user@example.com",
      "valid-password",
    );
    expect(result.current.errors).toEqual({});
  });

  it("should set general error when loginAction throws", async () => {
    mockLoginAction.mockRejectedValueOnce(new Error("Unauthorized"));
    const { result } = renderHook(() => useV2LoginForm());

    act(() => {
      result.current.setEmail("user@example.com");
      result.current.setPassword("wrong-password");
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(result.current.errors.general).toBe("v2.auth.errorInvalid");
  });
});
