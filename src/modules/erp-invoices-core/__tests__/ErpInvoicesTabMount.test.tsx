import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErpInvoicesTab } from "../components/ErpInvoicesTab/ErpInvoicesTab";

// Mocks for child sections
vi.mock("../components/ErpInvoicesTab/components/InvoiceHeaderSection", () => ({
  InvoiceHeaderSection: ({ direction, activeTab }: any) => (
    <div data-testid={`view-header-${direction.toLowerCase()}`}>
      Header {direction} - {activeTab}
    </div>
  ),
}));

vi.mock("../components/ErpInvoiceItemsSection", () => ({
  ErpInvoiceItemsSection: ({ direction, activeTab }: any) => (
    <div data-testid={`view-items-${direction.toLowerCase()}`}>
      Items {direction} - {activeTab}
    </div>
  ),
}));

vi.mock("../components/ErpInvoicesTab/components/InvoiceDrawers", () => ({
  InvoiceDrawers: () => <div data-testid="invoice-drawers" />,
}));

vi.mock("../components/ErpInvoicesTab/components/InvoiceBulkModals", () => ({
  InvoiceBulkModals: () => <div data-testid="invoice-bulk-modals" />,
}));

vi.mock(
  "../components/ErpInvoicesTab/components/InvoiceViewConfigDrawer",
  () => ({
    InvoiceViewConfigDrawer: () => (
      <div data-testid="invoice-view-config-drawer" />
    ),
  }),
);

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("@/modules/tags/api/tagsApi", () => ({
  getTags: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchOptionsApi: vi.fn().mockResolvedValue([]),
}));

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    list: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
    }),
    getItems: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      pageSize: 50,
      summary: {},
    }),
    getItemColumnOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ErpInvoicesTab Synchronous Keep-Alive Mounting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/erp-invoices");
  });

  it("mounts initial tab 'in' immediately on first render", () => {
    render(<ErpInvoicesTab />, { wrapper: createWrapper() });

    expect(screen.getByTestId("view-header-in")).toBeDefined();
    expect(screen.queryByTestId("view-header-out")).toBeNull();
    expect(screen.queryByTestId("view-items-in")).toBeNull();
    expect(screen.queryByTestId("view-items-out")).toBeNull();
  });

  it("synchronously mounts view-header-out when popstate/URL or tab changes to 'out'", () => {
    window.history.replaceState(null, "", "/erp-invoices?tab=out");
    render(<ErpInvoicesTab />, { wrapper: createWrapper() });

    expect(screen.getByTestId("view-header-out")).toBeDefined();
    expect(screen.queryByTestId("view-header-in")).toBeNull();
  });

  it("synchronously mounts lines view when tab is 'in-lines' or 'out-lines'", () => {
    window.history.replaceState(null, "", "/erp-invoices?tab=in-lines");
    const { unmount } = render(<ErpInvoicesTab />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId("view-items-in")).toBeDefined();
    unmount();

    window.history.replaceState(null, "", "/erp-invoices?tab=out-lines");
    render(<ErpInvoicesTab />, { wrapper: createWrapper() });

    expect(screen.getByTestId("view-items-out")).toBeDefined();
  });
});
