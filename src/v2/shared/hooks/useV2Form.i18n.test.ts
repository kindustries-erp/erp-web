import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2Form } from "./useV2Form";

interface TestForm {
  name: string;
}

describe("useV2Form - i18n support", () => {
  beforeEach(() => {
    useV2ToastStore.setState({ toasts: [] });
    useV2LocaleStore.getState().setLocale("vi");
  });

  it("toast lỗi dùng tiêu đề tiếng Việt mặc định từ v2.form.missingInfo", async () => {
    const validate = () => ({ name: "Tên là bắt buộc" });
    const { result } = renderHook(() =>
      useV2Form<TestForm>({
        initialValues: { name: "" },
        validate,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    const toasts = useV2ToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].title).toBe("Thiếu thông tin");
    expect(toasts[0].description).toBe("Tên là bắt buộc");
  });

  it("toast lỗi dùng tiêu đề tiếng Anh khi locale là en", async () => {
    act(() => {
      useV2LocaleStore.getState().setLocale("en");
    });
    const validate = () => ({ name: "Name is required" });
    const { result } = renderHook(() =>
      useV2Form<TestForm>({
        initialValues: { name: "" },
        validate,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    const toasts = useV2ToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].title).toBe("Missing information");
    expect(toasts[0].description).toBe("Name is required");

    // Reset về vi
    act(() => {
      useV2LocaleStore.getState().setLocale("vi");
    });
  });
});
