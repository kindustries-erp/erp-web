import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/Tooltip";
import { ModuleCustomFieldConfigDrawer } from "../ModuleCustomFieldConfigDrawer";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, defaultText: string) => defaultText || key,
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getGlobalAttributeDefs: vi.fn(),
    getAttributeDefs: vi.fn(),
    createAttributeDef: vi.fn(),
    updateAttributeDef: vi.fn(),
    deleteAttributeDef: vi.fn(),
  },
  resolveAttrName: (attr: any) => attr?.name || "",
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

  it("renders both system and custom attributes sections correctly", async () => {
    const mockDefs = [
      {
        id: "attr-sys-1",
        code: "type",
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

    vi.mocked(moduleConfigApi.getGlobalAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );
    vi.mocked(moduleConfigApi.getAttributeDefs).mockResolvedValue(
      mockDefs as any,
    );

    render(
      <ModuleCustomFieldConfigDrawer
        open={true}
        onClose={vi.fn()}
        moduleKey="GOODS_RECEIPT"
      />,
      { wrapper },
    );

    // 1. Check title of system attributes section
    expect(
      await screen.findByText("Thuộc tính mặc định (Hệ thống)"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Loại nhập kho").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByText("Mặc định hệ thống")).toBeInTheDocument();

    // 2. Check title of custom attributes section
    expect(screen.getByText("Thuộc tính tùy chỉnh")).toBeInTheDocument();
    expect(
      screen.getAllByText("Ghi chú đặc biệt").length,
    ).toBeGreaterThanOrEqual(1);

    // 3. Check bottom add button exists
    expect(screen.getByText("Thêm thuộc tính")).toBeInTheDocument();
  });
});
