import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { resetDrawerStack } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { ErpInvoiceDetailDrawer } from "./ErpInvoiceDetailDrawer";

vi.mock("./ErpInvoiceDetailDrawer.hook", () => ({
  useErpInvoiceDetailDrawer: () => ({
    showNetOffModal: false,
    setShowNetOffModal: vi.fn(),
    showPoModal: false,
    setShowPoModal: vi.fn(),
    showSoModal: false,
    setShowSoModal: vi.fn(),
    showGarageCaseModal: false,
    setShowGarageCaseModal: vi.fn(),
    partnerDefaultSubTab: "invoices",
    handleFetchGraph: vi.fn(),
    traceabilityCount: 0,
    handleSelectBankNetOff: vi.fn(),
    handleSelectPo: vi.fn(),
    handleSelectSo: vi.fn(),
    handleSelectGarageCase: vi.fn(),
    editActions: [],
    actionGroups: undefined,
    footerLeft: undefined,
  }),
}));

vi.mock("../erp-invoice-settlement-tab", () => ({
  ErpInvoiceSettlementProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

vi.mock("./ErpInvoiceDrawerTabs", () => ({
  useInvoiceDrawerTabs: () => [
    {
      key: "details",
      label: "Chi tiết",
      content: <div>Nội dung chi tiết</div>,
      rightPanel: <div>Panel chi tiết</div>,
    },
    {
      key: "history",
      label: "Lịch sử",
      content: <div>Nội dung lịch sử</div>,
      rightPanel: <div>Panel lịch sử</div>,
    },
  ],
}));

describe("ErpInvoiceDetailDrawer V2 adapter", () => {
  beforeEach(() => {
    resetDrawerStack();
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1440,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });

  it("maps invoice tabs and their right panels to V2 drawer tabs", () => {
    render(
      <ErpInvoiceDetailDrawer
        open
        onClose={vi.fn()}
        editMode={false}
        detailInvoice={null}
        startEdit={vi.fn()}
        saving={false}
        handleSave={vi.fn()}
        cancelEdit={vi.fn()}
        children={<div>Invoice body</div>}
        defaultTabKey="details"
      />,
    );

    expect(screen.getByText("Nội dung chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Panel chi tiết")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Lịch sử" }));

    expect(screen.getByText("Nội dung lịch sử")).toBeInTheDocument();
    expect(screen.getByText("Panel lịch sử")).toBeInTheDocument();
    expect(screen.queryByText("Panel chi tiết")).not.toBeInTheDocument();
  });
});
