import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormLineDetailPanel } from "@/modules/operational/components/form/FormLineDetailPanel";
import { useOperationalFormStore } from "@/modules/operational/hooks/useOperationalFormStore";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock(
  "@/modules/inventory-core/components/InventoryItemPickerDrawer",
  () => ({
    InventoryItemPickerDrawer: () => null,
  }),
);

describe("FormLineDetailPanel", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // Set up mock items in useOperationalFormStore
    useOperationalFormStore.setState({
      lines: [
        {
          tempId: "line-1",
          item_code: "SKU-001",
          item_name: "Linh kiện Động cơ 1500W",
          qty: "10",
          unit_price: "2500000",
          amount: "25000000",
          description: "Giao đợt 1",
          line_type: "PART",
          inventory_item_id: "inv-1",
          notes: "",
        },
        {
          tempId: "line-2",
          item_code: "SKU-002",
          item_name: "Bộ Điều Tốc ECU",
          qty: "5",
          unit_price: "1200000",
          amount: "6000000",
          description: "Giao đợt 2",
          line_type: "PART",
          inventory_item_id: "inv-2",
          notes: "",
        },
      ],
    });
  });

  it("renders FormLineDetailPanel with DrawerSection and DataTable", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FormLineDetailPanel
          variant="purchase"
          isPurchaseLocked={false}
          purchaseFieldLocked={() => false}
          viewOnly={false}
        />
      </QueryClientProvider>,
    );

    // Section title
    expect(screen.getByText(/Chi tiết/i)).toBeDefined();

    // Line items
    expect(screen.getByText("SKU-001")).toBeDefined();
    expect(screen.getByText("SKU-002")).toBeDefined();

    // Subtotal values rendered
    expect(screen.getAllByText("15").length).toBeGreaterThan(0);
  });

  it("renders correctly in viewOnly mode", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FormLineDetailPanel
          variant="purchase"
          isPurchaseLocked={false}
          purchaseFieldLocked={() => false}
          viewOnly={true}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Linh kiện Động cơ 1500W")).toBeDefined();
    expect(screen.getByText("Bộ Điều Tốc ECU")).toBeDefined();
  });
});
