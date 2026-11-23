import { describe, expect, it } from "vitest";
import {
  consumeProcurementRequestIntent,
  useProcurementIntentStore,
} from "./procurement.intent";
import { orderFormFromRequestDraft } from "./form/procurementOrder.form";
import type {
  ProcurementPoDraft,
  ProcurementRequestDetail,
} from "./procurement.types";

describe("ý định tạo PO từ PR", () => {
  it("chỉ đọc được một lần rồi tự xóa", () => {
    useProcurementIntentStore.getState().setPendingRequestId("pr-1");
    expect(consumeProcurementRequestIntent()).toBe("pr-1");
    expect(consumeProcurementRequestIntent()).toBeNull();
  });
});

describe("điền PO từ bản nháp PR", () => {
  const request = {
    id: "pr-1",
    requestNo: "DNM-1",
    branchId: "b1",
    branchName: "CN1",
    requestDate: "2026-11-01",
    neededDate: null,
    remarks: null,
    lines: [],
  } as unknown as ProcurementRequestDetail;
  const draft: ProcurementPoDraft = {
    requestId: "pr-1",
    requestNo: "DNM-1",
    lines: [
      {
        requestLineId: "rl-1",
        lineNo: 1,
        lineType: "GOODS",
        itemId: null,
        itemCode: "LD-01",
        itemName: "Lọc dầu",
        description: null,
        qtyRemaining: 3,
        estUnitPrice: 150000,
      },
    ],
  };

  it("lấy chi nhánh từ PR, số lượng còn lại và đơn giá dự kiến", () => {
    const form = orderFormFromRequestDraft(request, draft);
    expect(form.branchId).toBe("b1");
    expect(form.requestId).toBe("pr-1");
    expect(form.lines[0]).toMatchObject({
      itemCode: "LD-01",
      qty: "3",
      price: "150000",
      requestLineId: "rl-1",
    });
  });

  it("điền ngày dự kiến nhận từ ngày cần hàng của đề nghị", () => {
    const form = orderFormFromRequestDraft(
      {
        ...request,
        neededDate: "2026-11-20",
      } as unknown as ProcurementRequestDetail,
      draft,
    );
    expect(form.expectedDate).toBe("2026-11-20");
  });

  it("để trống ngày dự kiến nhận khi đề nghị không có ngày cần hàng", () => {
    const form = orderFormFromRequestDraft(request, draft);
    expect(form.expectedDate).toBe("");
  });
});
