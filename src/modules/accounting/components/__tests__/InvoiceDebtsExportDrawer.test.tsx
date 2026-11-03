import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const v2DrawerSpy = vi.fn();

vi.mock("@/v2/modules/invoice-debts", () => ({
  InvoiceDebtsExportDrawer: (props: any) => {
    v2DrawerSpy(props);
    return <div data-testid="v2-invoice-debts-export-drawer" />;
  },
}));

import { InvoiceDebtsExportDrawer } from "../InvoiceDebtsExportDrawer";

describe("InvoiceDebtsExportDrawer (V1 Adapter)", () => {
  beforeEach(() => {
    v2DrawerSpy.mockClear();
  });

  it("renders V2 drawer and forwards all props correctly", () => {
    const handleClose = vi.fn();
    const buildBaseQuery = () => ({ search: "abc" });

    render(
      <InvoiceDebtsExportDrawer
        open={true}
        onClose={handleClose}
        initialPartnerType="CUSTOMER"
        buildBaseQuery={buildBaseQuery}
      />,
    );

    expect(screen.getByTestId("v2-invoice-debts-export-drawer")).toBeDefined();
    expect(v2DrawerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        onClose: handleClose,
        initialPartnerType: "CUSTOMER",
        buildBaseQuery,
      }),
    );
  });
});
