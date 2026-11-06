import { describe, expect, it } from "vitest";
import {
  emptyProcurementLine,
  procurementLineAmount,
  procurementLineFromDetail,
  sumProcurementLines,
  toNumberOrNull,
  validateProcurementLines,
} from "./procurementLine.form";
import {
  emptyOrderForm,
  hasOrderFormErrors,
  toOrderCreatePayload,
  toOrderHeaderPayload,
  validateOrderForm,
} from "./procurementOrder.form";
import {
  emptyRequestForm,
  hasRequestFormErrors,
  toRequestCreatePayload,
  toRequestHeaderPayload,
  validateRequestForm,
} from "./procurementRequest.form";

const filledLine = (
  over: Partial<ReturnType<typeof emptyProcurementLine>> = {},
) => ({
  ...emptyProcurementLine(),
  itemName: "Lọc dầu",
  qty: "2",
  price: "150000",
  ...over,
});

describe("dòng chứng từ", () => {
  it("thành tiền = số lượng x đơn giá, thiếu đơn giá thì null", () => {
    expect(procurementLineAmount({ qty: "2", price: "150000" })).toBe(300000);
    expect(procurementLineAmount({ qty: "2", price: "" })).toBeNull();
  });

  it("cộng tổng bỏ qua dòng chưa có đơn giá", () => {
    expect(
      sumProcurementLines([
        { qty: "2", price: "100" },
        { qty: "1", price: "" },
      ]),
    ).toBe(200);
  });

  it("báo lỗi khi không có dòng, thiếu tên hoặc số lượng không dương", () => {
    expect(validateProcurementLines([])).toBe("empty");
    expect(validateProcurementLines([filledLine({ itemName: " " })])).toBe(
      "itemName",
    );
    expect(validateProcurementLines([filledLine({ qty: "0" })])).toBe("qty");
    expect(validateProcurementLines([filledLine()])).toBeNull();
  });
});

describe("dòng từ API (API trả số, không phải chuỗi)", () => {
  it("toNumberOrNull nhận số và không gọi trim trên số", () => {
    expect(toNumberOrNull(150000)).toBe(150000);
    expect(toNumberOrNull(0)).toBe(0);
    expect(toNumberOrNull(null)).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
    expect(toNumberOrNull("  ")).toBeNull();
  });

  it("dòng PO từ API có số lượng và đơn giá dạng số vẫn thành form chuỗi", () => {
    const line = procurementLineFromDetail({
      id: "l1",
      lineType: "GOODS",
      itemName: "Dầu nhớt",
      qtyOrdered: 2,
      unitPrice: 150000,
    });
    expect(line.qty).toBe("2");
    expect(line.price).toBe("150000");
    expect(procurementLineAmount(line)).toBe(300000);
    expect(sumProcurementLines([line])).toBe(300000);
  });

  it("dòng PR từ API dùng qtyRequested và estUnitPrice dạng số", () => {
    const line = procurementLineFromDetail({
      id: "l2",
      lineType: "GOODS",
      itemName: "Vật tư",
      qtyRequested: 3,
      estUnitPrice: 90000,
    });
    expect(line.qty).toBe("3");
    expect(line.price).toBe("90000");
  });

  it("giá trị null từ API thành ô trống và không gây lỗi", () => {
    const line = procurementLineFromDetail({
      id: "l3",
      lineType: "SERVICE",
      itemName: "Dịch vụ",
      qtyOrdered: 1,
      unitPrice: null,
      estUnitPrice: null,
    });
    expect(line.price).toBe("");
    expect(procurementLineAmount(line)).toBeNull();
    expect(sumProcurementLines([line])).toBe(0);
  });
});

describe("form đơn mua (PO)", () => {
  it("bắt buộc chi nhánh và dòng hợp lệ trước khi lưu", () => {
    const form = emptyOrderForm("2026-11-05");
    expect(hasOrderFormErrors(validateOrderForm(form))).toBe(true);
    const ok = { ...form, branchId: "b1", lines: [filledLine()] };
    expect(hasOrderFormErrors(validateOrderForm(ok))).toBe(false);
  });

  it("payload tạo đơn đổi số lượng và đơn giá sang trường của PO", () => {
    const payload = toOrderCreatePayload({
      ...emptyOrderForm("2026-11-05"),
      branchId: "b1",
      supplierId: "s1",
      lines: [filledLine({ itemCode: " LD-01 " })],
    });
    expect(payload.lines[0]).toMatchObject({
      itemCode: "LD-01",
      qtyOrdered: 2,
      unitPrice: 150000,
    });
    expect(payload.supplierId).toBe("s1");
  });

  it("payload sửa đầu đơn gửi null cho ô bị xóa trắng", () => {
    const payload = toOrderHeaderPayload({
      ...emptyOrderForm("2026-11-05"),
      supplierId: null,
      supplierInvoiceNo: "  ",
    });
    expect(payload.supplierId).toBeNull();
    expect(payload.supplierInvoiceNo).toBeNull();
  });
});

describe("form đề nghị mua (PR)", () => {
  it("bắt buộc chi nhánh và ngày đề nghị", () => {
    const errors = validateRequestForm({
      ...emptyRequestForm("2026-11-05"),
      branchId: "",
    });
    expect(errors.branchId).toBe(true);
    expect(hasRequestFormErrors(errors)).toBe(true);
  });

  it("payload PR dùng qtyRequested và estUnitPrice", () => {
    const payload = toRequestCreatePayload({
      ...emptyRequestForm("2026-11-05"),
      branchId: "b1",
      lines: [filledLine({ lineType: "SERVICE" })],
    });
    expect(payload.lines[0]).toMatchObject({
      lineType: "SERVICE",
      qtyRequested: 2,
      estUnitPrice: 150000,
    });
  });

  it("payload sửa đầu đề không có chi nhánh và gửi null cho ô trống", () => {
    const payload = toRequestHeaderPayload({
      ...emptyRequestForm("2026-11-05"),
      title: "  ",
      neededDate: "",
    });
    expect(payload).not.toHaveProperty("branchId");
    expect(payload.title).toBeNull();
    expect(payload.neededDate).toBeNull();
  });
});
