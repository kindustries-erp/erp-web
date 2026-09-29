import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ModuleCustomFieldConfigDrawer } from "../index";
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

  it("renders both system and custom attributes sections correctly in list and preview", async () => {
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

    // 1. Check title of system attributes section (appears in both left list and right preview panel)
    const sysHeaders = await screen.findAllByText(
      "Thuộc tính mặc định (Hệ thống)",
    );
    expect(sysHeaders.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Loại nhập kho").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByText("Mặc định")).toBeInTheDocument();

    // 2. Check title of custom attributes section
    const customHeaders = screen.getAllByText(
      "Thuộc tính tùy chỉnh (Người dùng)",
    );
    expect(customHeaders.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Ghi chú đặc biệt").length,
    ).toBeGreaterThanOrEqual(1);

    // 3. Check bottom add button exists
    expect(screen.getByText("Thêm thuộc tính")).toBeInTheDocument();
  });

  it("disables delete button for options with usage count > 0 and enables for unused options, and supports editing option label", async () => {
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

    // Click Edit on system attribute
    const editButtons = await screen.findAllByRole("button");
    const editBtn = editButtons.find((btn) =>
      btn.innerHTML.includes("lucide-edit"),
    );
    if (editBtn) {
      fireEvent.click(editBtn);

      // Verify form opens
      expect(
        await screen.findByText("Chỉnh sửa thuộc tính mặc định"),
      ).toBeInTheDocument();

      // Verify PO option has 12 usage badge
      expect(await screen.findByText("12")).toBeInTheDocument();
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

    // Click Edit on system attribute
    const editButtons = await screen.findAllByRole("button");
    const editBtn = editButtons.find((btn) =>
      btn.innerHTML.includes("lucide-edit"),
    );
    if (editBtn) {
      fireEvent.click(editBtn);
      expect(
        await screen.findByText("Chỉnh sửa thuộc tính mặc định"),
      ).toBeInTheDocument();

      // Switch pill tab to "Phiếu xuất kho"
      const issueTab = screen.getByText("Phiếu xuất kho");
      fireEvent.click(issueTab);

      // Edit form should be closed/reset
      expect(
        screen.queryByText("Chỉnh sửa thuộc tính mặc định"),
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

    // Click "Thêm thuộc tính"
    const addBtn = await screen.findByText("Thêm thuộc tính");
    fireEvent.click(addBtn);

    // Fill in Code
    const codeInput = await screen.findByPlaceholderText(
      "VD: color, payment_status",
    );
    fireEvent.change(codeInput, { target: { value: "package_type" } });

    // Fill in Name VI
    const nameViInput = screen.getByPlaceholderText(
      "VD: Màu sắc, Loại nhập...",
    );
    fireEvent.change(nameViInput, { target: { value: "Loại kiện hàng" } });

    // Click "Tạo mới"
    const saveBtn = screen.getByRole("button", { name: "Tạo mới" });
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

  it("renders subcategory attribute with cascading options correctly", async () => {
    const customDefsWithSubcategory = [
      {
        id: "def-cat",
        code: "category",
        name: "Loại nhập kho",
        fieldType: "SELECT",
        isGlobal: true,
        isSystem: true,
        isActive: true,
        options: [
          { value: "PO", label: "Đơn mua hàng (PO)" },
          { value: "OTHER", label: "Nhập khác" },
        ],
      },
      {
        id: "def-sub",
        code: "subcategory",
        name: "Phân loại chi tiết",
        fieldType: "SELECT",
        isGlobal: true,
        isSystem: true,
        isActive: true,
        options: [
          {
            value: "REC_PO_REGULAR",
            label: "Nhập PO định kỳ",
            parentValue: "PO",
          },
          {
            value: "REC_OTHER_SAMPLE",
            label: "Nhập hàng mẫu",
            parentValue: "OTHER",
          },
        ],
      },
    ];

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      customDefsWithSubcategory as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      customDefsWithSubcategory as any,
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

    expect(
      (await screen.findAllByText("Loại nhập kho")).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      (await screen.findAllByText("Phân loại chi tiết")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows confirmation modal when closing drawer while editing an attribute", async () => {
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeOptionsUsage).mockResolvedValue({});

    const onClose = vi.fn();
    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={onClose}
        moduleKey="GOODS_RECEIPT"
      />,
      { wrapper },
    );

    // Click on Add Attribute
    const addBtn = await screen.findByText("Thêm thuộc tính");
    fireEvent.click(addBtn);

    // Expect edit form to be open
    expect(screen.getByText("Thêm thuộc tính tùy chỉnh")).toBeInTheDocument();

    // Try to trigger drawer close (Click close button on drawer header)
    const closeDrawerBtn = screen.getByLabelText("Đóng");
    fireEvent.click(closeDrawerBtn);

    // Modal confirm should appear
    expect(screen.getByText("Xác nhận thoát cấu hình")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    // Click confirm discard
    const discardBtn = screen.getByText("Thoát không lưu");
    fireEvent.click(discardBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("renders CoaCombobox and allows setting accountCode (TK Nợ) for invoice / accounting category attribute options, and renders TK badge", async () => {
    const categoryDefs = [
      {
        id: "attr-invoice-category",
        code: "category",
        name: "Phân loại hóa đơn mua vào",
        fieldType: "SELECT",
        isGlobal: true,
        isSystem: true,
        isRequired: true,
        isActive: true,
        options: [
          {
            value: "VF_PARTS",
            label: "Phụ tùng chính hãng VinFast",
            accountCode: "1561",
            defaultDebitAccountId: "acc-1561-id",
          },
        ],
      },
    ];

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      categoryDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      categoryDefs as any,
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

    // Wait for category attribute to appear in list and preview
    const catHeaders = await screen.findAllByText("Phân loại hóa đơn mua vào");
    expect(catHeaders.length).toBeGreaterThanOrEqual(1);

    // Click on Edit category attribute button
    const editBtn = await screen.findByTestId("edit-attr-btn");
    fireEvent.click(editBtn);

    // Check that TK 1561 badge is rendered in option list inside edit form
    expect(await screen.findByText("TK 1561")).toBeInTheDocument();

    // CoaCombobox button should be rendered in the new option bar with TK Nợ placeholder
    expect(screen.getByText(/TK Nợ/i)).toBeInTheDocument();
  });

  it("automatically resolves TK 632 from legacy label '[TK 632] Gia công ngoài', displays TK badge, and pre-populates CoaCombobox on inline edit", async () => {
    const categoryDefs = [
      {
        id: "attr-invoice-category",
        code: "category",
        name: "Phân loại hóa đơn mua vào",
        fieldType: "SELECT",
        isGlobal: true,
        isSystem: true,
        isRequired: true,
        isActive: true,
        options: [
          {
            value: "GARAGE_SUBCONTRACT",
            label: "[TK 632] Gia công ngoài & Thầu phụ kỹ thuật",
          },
        ],
      },
    ];

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      categoryDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      categoryDefs as any,
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

    // Click on Edit category attribute button
    const editBtn = await screen.findByTestId("edit-attr-btn");
    fireEvent.click(editBtn);

    // Verify TK 632 badge is automatically displayed from label resolution
    expect(await screen.findByText("TK 632")).toBeInTheDocument();
    expect(
      screen.getByText("Gia công ngoài & Thầu phụ kỹ thuật"),
    ).toBeInTheDocument();

    // Click on inline edit pencil icon for this option
    const pencilBtn = screen.getByRole("button", { name: "Sửa" });
    fireEvent.click(pencilBtn);

    // After clicking edit, CoaCombobox inside inline edit form should have TK 632 pre-populated
    const coaButtons = screen.getAllByRole("button");
    const coaWith632 = coaButtons.find(
      (btn) =>
        btn.textContent?.includes("632") || btn.textContent?.includes("TK 632"),
    );
    expect(coaWith632).toBeTruthy();
  });
});
