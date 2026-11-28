import { describe, expect, it, vi } from "vitest";
import { buildCustomerCaseRowActions } from "./customerCaseActions.helper";

const row = { id: "case-1", khachHangName: "Khách A", bienSoXe: "51A-1" };

const paramsOf = (label: string) => {
  const onCreateCashflow = vi.fn();
  const items = buildCustomerCaseRowActions(
    row,
    {
      onOpenCaseDetail: vi.fn(),
      onOpenSettlementModal: vi.fn(),
      onOpenInvoiceLinkingModal: vi.fn(),
      onCreateCashflow,
    },
    (_key, fallback) => fallback,
  ).flatMap((group: any) => group.items);
  (items.find((i: any) => i.label === label) as any).onClick();
  return onCreateCashflow.mock.calls[0][0];
};

describe("buildCustomerCaseRowActions: tạo phiếu thu chi", () => {
  it("phiếu thu mang theo tên khách", () => {
    expect(paramsOf("Tạo phiếu thu vụ việc...").partnerName).toBe("Khách A");
  });

  it("phiếu chi không mang theo tên khách", () => {
    expect(paramsOf("Tạo phiếu chi vụ việc...").partnerName).toBeUndefined();
  });
});
