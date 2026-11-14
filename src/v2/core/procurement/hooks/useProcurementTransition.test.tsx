import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProcurementTransition } from "./useProcurementTransition";

const showError = vi.fn();
const showSuccess = vi.fn();

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
vi.mock("../procurement.toast", () => ({
  showProcurementError: (...args: unknown[]) => showError(...args),
  showProcurementSuccess: (...args: unknown[]) => showSuccess(...args),
}));

const conflict = {
  response: {
    status: 409,
    data: {
      code: "INVALID_STATUS_TRANSITION",
      message: "Không thể approve khi đang ở trạng thái APPROVED",
      action: "approve",
      currentStatus: "APPROVED",
    },
  },
};

function setup(error: unknown) {
  const transitionApi = vi.fn(async () => {
    throw error;
  });
  const callbacks = {
    onTransitioned: vi.fn(),
    onRemoved: vi.fn(),
    onAlreadyDecided: vi.fn(),
  };
  const config = {
    queryKey: "garage-pr",
    api: { transition: transitionApi },
  } as never;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useProcurementTransition(config, callbacks), {
    wrapper,
  });
  return { hook, callbacks, transitionApi };
}

describe("useProcurementTransition", () => {
  beforeEach(() => {
    showError.mockClear();
    showSuccess.mockClear();
  });

  it("409 INVALID_STATUS_TRANSITION: gọi onAlreadyDecided với trạng thái hiện tại, không toast lỗi", async () => {
    const { hook, callbacks } = setup(conflict);

    act(() => {
      hook.result.current.transition.mutate({ id: "req-1", action: "approve" });
    });

    await waitFor(() =>
      expect(callbacks.onAlreadyDecided).toHaveBeenCalledWith("APPROVED"),
    );
    expect(showError).not.toHaveBeenCalled();
    expect(callbacks.onTransitioned).not.toHaveBeenCalled();
  });

  it("lỗi khác (ví dụ 403): vẫn toast lỗi, không gọi onAlreadyDecided", async () => {
    const { hook, callbacks } = setup({
      response: { status: 403, data: { message: "Không có quyền" } },
    });

    act(() => {
      hook.result.current.transition.mutate({ id: "req-1", action: "approve" });
    });

    await waitFor(() => expect(showError).toHaveBeenCalledTimes(1));
    expect(callbacks.onAlreadyDecided).not.toHaveBeenCalled();
  });
});
