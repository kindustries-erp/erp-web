import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  renderPaymentMethodCell,
  renderPaymentStatusCell,
} from "./GarageCashflowTable.paymentCells";
import {
  getPaymentMethodOptions,
  getPaymentStatusOptions,
} from "./GarageCashflowTable.options";

import { GARAGE_PAYMENT_METHODS } from "../../../utils/garageCashflowCatalog";

const tr = (_key: string, def?: string) => def || "";

const row = (voucherType: string, paymentStatus: string | null) =>
  ({ voucherType, paymentStatus }) as any;

describe("renderPaymentStatusCell", () => {
  it("shows Dự thu for expected receipt", () => {
    render(<>{renderPaymentStatusCell(row("RECEIPT", "EXPECTED"))}</>);
    expect(screen.getByText("Dự thu")).toBeTruthy();
  });

  it("shows Đã thu for collected receipt", () => {
    render(<>{renderPaymentStatusCell(row("RECEIPT", null))}</>);
    expect(screen.getByText("Đã thu")).toBeTruthy();
  });

  it("shows Dự chi for pending payment", () => {
    render(<>{renderPaymentStatusCell(row("PAYMENT", "PENDING"))}</>);
    expect(screen.getByText("Dự chi")).toBeTruthy();
  });

  it("shows Đã duyệt for approved payment", () => {
    render(<>{renderPaymentStatusCell(row("PAYMENT", "APPROVED"))}</>);
    expect(screen.getByText("Đã duyệt")).toBeTruthy();
  });

  it("shows Đã chi for paid payment", () => {
    render(<>{renderPaymentStatusCell(row("PAYMENT", "PAID"))}</>);
    expect(screen.getByText("Đã chi")).toBeTruthy();
  });

  it("uses different badge classes for received vs paid-out", () => {
    const { container: a } = render(
      <>{renderPaymentStatusCell(row("RECEIPT", null))}</>,
    );
    const { container: b } = render(
      <>{renderPaymentStatusCell(row("PAYMENT", "PAID"))}</>,
    );
    const cls = (c: HTMLElement) => c.querySelector("span")?.className ?? "";
    expect(cls(a as HTMLElement)).toContain("bg-emerald-600");
    expect(cls(b as HTMLElement)).toContain("bg-rose-600");
  });
});

describe("payment status filter options", () => {
  it("forecast tab offers Dự thu, Dự chi, Đã duyệt only", () => {
    expect(getPaymentStatusOptions(true, tr).map((o) => o.value)).toEqual([
      "EXPECTED",
      "PENDING",
      "APPROVED",
    ]);
  });

  it("voucher tab offers Đã thu and Đã chi, without Đã duyệt", () => {
    const options = getPaymentStatusOptions(false, tr);
    expect(options.map((o) => o.value)).toEqual([
      "RECEIPT_PAID",
      "PAYMENT_PAID",
    ]);
    expect(options.some((o) => o.label === "Đã duyệt")).toBe(false);
  });

  it("uses translated labels while keeping filter values unchanged", () => {
    const en = (key: string, def?: string) =>
      key.endsWith("status.receiptPaid") ? "Collected" : def || "";
    const options = getPaymentStatusOptions(false, en);
    expect(options.map((o) => o.label)).toEqual(["Collected", "Đã chi"]);
    expect(options.map((o) => o.value)).toEqual([
      "RECEIPT_PAID",
      "PAYMENT_PAID",
    ]);
  });
});

describe("phương thức Chuyển khoản khác", () => {
  it("bộ lọc khớp danh mục phương thức", () => {
    expect(getPaymentMethodOptions(tr).map((o) => o.value)).toEqual([
      ...GARAGE_PAYMENT_METHODS,
    ]);
  });

  it("hiện đúng nhãn đang lưu kèm màu riêng", () => {
    render(
      <>
        {renderPaymentMethodCell({
          paymentMethod: "Chuyển khoản khác",
        } as any)}
      </>,
    );
    expect(screen.getByText("Chuyển khoản khác").className).toContain(
      "bg-teal-500/10",
    );
  });
});
