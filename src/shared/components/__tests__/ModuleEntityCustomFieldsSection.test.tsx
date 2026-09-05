import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import {
  ModuleEntityCustomFieldsSection,
  validateModuleRequiredFields,
} from "../ModuleEntityCustomFieldsSection";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, defaultText: string) => defaultText || key,
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getCategories: vi.fn(),
    getGlobalAttributeDefs: vi.fn(),
    getEntityValues: vi.fn(),
    saveEntityValues: vi.fn(),
  },
  resolveCategoryName: (cat: any) => cat?.name || "",
  resolveAttrName: (attr: any) => attr?.name || "",
  resolveOptionLabel: (opt: any) => opt?.label || opt?.value || "",
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, placeholder, options }: any) => (
    <select
      data-testid="combobox"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{placeholder}</option>
      {(options || []).map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="date-picker"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

describe("ModuleEntityCustomFieldsSection", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    (moduleConfigApi.getCategories as any).mockResolvedValue([]);
    (moduleConfigApi.getGlobalAttributeDefs as any).mockResolvedValue([]);
    (moduleConfigApi.getEntityValues as any).mockResolvedValue(null);
  });

  const sampleCategories = [
    {
      id: "cat-1",
      moduleKey: "INVOICE",
      code: "EXPENSE",
      name: "Hóa đơn Chi phí",
      isActive: true,
      attributeDefs: [
        {
          id: "attr-dept",
          categoryId: "cat-1",
          code: "dept",
          name: "Phòng ban phụ trách",
          fieldType: "TEXT" as const,
          isRequired: true,
          isActive: true,
          isDeleted: false,
          sortOrder: 1,
        },
        {
          id: "attr-urgent",
          categoryId: "cat-1",
          code: "is_urgent",
          name: "Thanh toán khẩn cấp",
          fieldType: "CHECKBOX" as const,
          isRequired: false,
          isActive: true,
          isDeleted: false,
          sortOrder: 2,
        },
      ],
    },
  ];

  it("renders in view mode with empty state correctly", () => {
    (moduleConfigApi.getCategories as any).mockResolvedValue(sampleCategories);
    (moduleConfigApi.getEntityValues as any).mockResolvedValue({
      entityType: "INVOICE",
      entityId: "inv-1",
      categoryId: null,
      attributes: {},
      attributeValues: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModuleEntityCustomFieldsSection
            moduleKey="INVOICE"
            entityId="inv-1"
            editMode={false}
          />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Danh mục & Thuộc tính")).toBeDefined();
    expect(screen.getByText("— Chưa chọn danh mục —")).toBeDefined();
  });

  it("renders category name and attributes in view mode when selected", async () => {
    (moduleConfigApi.getCategories as any).mockResolvedValue(sampleCategories);
    (moduleConfigApi.getEntityValues as any).mockResolvedValue({
      entityType: "INVOICE",
      entityId: "inv-1",
      categoryId: "cat-1",
      attributes: {
        "attr-dept": "Phòng Kỹ thuật",
        "attr-urgent": "true",
      },
      attributeValues: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModuleEntityCustomFieldsSection
            moduleKey="INVOICE"
            entityId="inv-1"
            editMode={false}
            categoryId="cat-1"
            attributes={{
              "attr-dept": "Phòng Kỹ thuật",
              "attr-urgent": "true",
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Hóa đơn Chi phí")).toBeDefined();
    expect(screen.getByText("Phòng ban phụ trách")).toBeDefined();
    expect(screen.getByText("Phòng Kỹ thuật")).toBeDefined();
  });

  it("calls onCategoryChange and onAttributesChange in edit mode", async () => {
    (moduleConfigApi.getCategories as any).mockResolvedValue(sampleCategories);

    const onCategoryChange = vi.fn();
    const onAttributesChange = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModuleEntityCustomFieldsSection
            moduleKey="INVOICE"
            entityId="inv-1"
            editMode={true}
            categoryId="cat-1"
            onCategoryChange={onCategoryChange}
            attributes={{ "attr-dept": "Phòng Kế toán" }}
            onAttributesChange={onAttributesChange}
          />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    // Text field for "attr-dept"
    const textInput = await screen.findByPlaceholderText(
      "Nhập Phòng ban phụ trách...",
    );
    expect(textInput).toBeDefined();

    fireEvent.change(textInput, { target: { value: "Phòng Marketing" } });
    fireEvent.blur(textInput);
    expect(onAttributesChange).toHaveBeenCalledWith(
      expect.objectContaining({ "attr-dept": "Phòng Marketing" }),
    );

    // Test clear button
    const clearBtn = screen.getByTitle("Xóa nhanh");
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onAttributesChange).toHaveBeenCalledWith(
      expect.objectContaining({ "attr-dept": "" }),
    );
  });

  it("renders global attributes automatically without category selection", async () => {
    const sampleGlobalDefs = [
      {
        id: "glob-approval",
        isGlobal: true,
        moduleKeyGlobal: "INVOICE",
        code: "approval_note",
        name: "Ghi chú phê duyệt",
        fieldType: "TEXT" as const,
        isRequired: true,
        isActive: true,
        isDeleted: false,
        sortOrder: 1,
      },
    ];

    (moduleConfigApi.getCategories as any).mockResolvedValue([]);
    (moduleConfigApi.getGlobalAttributeDefs as any).mockResolvedValue(
      sampleGlobalDefs,
    );

    const onGlobalAttributesChange = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModuleEntityCustomFieldsSection
            moduleKey="INVOICE"
            entityId="inv-1"
            editMode={true}
            globalAttributes={{ "glob-approval": "Đã duyệt bởi Giám đốc" }}
            onGlobalAttributesChange={onGlobalAttributesChange}
          />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Thuộc tính chung")).toBeDefined();
    expect(
      await screen.findByPlaceholderText("Nhập Ghi chú phê duyệt..."),
    ).toBeDefined();

    const input = screen.getByPlaceholderText("Nhập Ghi chú phê duyệt...");
    fireEvent.change(input, { target: { value: "Phê duyệt bổ sung" } });
    fireEvent.blur(input);

    expect(onGlobalAttributesChange).toHaveBeenCalledWith(
      expect.objectContaining({ "glob-approval": "Phê duyệt bổ sung" }),
    );
  });

  it("validates missing required global and category fields correctly", () => {
    const globalDefs = [
      {
        id: "g1",
        name: "Người duyệt",
        code: "approver",
        isGlobal: true,
        isRequired: true,
        isActive: true,
        isDeleted: false,
        fieldType: "TEXT" as const,
        sortOrder: 1,
      },
      {
        id: "g2",
        name: "Ghi chú tùy chọn",
        code: "optional_note",
        isGlobal: true,
        isRequired: false,
        isActive: true,
        isDeleted: false,
        fieldType: "TEXT" as const,
        sortOrder: 2,
      },
    ];

    const categoryDefs = [
      {
        id: "c1",
        name: "Phòng ban",
        code: "dept",
        isGlobal: false,
        isRequired: true,
        isActive: true,
        isDeleted: false,
        fieldType: "TEXT" as const,
        sortOrder: 1,
      },
    ];

    // Case 1: Missing both required global and category fields
    const missing = validateModuleRequiredFields({
      globalDefs,
      globalAttributes: {},
      categoryDefs,
      attributes: {},
      hasCategory: true,
      moduleKey: "INVOICE",
    });
    expect(missing).toEqual(["Người duyệt", "Phòng ban"]);

    // Case 2: Global filled, category missing
    const missing2 = validateModuleRequiredFields({
      globalDefs,
      globalAttributes: { g1: "Nguyễn Văn A" },
      categoryDefs,
      attributes: {},
      hasCategory: true,
      moduleKey: "INVOICE",
    });
    expect(missing2).toEqual(["Phòng ban"]);

    // Case 3: Both filled
    const missing3 = validateModuleRequiredFields({
      globalDefs,
      globalAttributes: { g1: "Nguyễn Văn A" },
      categoryDefs,
      attributes: { c1: "Kế toán" },
      hasCategory: true,
      moduleKey: "INVOICE",
    });
    expect(missing3).toEqual([]);
  });

  it("renders and validates system attributes when includeSystemAttributes is true", async () => {
    const sampleDefs = [
      {
        id: "sys-color",
        isGlobal: true,
        isSystem: true,
        moduleKeyGlobal: "BOM" as const,
        code: "color",
        name: "Màu sắc",
        fieldType: "SELECT" as const,
        options: [{ value: "blue", label: "Xanh" }],
        isRequired: true,
        isActive: true,
        isDeleted: false,
        sortOrder: 1,
      },
    ];

    (moduleConfigApi.getCategories as any).mockResolvedValue([]);
    (moduleConfigApi.getGlobalAttributeDefs as any).mockResolvedValue(
      sampleDefs,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModuleEntityCustomFieldsSection
            moduleKey="BOM"
            editMode={true}
            includeSystemAttributes={true}
            hideCategorySection={true}
          />
        </TooltipProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Màu sắc")).toBeDefined();

    // Test validator with includeSystemAttributes
    const missing = validateModuleRequiredFields({
      globalDefs: sampleDefs,
      globalAttributes: {},
      includeSystemAttributes: true,
      moduleKey: "BOM",
    });
    expect(missing).toEqual(["Màu sắc"]);

    const notMissingWhenFalse = validateModuleRequiredFields({
      globalDefs: sampleDefs,
      globalAttributes: {},
      includeSystemAttributes: false,
      moduleKey: "BOM",
    });
    expect(notMissingWhenFalse).toEqual([]);
  });
});
