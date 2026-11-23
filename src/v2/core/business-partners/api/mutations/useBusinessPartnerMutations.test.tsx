import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { emptyBusinessPartnerForm } from "../../domain/entities/businessPartner";
import { businessPartnersV2Api } from "../businessPartnersApi";
import { useSaveBusinessPartnerMutation } from "./useBusinessPartnerMutations";

const t = (_key: string, fallback?: string) => fallback ?? "";

const renderSave = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSaveBusinessPartnerMutation(t, () => undefined), {
    wrapper,
  });
};

describe("useSaveBusinessPartnerMutation toasts", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the create title when saving a new partner (no id)", async () => {
    vi.spyOn(businessPartnersV2Api, "create").mockResolvedValue({} as never);
    const showToast = vi.spyOn(useV2ToastStore.getState(), "showToast");
    const { result } = renderSave();

    act(() =>
      result.current.mutate({
        id: null,
        partnerType: "CUSTOMER",
        form: emptyBusinessPartnerForm(),
      }),
    );

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Đã tạo mới thành công" }),
      ),
    );
  });

  it("shows the update title when saving an existing partner", async () => {
    vi.spyOn(businessPartnersV2Api, "update").mockResolvedValue({} as never);
    const showToast = vi.spyOn(useV2ToastStore.getState(), "showToast");
    const { result } = renderSave();

    act(() =>
      result.current.mutate({
        id: "p1",
        partnerType: "VENDOR",
        form: emptyBusinessPartnerForm(),
      }),
    );

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Đã cập nhật thành công" }),
      ),
    );
  });

  it("uses the create failure title when creating fails", async () => {
    vi.spyOn(businessPartnersV2Api, "create").mockRejectedValue(
      new Error("boom"),
    );
    const showToast = vi.spyOn(useV2ToastStore.getState(), "showToast");
    const { result } = renderSave();

    act(() =>
      result.current.mutate({
        id: null,
        partnerType: "CUSTOMER",
        form: emptyBusinessPartnerForm(),
      }),
    );

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Tạo mới thất bại" }),
      ),
    );
  });
});
