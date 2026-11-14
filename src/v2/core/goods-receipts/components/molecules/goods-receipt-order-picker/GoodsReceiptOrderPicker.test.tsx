import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { GoodsReceiptOrderPicker } from "./GoodsReceiptOrderPicker";

const renderPicker = (
  props: Partial<Parameters<typeof GoodsReceiptOrderPicker>[0]> = {},
) => {
  const sourceOrder = {
    load: vi.fn(),
    search: vi.fn().mockResolvedValue([
      {
        id: "po-1",
        orderNo: "GDMH-1",
        supplierName: "NCC A",
        totalAmount: 100,
      },
    ]),
  };
  const onPick = vi.fn();
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <GoodsReceiptOrderPicker
        sourceOrder={sourceOrder}
        value=""
        label=""
        viewing={false}
        locked={false}
        onPick={onPick}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { sourceOrder, onPick };
};

describe("GoodsReceiptOrderPicker", () => {
  it("liệt kê đơn mua tìm được và báo đơn được chọn", async () => {
    const { sourceOrder, onPick } = renderPicker();
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(
      await screen.findByRole("option", { name: /GDMH-1/ }),
    );
    expect(sourceOrder.search).toHaveBeenCalled();
    expect(onPick).toHaveBeenCalledWith("po-1");
  });

  it("đã khóa thì chỉ hiện số đơn và không tìm đơn", async () => {
    const { sourceOrder } = renderPicker({
      value: "po-1",
      label: "GDMH-1",
      locked: true,
    });
    expect(screen.getByText("GDMH-1")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    await waitFor(() => expect(sourceOrder.search).not.toHaveBeenCalled());
  });
});
