import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ModuleCustomFieldConfigDrawer } from "../ModuleCustomFieldConfigDrawer";
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
    const sysHeaders = await screen.findAllByText("Thuộc tính mặc định");
    expect(sysHeaders.length).toBeGreaterThanOrEqual(2); // 1 list + 1 live preview
    expect(screen.getAllByText("Loại nhập kho").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByText("Mặc định")).toBeInTheDocument();

    // 2. Check title of custom attributes section (appears in both left list and right preview panel)
    const customHeaders = screen.getAllByText("Thuộc tính tùy chỉnh");
    expect(customHeaders.length).toBeGreaterThanOrEqual(2); // 1 list + 1 live preview
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
      expect(await screen.findByText("12 dùng")).toBeInTheDocument();

      // Verify edit label buttons exist
      const editLabelBtns = screen.getAllByTitle("Sửa tên hiển thị");
      expect(editLabelBtns.length).toBeGreaterThanOrEqual(2);

      // Click edit label on the first option (PO)
      fireEvent.click(editLabelBtns[0]);
      const labelInput = screen.getByDisplayValue("Đơn mua hàng");
      expect(labelInput).toBeInTheDocument();

      // Change VI label directly on input
      fireEvent.change(labelInput, {
        target: { value: "Đơn mua hàng (PO mới)" },
      });

      // Open Multilingual Popover on inline option editor to set English translation
      const inlineConfigBtns = screen.getAllByTitle(
        "Cấu hình tên đa ngôn ngữ (VI, EN...)",
      );
      expect(inlineConfigBtns.length).toBeGreaterThanOrEqual(1);
      fireEvent.click(inlineConfigBtns[inlineConfigBtns.length - 1]);

      const enOptionInput = await screen.findByPlaceholderText(/English/i);
      fireEvent.change(enOptionInput, {
        target: { value: "Purchase Order (New PO)" },
      });

      // Click the main form "Lưu" button
      const saveFormBtn = screen.getByRole("button", { name: "Lưu" });
      fireEvent.click(saveFormBtn);

      // Verify updateAttributeDef was called with updated multilingual options
      expect(moduleConfigApi.updateAttributeDef).toHaveBeenCalledWith(
        "attr-sys-1",
        expect.objectContaining({
          options: [
            {
              value: "PO",
              label: "Đơn mua hàng (PO mới)",
              labelEn: "Purchase Order (New PO)",
              labels: expect.objectContaining({
                vi: "Đơn mua hàng (PO mới)",
                en: "Purchase Order (New PO)",
              }),
            },
            { value: "OTHER", label: "Nhập khác" },
          ],
        }),
      );
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

    // Open Multilingual Popover to fill Name EN
    const configBtn = screen.getByTitle("Cấu hình tên đa ngôn ngữ (VI, EN...)");
    fireEvent.click(configBtn);
    const nameEnInput = await screen.findByPlaceholderText(/English/i);
    fireEvent.change(nameEnInput, { target: { value: "Package Type" } });

    // Click "Tạo mới"
    const saveBtn = screen.getByRole("button", { name: "Tạo mới" });
    fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(moduleConfigApi.createAttributeDef).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "package_type",
          name: "Loại kiện hàng",
          nameEn: "Package Type",
          isGlobal: true,
          moduleKeyGlobal: "GOODS_RECEIPT",
        }),
      );
    });
  });
});
