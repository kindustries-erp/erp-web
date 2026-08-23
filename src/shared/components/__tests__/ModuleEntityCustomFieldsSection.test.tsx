import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ModuleEntityCustomFieldsSection } from "../ModuleEntityCustomFieldsSection";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, defaultText: string) => defaultText || key,
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getCategories: vi.fn(),
    getEntityValues: vi.fn(),
    saveEntityValues: vi.fn(),
  },
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
});
