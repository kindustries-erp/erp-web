// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ChartOfAccountsPage } from "../ChartOfAccountsPage";
import { accountingApi } from "@/modules/accounting/api/accountingApi";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, def?: string) => def || key,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ setCustomBreadcrumbs: vi.fn(), locale: "vi" }),
}));

vi.mock("@/modules/accounting/api/accountingApi", () => ({
  accountingApi: {
    getChartOfAccounts: vi.fn(),
    getColumnOptions: vi.fn(),
    getChartOfAccountById: vi.fn(),
    createChartOfAccount: vi.fn(),
    updateChartOfAccount: vi.fn(),
    deleteChartOfAccount: vi.fn(),
  },
}));

describe("ChartOfAccountsPage", () => {
  let queryClient: QueryClient;

  const mockAccountsData = {
    items: [
      {
        id: "acc-1",
        accountCode: "111",
        accountName: "Tiền mặt",
        accountType: "ASSET",
        parentId: null,
        parent: null,
        isActive: true,
      },
      {
        id: "acc-2",
        accountCode: "1111",
        accountName: "Tiền Việt Nam",
        accountType: "ASSET",
        parentId: "acc-1",
        parent: {
          id: "acc-1",
          accountCode: "111",
          accountName: "Tiền mặt",
        },
        isActive: true,
      },
      {
        id: "acc-3",
        accountCode: "331",
        accountName: "Phải trả người bán",
        accountType: "LIABILITY",
        parentId: null,
        parent: null,
        isActive: false,
      },
    ],
    total: 3,
    totalPages: 1,
    page: 1,
    pageSize: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (accountingApi.getChartOfAccounts as any).mockResolvedValue(
      mockAccountsData,
    );
    (accountingApi.getColumnOptions as any).mockResolvedValue({
      items: [
        { label: "111", value: "111" },
        { label: "1111", value: "1111" },
        { label: "331", value: "331" },
      ],
      total: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ChartOfAccountsPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );

  it("renders table columns and account data correctly", async () => {
    renderComponent();

    // Verify Title
    expect(await screen.findByText("Hệ thống tài khoản")).toBeInTheDocument();

    // Verify Column Headers
    expect(screen.getByText("Mã TK")).toBeInTheDocument();
    expect(screen.getByText("Tên tài khoản")).toBeInTheDocument();
    expect(screen.getByText("Loại tài khoản")).toBeInTheDocument();
    expect(screen.getByText("Tài khoản mẹ")).toBeInTheDocument();
    expect(screen.getByText("Trạng thái")).toBeInTheDocument();

    // Verify rows rendered
    await waitFor(() => {
      expect(screen.getAllByText("Tiền mặt").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Tiền Việt Nam/i)).toBeInTheDocument();
      expect(screen.getByText("Phải trả người bán")).toBeInTheDocument();
    });
  });

  it("opens AccountDrawer in create mode when clicking Add dropdown trigger", async () => {
    renderComponent();

    // Find and click the create trigger button with pointer events
    const createTrigger = await screen.findByRole("button", {
      name: /Thêm mới tài khoản/i,
    });
    fireEvent.pointerDown(createTrigger, { pointerType: "mouse", button: 0 });
    fireEvent.click(createTrigger);

    const createItem = await screen.findByRole("menuitem", {
      name: /Thêm mới tài khoản/i,
    });
    fireEvent.click(createItem);

    // Verify drawer appears in create mode
    await waitFor(() => {
      expect(
        screen.getByText("Thêm mới tài khoản kế toán"),
      ).toBeInTheDocument();
    });
  });

  it("opens AccountDrawer in view mode when clicking detail icon", async () => {
    renderComponent();

    // Wait for account row to render
    await waitFor(() => {
      expect(screen.getByText(/Tiền Việt Nam/i)).toBeInTheDocument();
    });

    // Click the detail icon for account 1111 (second row)
    const detailButtons = screen.getAllByRole("button", {
      name: /Xem chi tiết/i,
    });
    fireEvent.click(detailButtons[1]);

    // Verify drawer opened with account code in title
    await waitFor(() => {
      expect(screen.getByText("Chi tiết tài khoản: 1111")).toBeInTheDocument();
    });
  });

  it("opens column filter popover on header click showing search box and options", async () => {
    renderComponent();

    // Click on column header "Mã TK"
    const codeHeader = await screen.findByText("Mã TK");
    fireEvent.click(codeHeader);

    // Popover should render search input with placeholder
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tìm\.\.\./i)).toBeInTheDocument();
    });
  });
});
