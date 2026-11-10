import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { V2StandardTable } from "./V2StandardTable";
import { mockViewport, renderTable } from "./mocks/V2StandardTable.fixture";

const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status } });

const isPopupOpen = () =>
  screen.queryByRole("button", { name: "Áp dụng" }) !== null;

describe("V2StandardTable: popup lọc cột khi column-options trả 403", () => {
  it("giữ popup mở và báo không có quyền khi gợi ý giá trị bị 403", async () => {
    mockViewport(false);
    const fetchOptions = vi.fn(async () => {
      throw httpError(403);
    });
    renderTable(V2StandardTable, { fetchOptions });

    fireEvent.click(screen.getByRole("button", { name: "Lọc cột Mã" }));

    await waitFor(() =>
      expect(
        screen.getByText("Bạn không có quyền xem gợi ý giá trị của cột này"),
      ).toBeInTheDocument(),
    );
    expect(isPopupOpen()).toBe(true);
    expect(fetchOptions).toHaveBeenCalledTimes(1);
  });

  it("với retry mặc định của app: popup vẫn mở suốt lúc chờ và sau khi lỗi", async () => {
    mockViewport(false);
    const fetchOptions = vi.fn(async () => {
      throw httpError(403);
    });
    renderTable(V2StandardTable, { fetchOptions }, 1);

    fireEvent.click(screen.getByRole("button", { name: "Lọc cột Mã" }));
    expect(isPopupOpen()).toBe(true);

    await waitFor(() => expect(fetchOptions).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    await waitFor(
      () =>
        expect(
          screen.getByText("Bạn không có quyền xem gợi ý giá trị của cột này"),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(isPopupOpen()).toBe(true);
    expect(fetchOptions).toHaveBeenCalledTimes(1);
  });
});
