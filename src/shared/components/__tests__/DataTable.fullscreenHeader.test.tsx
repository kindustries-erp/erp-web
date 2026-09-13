// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  FullscreenModal,
  FullscreenPlaceholder,
} from "../DataTable/components/FullscreenModal";
import type { Table as TanstackTable } from "@tanstack/react-table";

// Mock i18n
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, defaultVal?: string) => defaultVal || key,
}));

describe("FullscreenModal & FullscreenPlaceholder - Header enhancements", () => {
  const mockTable = {
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getState: () => ({
      columnVisibility: {},
      columnOrder: [],
      rowSelection: {},
      columnSizing: {},
    }),
    getAllLeafColumns: () => [],
    getTotalSize: () => 1000,
  } as unknown as TanstackTable<unknown>;

  it("renders page icon, title, description in FullscreenModal using PageHeader styling", () => {
    render(
      <FullscreenModal
        table={mockTable}
        tableTitle="Theo dõi hàng hoá"
        tableDesc="Quản lý định danh và truy xuất nguồn gốc xe"
        tableIcon={<span data-testid="custom-barcode-icon">BarcodeIcon</span>}
        fullscreenTabs={<div data-testid="mock-tabs">Tabs bar content</div>}
        onExit={vi.fn()}
      >
        <div>Table Content</div>
      </FullscreenModal>,
    );

    // Title and description must be rendered
    expect(screen.getByText("Theo dõi hàng hoá")).toBeInTheDocument();
    expect(
      screen.getByText("Quản lý định danh và truy xuất nguồn gốc xe"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("custom-barcode-icon")).toBeInTheDocument();
    expect(screen.getByTestId("mock-tabs")).toBeInTheDocument();

    // Verify there is no border-b divider on top of the tabs
    const headerDivider = document.body.querySelector(
      ".border-b.border-border\\/80",
    );
    expect(headerDivider).toBeNull();
  });

  it("renders icon, title, and description in FullscreenPlaceholder", () => {
    render(
      <FullscreenPlaceholder
        tableTitle="Theo dõi hàng hoá"
        tableDesc="Quản lý định danh và truy xuất nguồn gốc xe"
        tableIcon={
          <span data-testid="placeholder-barcode-icon">BarcodeIcon</span>
        }
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText("Theo dõi hàng hoá")).toBeInTheDocument();
    expect(
      screen.getByText("Quản lý định danh và truy xuất nguồn gốc xe"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("placeholder-barcode-icon")).toBeInTheDocument();
  });

  it("applies fullscreen-modal-enter when isExiting is false and fullscreen-modal-exit when isExiting is true", () => {
    const { rerender } = render(
      <FullscreenModal
        table={mockTable}
        tableTitle="Theo dõi hàng hoá"
        isExiting={false}
        onExit={vi.fn()}
      >
        <div>Table Content</div>
      </FullscreenModal>,
    );

    const modalEnter = document.body.querySelector(".fullscreen-modal-enter");
    expect(modalEnter).not.toBeNull();

    rerender(
      <FullscreenModal
        table={mockTable}
        tableTitle="Theo dõi hàng hoá"
        isExiting={true}
        onExit={vi.fn()}
      >
        <div>Table Content</div>
      </FullscreenModal>,
    );

    const modalExit = document.body.querySelector(".fullscreen-modal-exit");
    expect(modalExit).not.toBeNull();
  });
});
