import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BankTransactionCashflowSection } from "./BankTransactionCashflowSection";
import {
  buildPurposeOptions,
  isPurposeAllowed,
} from "../constants/cashflowAttributes";

const t = (_key: string, opts: { defaultValue: string }) => opts.defaultValue;

describe("BankTransactionCashflowSection", () => {
  it("shows Vietnamese labels for saved values in view mode", () => {
    render(
      <BankTransactionCashflowSection
        classification="OPERATING"
        purpose="CUSTOMER_PAYMENT"
        editMode={false}
      />,
    );
    expect(screen.getByText("Hoạt động kinh doanh")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng thanh toán")).toBeInTheDocument();
  });

  it("shows dash for empty legacy rows in view mode", () => {
    render(
      <BankTransactionCashflowSection
        classification={null}
        purpose={null}
        editMode={false}
      />,
    );
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("renders comboboxes in edit mode", () => {
    render(
      <BankTransactionCashflowSection
        classification={null}
        purpose={null}
        editMode
      />,
    );
    expect(screen.getByText("-- Chọn phân loại --")).toBeInTheDocument();
    expect(screen.getByText("-- Chọn phân loại trước --")).toBeInTheDocument();
  });

  it("locks purpose until a classification is chosen", () => {
    render(
      <BankTransactionCashflowSection
        classification={null}
        purpose={null}
        editMode
      />,
    );
    const purposeTrigger = screen.getByText("-- Chọn phân loại trước --");
    const button = purposeTrigger.closest("button");
    expect(button).not.toBeNull();
    expect(button).toBeDisabled();
  });

  it("offers only purposes of the chosen classification", () => {
    const options = buildPurposeOptions(t, "FINANCING");
    expect(options.map((o) => o.value)).toEqual(["LOAN", "CAPITAL", "OTHER"]);
    expect(buildPurposeOptions(t, null)).toEqual([]);
  });

  it("treats purpose outside the classification group as invalid", () => {
    expect(isPurposeAllowed("OPERATING", "LOAN")).toBe(false);
    expect(isPurposeAllowed("FINANCING", "LOAN")).toBe(true);
  });
});
