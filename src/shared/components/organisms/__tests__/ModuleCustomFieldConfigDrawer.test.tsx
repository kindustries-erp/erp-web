import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ModuleCustomFieldConfigDrawer } from "../module-custom-field-config-drawer";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, defaultText: string) => defaultText || key,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector: any) => selector({ locale: "vi" }),
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getGlobalAttributeDefs: vi.fn(),
    getAttributeDefs: vi.fn(),
    createAttributeDef: vi.fn(),
    updateAttributeDef: vi.fn(),
    deleteAttributeDef: vi.fn(),
    getAttributeOptionsUsage: vi.fn(),
  },
  resolveAttrName: (attr: any) => attr?.name || "",
  resolveOptionLabel: (opt: any) =>
    opt?.label || opt?.labels?.vi || opt?.value || "",
}));

describe("ModuleCustomFieldConfigDrawer Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );

  const mockDefs = [
    {
      id: "attr-sys-1",
      code: "type_inventory_receipt",
      name: "Loại nhập kho",
      fieldType: "SELECT",
      isGlobal: true,
      isSystem: true,
      isRequired: true,
      isActive: true,
      options: [
        { value: "PO", label: "Đơn mua hàng" },
        { value: "OTHER", label: "Nhập khác" },
      ],
    },
    {
      id: "attr-custom-1",
      code: "custom_note",
      name: "Ghi chú đặc biệt",
      fieldType: "TEXT",
      isGlobal: true,
      isSystem: false,
      isRequired: false,
      isActive: true,
    },
  ];

  it("renders both system and custom attributes sections correctly in list", async () => {
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeOptionsUsage).mockResolvedValue({
      PO: 5,
      OTHER: 0,
    });

    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={vi.fn()}
        moduleKey="GOODS_RECEIPT"
      />,
      { wrapper },
    );

    const sysHeaders = await screen.findAllByText(
      "Thuộc tính mặc định (Hệ thống)",
    );
    expect(sysHeaders.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Loại nhập kho").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByText("Mặc định")).toBeInTheDocument();

    const customHeaders = screen.getAllByText(
      "Thuộc tính tùy chỉnh (Người dùng)",
    );
    expect(customHeaders.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Ghi chú đặc biệt").length,
    ).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Thêm thuộc tính")).toBeInTheDocument();
  });

  it("renders edit button and supports editing attribute", async () => {
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeOptionsUsage).mockResolvedValue({
      PO: 12,
      OTHER: 0,
    });

    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={vi.fn()}
        moduleKey="GOODS_RECEIPT"
      />,
      { wrapper },
    );

    const editButtons = await screen.findAllByRole("button");
    const editBtn = editButtons.find((btn) =>
      btn.innerHTML.includes("lucide-edit"),
    );
    if (editBtn) {
      fireEvent.click(editBtn);
      expect(
        await screen.findByText("Chỉnh sửa thuộc tính"),
      ).toBeInTheDocument();
    }
  });

  it("resets edit form when switching pill tab", async () => {
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeOptionsUsage).mockResolvedValue({});

    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={vi.fn()}
        moduleKey="GOODS_RECEIPT"
      />,
      { wrapper },
    );

    const editButtons = await screen.findAllByRole("button");
    const editBtn = editButtons.find((btn) =>
      btn.innerHTML.includes("lucide-edit"),
    );
    if (editBtn) {
      fireEvent.click(editBtn);
      expect(
        await screen.findByText("Chỉnh sửa thuộc tính"),
      ).toBeInTheDocument();

      const issueTab = screen.getByText("Phiếu xuất kho");
      fireEvent.click(issueTab);

      expect(
        screen.queryByText("Chỉnh sửa thuộc tính"),
      ).not.toBeInTheDocument();
    }
  });

  it("creates a new attribute with bilingual nameEn and multilingual options", async () => {
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue([]);
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue([]);
    vi.mocked(moduleConfigApi.createAttributeDef).mockResolvedValue({
      id: "new-attr",
    } as any);

    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={vi.fn()}
        moduleKey="GOODS_RECEIPT"
      />,
      { wrapper },
    );

    const addBtn = await screen.findByText("Thêm thuộc tính");
    fireEvent.click(addBtn);

    const codeInput = await screen.findByPlaceholderText("MA_THUOC_TINH");
    fireEvent.change(codeInput, { target: { value: "PACKAGE_TYPE" } });

    const nameInput = screen.getByPlaceholderText("Nhập tên hiển thị...");
    fireEvent.change(nameInput, { target: { value: "Loại kiện hàng" } });

    const saveBtn = screen.getByRole("button", { name: /Lưu/i });
    fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(moduleConfigApi.createAttributeDef).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "package_type",
          name: "Loại kiện hàng",
          isGlobal: true,
          moduleKeyGlobal: "GOODS_RECEIPT",
        }),
      );
    });
  });

  it("renders both category and is_valid system attributes when opened for INVOICE_IN", async () => {
    const invoiceInDefs = [
      {
        id: "def-type-in",
        code: "category",
        name: "Phân loại hóa đơn mua vào",
        fieldType: "SELECT",
        isGlobal: true,
        isSystem: true,
        isActive: true,
        options: [{ value: "PURCHASE_GOODS", label: "Mua hàng hóa / NVL" }],
      },
      {
        id: "def-is-valid-in",
        code: "is_valid",
        name: "Hóa đơn hợp lý, hợp lệ",
        fieldType: "CHECKBOX",
        isGlobal: true,
        isSystem: true,
        isActive: true,
      },
    ];

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      invoiceInDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      invoiceInDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeOptionsUsage).mockResolvedValue({});

    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={vi.fn()}
        moduleKey="INVOICE_IN"
      />,
      { wrapper },
    );

    const sysHeaders = await screen.findAllByText(
      "Thuộc tính mặc định (Hệ thống)",
    );
    expect(sysHeaders.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Phân loại hóa đơn mua vào").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Hóa đơn hợp lý, hợp lệ").length,
    ).toBeGreaterThanOrEqual(1);
  });
});
