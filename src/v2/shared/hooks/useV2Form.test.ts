import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useV2Form } from "./useV2Form";

interface TestForm {
  code: string;
  name: string;
  count: number;
}

const initialValues: TestForm = {
  code: "BP-001",
  name: "Liouni Garage",
  count: 5,
};

describe("useV2Form", () => {
  beforeEach(() => {
    useV2ToastStore.setState({ toasts: [] });
  });

  it("khởi tạo state mặc định chuẩn xác", () => {
    const { result } = renderHook(() => useV2Form<TestForm>({ initialValues }));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.mode).toBe("edit");
  });

  it("cập nhật field đơn lẻ qua setFieldValue và cập nhật isDirty", () => {
    const { result } = renderHook(() => useV2Form<TestForm>({ initialValues }));

    act(() => {
      result.current.setFieldValue("name", "New Name");
    });

    expect(result.current.values.name).toBe("New Name");
    expect(result.current.isDirty).toBe(true);
  });

  it("hỗ trợ cập nhật nhiều trường qua setValues", () => {
    const { result } = renderHook(() => useV2Form<TestForm>({ initialValues }));

    act(() => {
      result.current.setValues({ code: "BP-999", count: 10 });
    });

    expect(result.current.values.code).toBe("BP-999");
    expect(result.current.values.count).toBe(10);
    expect(result.current.isDirty).toBe(true);
  });

  it("reset đưa form về trạng thái ban đầu", () => {
    const { result } = renderHook(() => useV2Form<TestForm>({ initialValues }));

    act(() => {
      result.current.setFieldValue("name", "Changed");
      result.current.setFieldError("name", "Lỗi");
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("chạy validate khi blur khỏi field", () => {
    const validate = vi.fn((vals: TestForm) => {
      if (!vals.name.trim()) return { name: "Tên là bắt buộc" };
      return {};
    });

    const { result } = renderHook(() =>
      useV2Form<TestForm>({ initialValues, validate }),
    );

    act(() => {
      result.current.setFieldValue("name", "");
    });

    act(() => {
      result.current.handleBlur("name");
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.name).toBe("Tên là bắt buộc");
    expect(result.current.isValid).toBe(false);
  });

  it("handleSubmit chặn submit và toast lỗi nếu form không hợp lệ", async () => {
    const onSubmit = vi.fn();
    const validate = (vals: TestForm) => ({
      code: vals.code ? undefined : "Mã không được để trống",
    });

    const { result } = renderHook(() =>
      useV2Form<TestForm>({
        initialValues: { ...initialValues, code: "" },
        validate,
        onSubmit,
        showErrorToast: true,
      }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.code).toBe("Mã không được để trống");
    expect(result.current.touched.code).toBe(true);

    // Kiểm tra toast lỗi được kích hoạt
    const toasts = useV2ToastStore.getState().toasts;
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts[0].description).toBe("Mã không được để trống");
  });

  it("handleSubmit gọi onSubmit thành công khi hợp lệ", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useV2Form<TestForm>({
        initialValues,
        onSubmit,
      }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith(initialValues);
  });

  it("register trả về binding props đầy đủ", () => {
    const { result } = renderHook(() =>
      useV2Form<TestForm>({ initialValues, mode: "view" }),
    );

    const binding = result.current.register("name");

    expect(binding.name).toBe("name");
    expect(binding.value).toBe(initialValues.name);
    expect(binding.viewing).toBe(true);

    act(() => {
      binding.onChange("Updated via register");
    });

    expect(result.current.values.name).toBe("Updated via register");
  });
});
