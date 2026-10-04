import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AppContextMenu, triggerContextMenu } from "../ContextMenu";
import { useAppStore } from "@/core/config/appStore";

describe("AppContextMenu Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Cấu hình kho' for inventory pages and opens custom fields drawer on click", () => {
    const openCustomFieldsSpy = vi.fn();
    useAppStore.setState({
      openCustomFieldsDrawer: openCustomFieldsSpy,
      openTabs: [
        {
          instanceId: "erp-inventory-vouchers",
          pageKey: "erp-inventory-vouchers",
          instanceIndex: 1,
        },
      ],
    });

    render(<AppContextMenu />);

    // Trigger context menu on erp-inventory-vouchers
    act(() => {
      triggerContextMenu(
        100,
        100,
        "erp-inventory-vouchers",
        "Chứng từ kho",
        undefined,
        "tabbar",
      );
    });

    const configBtn = screen.getByText("Cấu hình kho");
    expect(configBtn).toBeInTheDocument();

    fireEvent.click(configBtn);
    expect(openCustomFieldsSpy).toHaveBeenCalledWith("ALL", "GOODS_RECEIPT");
  });

  it("renders 'Cấu hình kho (Mặt hàng)' for mfg-items page", () => {
    const openCustomFieldsSpy = vi.fn();
    useAppStore.setState({
      openCustomFieldsDrawer: openCustomFieldsSpy,
      openTabs: [
        {
          instanceId: "mfg-items",
          pageKey: "mfg-items",
          instanceIndex: 1,
        },
      ],
    });

    render(<AppContextMenu />);

    act(() => {
      triggerContextMenu(
        100,
        100,
        "mfg-items",
        "Mặt hàng",
        undefined,
        "tabbar",
      );
    });

    const configBtn = screen.getByText("Cấu hình kho (Mặt hàng)");
    expect(configBtn).toBeInTheDocument();

    fireEvent.click(configBtn);
    expect(openCustomFieldsSpy).toHaveBeenCalledWith("ALL", "INVENTORY_ITEM");
  });

  it("positions context menu with 'bottom' style when triggered from tabbar", () => {
    useAppStore.setState({
      openTabs: [
        {
          instanceId: "erp-invoices",
          pageKey: "erp-invoices",
          instanceIndex: 1,
        },
      ],
    });

    render(<AppContextMenu />);

    act(() => {
      triggerContextMenu(
        150,
        900,
        "erp-invoices",
        "Hóa đơn",
        undefined,
        "tabbar",
      );
    });

    const menuEl = document.querySelector(".context-menu") as HTMLElement;
    expect(menuEl).toBeInTheDocument();
    expect(menuEl.style.bottom).toBeTruthy();
    expect(menuEl.style.top).toBeFalsy();
    expect(menuEl.style.left).toBe("150px");
  });

  it("positions context menu with 'top' style when triggered from sidebar", () => {
    useAppStore.setState({
      openTabs: [
        {
          instanceId: "erp-invoices",
          pageKey: "erp-invoices",
          instanceIndex: 1,
        },
      ],
    });

    render(<AppContextMenu />);

    act(() => {
      triggerContextMenu(
        200,
        300,
        "erp-invoices",
        "Hóa đơn",
        undefined,
        "sidebar",
      );
    });

    const menuEl = document.querySelector(".context-menu") as HTMLElement;
    expect(menuEl).toBeInTheDocument();
    expect(menuEl.style.top).toBeTruthy();
    expect(menuEl.style.bottom).toBeFalsy();
    expect(menuEl.style.left).toBe("200px");
  });
});
