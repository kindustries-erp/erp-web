import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { list } = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/v2/modules/finance-invoice/api/financeInvoiceV2Api", () => ({
  financeInvoiceV2Api: { list },
}));

import { useCashInvoiceNetOffPicker } from "./useCashInvoiceNetOffPicker";

const INVOICES = [
  {
    id: "i1",
    serialNo: "C24T",
    invoiceNo: "001",
    totalAmount: "1000",
    netOffAmount: "300",
    sellerName: "ACME",
    buyerName: "Khách",
  },
  {
    id: "i2",
    serialNo: "C24T",
    invoiceNo: "002",
    totalAmount: "500",
    netOffAmount: "0",
    sellerName: "Beta",
    buyerName: "Khách",
  },
  {
    id: "i3",
    serialNo: "C24T",
    invoiceNo: "003",
    totalAmount: "200",
    netOffAmount: "200",
    sellerName: "Gamma",
    buyerName: "Khách",
  },
  {
    id: "i4",
    serialNo: "C24T",
    invoiceNo: "004",
    totalAmount: "400",
    netOffAmount: "0",
    sellerName: "Delta",
    buyerName: "Khách",
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const renderPicker = (
  existingInvoiceIds: string[] = [],
  maxAvailableAmount = 600,
) =>
  renderHook(
    () =>
      useCashInvoiceNetOffPicker({
        open: true,
        direction: "IN",
        existingInvoiceIds,
        maxAvailableAmount,
      }),
    { wrapper },
  );

describe("useCashInvoiceNetOffPicker", () => {
  beforeEach(() => {
    list.mockReset();
    list.mockResolvedValue({ items: INVOICES });
  });

  it("bỏ hóa đơn đã liên kết và hóa đơn hết số dư, lấy đối tác theo chiều IN", async () => {
    const { result } = renderPicker(["i4"]);
    await waitFor(() => expect(result.current.rows.length).toBeGreaterThan(0));
    expect(result.current.rows.map((r) => r.id)).toEqual(["i1", "i2"]);
    expect(result.current.rows[0].partner).toBe("ACME");
    expect(result.current.rows[0].remaining).toBe(700);
  });

  it("chọn mới phân bổ hạn mức theo thứ tự, tổng đúng bằng hạn mức thì vẫn xác nhận được", async () => {
    const { result } = renderPicker([], 600);
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    act(() => result.current.setSelectedKeys(["i1", "i2"]));
    // i1 còn 700 nhưng hạn mức chỉ 600 → lấy 600; hạn mức đã hết nên i2 nhận 0
    expect(result.current.amounts).toEqual({ i1: 600, i2: 0 });
    expect(result.current.exceeds).toBe(false);
    expect(result.current.canConfirm).toBe(true);
  });

  it("nhập số vượt hạn mức thì báo vượt và không cho xác nhận", async () => {
    const { result } = renderPicker([], 600);
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    act(() => result.current.setSelectedKeys(["i2"]));
    act(() => result.current.setAmount("i2", 450));
    act(() => result.current.setSelectedKeys(["i1", "i2"]));
    act(() => result.current.setAmount("i1", 300));
    expect(result.current.exceeds).toBe(true);
    expect(result.current.canConfirm).toBe(false);
  });

  it("chỉ gửi các khoản có số tiền dương khi xác nhận", async () => {
    const { result } = renderPicker([], 1000);
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    act(() => result.current.setSelectedKeys(["i1", "i2"]));
    act(() => result.current.setAmount("i2", 0));
    expect(result.current.payload).toEqual([
      { invoiceId: "i1", netOffAmount: 700 },
    ]);
    expect(result.current.canConfirm).toBe(true);
  });

  it("kẹp số nhập vào phần còn lại của hóa đơn", async () => {
    const { result } = renderPicker([], 5000);
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    act(() => result.current.setSelectedKeys(["i2"]));
    act(() => result.current.setAmount("i2", 9999));
    expect(result.current.amounts.i2).toBe(500);
  });
});
