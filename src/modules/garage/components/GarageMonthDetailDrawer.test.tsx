import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { GarageMonthDetailDrawer } from "./GarageMonthDetailDrawer";

// Từ 3bf2deea drawer tháng chỉ ủy quyền cho GarageDebtDetailDrawer (layout và tab test ở organism đó).
let debtDrawerProps: any = null;
vi.mock("./organisms/garage-debt-detail-drawer", () => ({
  GarageDebtDetailDrawer: (props: any) => {
    debtDrawerProps = props;
    return <div data-testid="garage-debt-detail-drawer" />;
  },
}));

const item = { month: "2026-10" } as any;

describe("GarageMonthDetailDrawer", () => {
  beforeEach(() => {
    debtDrawerProps = null;
  });

  it("ủy quyền cho GarageDebtDetailDrawer với scope tháng", () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <GarageMonthDetailDrawer
        open
        item={item}
        activeTab="PAYMENT"
        onClose={onClose}
      />,
    );
    expect(getByTestId("garage-debt-detail-drawer")).toBeInTheDocument();
    expect(debtDrawerProps).toMatchObject({
      open: true,
      onClose,
      activeTab: "PAYMENT",
      scope: { kind: "month", item },
    });
  });

  it("không render khi chưa chọn tháng", () => {
    const { container } = render(
      <GarageMonthDetailDrawer
        open
        item={null}
        activeTab="RECEIPT"
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(debtDrawerProps).toBeNull();
  });
});
