// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomFieldsPage } from "../CustomFieldsPage";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock dependencies
vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getGlobalAttributeDefs: vi.fn(),
    getAttributeDefs: vi.fn().mockResolvedValue([]),
    getCategories: vi.fn(),
    createAttributeDef: vi.fn(),
    updateAttributeDef: vi.fn(),
    deleteAttributeDef: vi.fn(),
  },
  resolveAttrName: (def: any) => def?.name || def?.code,
  resolveOptionLabel: (opt: any) => opt?.label || opt?.value,
  resolveCategoryName: (cat: any) => cat?.name || cat?.code,
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({
    setCustomBreadcrumbs: vi.fn(),
    locale: "vi",
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

describe("CustomFieldsPage", () => {
  let queryClient: QueryClient;

  const mockGlobalDefs = [
    {
      id: "def-1",
      code: "contract_no",
      name: "Số hợp đồng",
      nameEn: "Contract Number",
      fieldType: "TEXT",
      isRequired: true,
      isSystem: true,
      isActive: true,
      usageCount: 15,
    },
    {
      id: "def-2",
      code: "priority_level",
      name: "Mức độ ưu tiên",
      nameEn: "Priority Level",
      fieldType: "SELECT",
      options: [
        { label: "Cao", value: "HIGH" },
        { label: "Thấp", value: "LOW" },
      ],
      isRequired: false,
      isSystem: false,
      isActive: true,
      usageCount: 5,
    },
  ];

  const mockCategories = [
    {
      id: "cat-1",
      code: "EXPENSE_OPS",
      name: "Chi phí vận hành",
      nameEn: "Operating Expenses",
      attributeDefs: [
        {
          id: "def-3",
          code: "branch_code",
          name: "Mã chi nhánh",
          nameEn: "Branch Code",
          fieldType: "TEXT",
          isRequired: false,
          isSystem: false,
          isActive: true,
          usageCount: 8,
        },
      ],
    },
  ];

  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/");
    }

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockImplementation(
      (modKey) => {
        if (modKey === "INVOICE_IN")
          return Promise.resolve(mockGlobalDefs as any);
        return Promise.resolve([]);
      },
    );

    vi.mocked(moduleConfigApi.getCategories).mockImplementation((modKey) => {
      if (modKey === "GARAGE_CASE")
        return Promise.resolve(mockCategories as any);
      return Promise.resolve([]);
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CustomFieldsPage />
      </QueryClientProvider>,
    );

  it("renders page header and domain tabs correctly, and hides toolbar pill tabs on ALL tab", async () => {
    renderComponent();

    // Verify title and description
    expect(screen.getByText("Trường tùy chỉnh")).toBeDefined();
    expect(
      screen.getByText(/Quản lý danh mục & các thuộc tính động/i),
    ).toBeDefined();

    // Verify domain tabs
    expect(screen.getByText("Tất cả")).toBeDefined();
    expect(screen.getByText("Kế toán & Tài chính")).toBeDefined();
    expect(screen.getByText("Kho vận & Tồn kho")).toBeDefined();
    expect(screen.getByText("Sản xuất & Kỹ thuật")).toBeDefined();
    expect(screen.getByText("Mua hàng & Bán hàng")).toBeDefined();
    expect(screen.getByText("Garage & Dịch vụ")).toBeDefined();

    // On "ALL" domain tab, the toolbar sub-module PillTabs should NOT be rendered
    expect(screen.queryByText("Tất cả phân hệ")).toBeNull();
  });

  it("loads and displays custom fields with Domain, Module, Origin, and Required columns", async () => {
    renderComponent();

    // Wait for data to load
    const fieldCode = await screen.findByText(
      "contract_no",
      {},
      { timeout: 4000 },
    );
    expect(fieldCode).toBeDefined();
    expect(
      await screen.findByText("Số hợp đồng", {}, { timeout: 4000 }),
    ).toBeDefined();
    expect(
      await screen.findByText("priority_level", {}, { timeout: 4000 }),
    ).toBeDefined();
    expect(
      await screen.findByText("branch_code", {}, { timeout: 4000 }),
    ).toBeDefined();

    // Check data types & badges
    expect(screen.getAllByText("Văn bản").length).toBeGreaterThan(0);
    expect(screen.getByText("Lựa chọn")).toBeDefined();
    expect(screen.getAllByText("Toàn phân hệ").length).toBeGreaterThan(0);
    expect(screen.getByText("Chi phí vận hành")).toBeDefined();

    // Check Origin (isSystem) badges
    expect(screen.getByText("Hệ thống")).toBeDefined();
    expect(screen.getAllByText("Tùy chỉnh").length).toBeGreaterThan(0);

    // Check Required badge
    expect(screen.getByText("Bắt buộc *")).toBeDefined();
    expect(screen.getAllByText("Tùy chọn").length).toBeGreaterThan(0);
  });

  it("opens ModuleCustomFieldConfigDrawer when clicking 'Tạo trường tùy chỉnh' button", async () => {
    renderComponent();

    const createButton = await screen.findByRole(
      "button",
      { name: /Tạo trường tùy chỉnh/i },
      { timeout: 4000 },
    );
    fireEvent.click(createButton);

    // Module Custom Field Config Drawer should be open
    expect(
      await screen.findByText(
        /Cấu hình trường tùy chỉnh/i,
        {},
        { timeout: 4000 },
      ),
    ).toBeDefined();
  });

  it("shows sub-module PillTabs only when a specific domain tab is clicked", async () => {
    renderComponent();

    await screen.findByText("contract_no", {}, { timeout: 4000 });

    // Initially on ALL: no toolbar pill tabs
    expect(screen.queryByText("Tất cả phân hệ")).toBeNull();

    // Click on Garage domain tab
    const garageTab = screen.getByRole("tab", { name: /Garage & Dịch vụ/i });
    fireEvent.pointerDown(garageTab, { button: 0, ctrlKey: false });
    fireEvent.keyDown(garageTab, { key: " ", code: "Space" });
    fireEvent.click(garageTab);

    // After switching domain, PillTabs update to show Garage modules
    await waitFor(
      () => {
        expect(screen.getByText("Tất cả phân hệ")).toBeDefined();
        expect(
          screen.getByRole("tab", { name: /Vụ việc Garage/i }),
        ).toBeDefined();
        expect(
          screen.getByRole("tab", { name: /Bảo hành & Bàn giao/i }),
        ).toBeDefined();
      },
      { timeout: 4000 },
    );
  });
});
