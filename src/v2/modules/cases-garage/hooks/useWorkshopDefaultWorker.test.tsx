import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useWorkshopDefaultWorker } from "./useWorkshopDefaultWorker";

const workers = [
  { id: "e1", code: "NV01", fullName: "Thợ A", jobTitle: null },
  { id: "e2", code: "NV02", fullName: "Thợ B", jobTitle: null },
];
const login = (code: string | null) =>
  useAuthStore.setState({
    employee: code ? ({ employee_code: code } as never) : null,
  } as never);

describe("useWorkshopDefaultWorker", () => {
  it("khớp mã nhân viên người đăng nhập; giữ cố định khi danh sách đổi", () => {
    login("NV02");
    const { result, rerender } = renderHook(
      ({ list }) => useWorkshopDefaultWorker(list),
      { initialProps: { list: workers } },
    );
    expect(result.current).toEqual({ workerId: "e2", workerName: "Thợ B" });
    rerender({ list: [workers[0]] });
    expect(result.current).toEqual({ workerId: "e2", workerName: "Thợ B" });
  });

  it("không khớp hoặc chưa đăng nhập thì không điền sẵn", () => {
    login("NV99");
    expect(
      renderHook(() => useWorkshopDefaultWorker(workers)).result.current,
    ).toBeNull();
    login(null);
    expect(
      renderHook(() => useWorkshopDefaultWorker(workers)).result.current,
    ).toBeNull();
  });
});
