import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { CustomFieldFormDrawer } from "../CustomFieldFormDrawer";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, defaultText: string) => defaultText || key,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: (selector: any) => selector({ locale: "vi" }),
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getCategories: vi.fn(),
    getGlobalAttributeDefs: vi.fn(),
    createAttributeDef: vi.fn(),
    updateAttributeDef: vi.fn(),
    deleteAttributeDef: vi.fn(),
    getAttributeOptionsUsage: vi.fn(),
  },
  resolveAttrName: (attr: any) => attr?.name || "",
  resolveOptionLabel: (opt: any) =>
    opt?.label || opt?.labels?.vi || opt?.value || "",
}));

describe("CustomFieldFormDrawer Component", () => {
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

  const mockGlobalDefs = [
    {
      id: "def-cat",
      code: "category",
      name: "Loại hóa đơn",
      fieldType: "SELECT",
      isGlobal: true,
      options: [
        { value: "PURCHASE_GOODS", label: "Mua hàng" },
        { value: "EXPENSE_OPEX", label: "Chi phí" },
      ],
    },
  ];

  it("updates parentAttrCode correctly when editing an existing attribute", async () => {
    vi.mocked(moduleConfigApi.getCategories).mockResolvedValue([]);
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockGlobalDefs as any,
    );
    vi.mocked(moduleConfigApi.updateAttributeDef).mockResolvedValue({
      id: "def-subcat",
    } as any);

    const mockRow = {
      id: "def-subcat",
      code: "subcategory",
      name: "Nhóm chi phí",
      nameEn: "Subcategory",
      fieldType: "SELECT" as const,
      isGlobal: true,
      moduleKey: "INVOICE_IN",
      parentAttrCode: null,
      isRequired: false,
      isActive: true,
      sortOrder: 0,
      options: [{ value: "RENT", label: "Thuê mặt bằng" }],
    };

    render(
      <CustomFieldFormDrawer
        open={true}
        onClose={vi.fn()}
        mode="edit"
        fieldRow={mockRow as any}
      />,
      { wrapper },
    );

    // Verify form rendered
    expect(await screen.findByDisplayValue("subcategory")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nhóm chi phí")).toBeInTheDocument();

    // Click Save button
    const saveBtn = screen.getByRole("button", { name: "Lưu cấu hình" });
    fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(moduleConfigApi.updateAttributeDef).toHaveBeenCalledWith(
        "def-subcat",
        expect.objectContaining({
          code: "subcategory",
          name: "Nhóm chi phí",
          nameEn: "Subcategory",
          parentAttrCode: null,
        }),
      );
    });
  });

  it("creates a new attribute with parentAttrCode dependency", async () => {
    vi.mocked(moduleConfigApi.getCategories).mockResolvedValue([]);
    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockGlobalDefs as any,
    );
    vi.mocked(moduleConfigApi.createAttributeDef).mockResolvedValue({
      id: "new-def",
    } as any);

    render(
      <CustomFieldFormDrawer
        open={true}
        onClose={vi.fn()}
        mode="create"
        defaultModuleKey="INVOICE_IN"
      />,
      { wrapper },
    );

    // Enter Code
    const codeInput = await screen.findByPlaceholderText("custom_field_code");
    fireEvent.change(codeInput, { target: { value: "sub_type" } });

    // Enter Name
    const nameViInput = screen.getByPlaceholderText(
      "Tên thuộc tính (Tiếng Việt)...",
    );
    fireEvent.change(nameViInput, { target: { value: "Phân loại phụ" } });

    // Click Create / Save
    const createBtn = screen.getByRole("button", { name: "Lưu cấu hình" });
    fireEvent.click(createBtn);

    await vi.waitFor(() => {
      expect(moduleConfigApi.createAttributeDef).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "sub_type",
          name: "Phân loại phụ",
          isGlobal: true,
          moduleKeyGlobal: "INVOICE_IN",
        }),
      );
    });
  });
});
