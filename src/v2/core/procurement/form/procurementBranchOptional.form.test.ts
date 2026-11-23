import { describe, expect, it } from "vitest";
import {
  emptyRequestForm,
  toRequestCreatePayload,
  toRequestHeaderPayload,
  validateRequestForm,
} from "./procurementRequest.form";
import {
  emptyOrderForm,
  toOrderCreatePayload,
  toOrderHeaderPayload,
  validateOrderForm,
} from "./procurementOrder.form";

const TODAY = "2026-11-06";

describe("chi nhánh tùy chọn (Garage) - đề nghị mua", () => {
  it("không báo lỗi thiếu chi nhánh khi tùy chọn", () => {
    const form = emptyRequestForm(TODAY);
    expect(validateRequestForm(form, true).branchId).toBeUndefined();
  });

  it("vẫn báo lỗi thiếu chi nhánh ở luồng thường (mặc định)", () => {
    const form = emptyRequestForm(TODAY);
    expect(validateRequestForm(form).branchId).toBe(true);
  });

  it("payload tạo gửi undefined khi chưa chọn chi nhánh", () => {
    const form = emptyRequestForm(TODAY);
    expect(toRequestCreatePayload(form).branchId).toBeUndefined();
  });

  it("payload sửa đầu phiếu chỉ gửi chi nhánh khi tùy chọn, rỗng thành null", () => {
    const form = { ...emptyRequestForm(TODAY), branchId: "" };
    expect(toRequestHeaderPayload(form, true)).toHaveProperty("branchId", null);
    expect(toRequestHeaderPayload(form)).not.toHaveProperty("branchId");
  });
});

describe("chi nhánh tùy chọn (Garage) - đơn mua", () => {
  it("không báo lỗi thiếu chi nhánh khi tùy chọn", () => {
    const form = emptyOrderForm(TODAY);
    expect(validateOrderForm(form, true).branchId).toBeUndefined();
  });

  it("vẫn báo lỗi thiếu chi nhánh ở luồng thường (mặc định)", () => {
    const form = emptyOrderForm(TODAY);
    expect(validateOrderForm(form).branchId).toBe(true);
  });

  it("payload tạo gửi undefined khi chưa chọn chi nhánh", () => {
    const form = emptyOrderForm(TODAY);
    expect(toOrderCreatePayload(form).branchId).toBeUndefined();
  });

  it("payload sửa đầu đơn chỉ gửi chi nhánh khi tùy chọn, rỗng thành null", () => {
    const form = { ...emptyOrderForm(TODAY), branchId: "", branchName: "" };
    expect(toOrderHeaderPayload(form, true)).toHaveProperty("branchId", null);
    expect(toOrderHeaderPayload(form)).not.toHaveProperty("branchId");
  });
});
