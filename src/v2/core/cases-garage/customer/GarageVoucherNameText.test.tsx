import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageVoucherNameText } from "./GarageVoucherNameText";

describe("GarageVoucherNameText", () => {
  it("hiện dòng phụ khi tên trên phiếu khác tên danh mục", () => {
    render(<GarageVoucherNameText customerName="ACTR" voucherName="SAILUN" />);
    expect(screen.getByTestId("garage-voucher-name")).toHaveTextContent(
      "SAILUN",
    );
  });

  it("không render gì khi hai tên trùng nhau", () => {
    const { container } = render(
      <GarageVoucherNameText customerName="ACTR" voucherName="ACTR" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
