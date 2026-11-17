import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseStandaloneDrawer } from "../GarageCaseStandaloneDrawer";
import * as drawerLogicModule from "../drawer/hooks/useGarageCaseDrawerLogic";

const standardFormDrawerSpy = vi.fn();
const defaultAttributesSectionSpy = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fb?: string) => fb || _k,
  }),
}));

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: (props: any) => {
    standardFormDrawerSpy(props);
    return <div data-testid="standard-form-drawer">{props.rightPanel}</div>;
  },
  DrawerAuditTimeline: () => null,
}));

vi.mock("../drawer/sections/GarageCaseDefaultAttributesSection", () => ({
  GarageCaseDefaultAttributesSection: (props: any) => {
    defaultAttributesSectionSpy(props);
    return <div data-testid="default-attributes-section" />;
  },
}));

vi.mock("../drawer/sections/GarageCaseGeneralInfoSection", () => ({
  GarageCaseGeneralInfoSection: () => null,
}));

vi.mock(
  "@/modules/module-config/components/custom-fields/ModuleEntityCustomFieldsSection",
  () => ({
    ModuleEntityCustomFieldsSection: () => null,
  }),
);

vi.mock("../garage-case-details-tab/GarageCaseDetailsTab", () => ({
  GarageCaseDetailsTab: () => null,
}));

vi.mock("../GarageCasePartnerTab", () => ({
  GarageCasePartnerTab: () => null,
}));

vi.mock("../GarageCaseFinancialsTab", () => ({
  GarageCaseFinancialsTab: () => null,
  GarageCaseFinancialsRightPanel: () => null,
  GarageCaseFinancialsProvider: ({ children }: any) => children,
}));

vi.mock("@/shared/components/drawer/DrawerDocumentTraceability", () => ({
  DrawerDocumentTraceability: () => null,
}));

vi.mock("../../api/garageApi", () => ({
  garageApi: {
    getCasesByCustomer: vi.fn().mockResolvedValue([]),
    getCaseTraceabilityGraph: vi
      .fn()
      .mockResolvedValue({ nodes: [], edges: [] }),
  },
}));

vi.mock("../drawer/hooks/useGarageCaseDrawerLogic", () => ({
  useGarageCaseDrawerLogic: vi.fn(),
}));

describe("GarageCaseStandaloneDrawer RBAC Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseLogicMock = {
    t: (_k: string, fb?: string) => fb || _k,
    selectedBranchId: "branch-1",
    activeCaseCode: "CASE-001",
    selectedCase: {
      id: "case-1",
      soChungTu: "CASE-001",
      tenTinhTrangDichVu: "Đang sửa",
    },
    isLoadingCase: false,
    isSyncingDetail: false,
    grossProfit: null,
    editMode: false,
    startEdit: vi.fn(),
    saving: false,
    totalHasPendingChanges: false,
    draftCategoryId: null,
    setDraftCategoryId: vi.fn(),
    draftExcludeFromReports: false,
    setDraftExcludeFromReports: vi.fn(),
    draftExcludeFromDebt: false,
    setDraftExcludeFromDebt: vi.fn(),
    draftErpNotes: "",
    setDraftErpNotes: vi.fn(),
    draftAttributes: {},
    setDraftAttributes: vi.fn(),
    draftGlobalAttributes: {},
    setDraftGlobalAttributes: vi.fn(),
    handleCancel: vi.fn(),
    handleSaveAll: vi.fn(),
    activeTabKey: "quote_details",
    setActiveTabKey: vi.fn(),
    detailsSubTab: "details",
    setDetailsSubTab: vi.fn(),
    handleSelectCase: vi.fn(),
    activeSettlements: [],
    activeLinkedInvoices: [],
    activeSummary: null,
    mergedGraphData: null,
    auditItems: [],
    showSettlementModal: false,
    setShowSettlementModal: vi.fn(),
    settlementModalType: "RECEIPT",
    editingSettlementItem: null,
    setEditingSettlementItem: vi.fn(),
    showInvoiceModal: false,
    setShowInvoiceModal: vi.fn(),
    handleOpenAddSettlement: vi.fn(),
    handleOpenAddInvoice: vi.fn(),
    handleEditSettlementNode: vi.fn(),
    addSettlements: vi.fn(),
    removeSettlement: vi.fn(),
    addLinkedInvoice: vi.fn(),
    removeLinkedInvoice: vi.fn(),
    queryClient: {} as any,
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("passes onToggleEdit and onStartEdit when user has GARAGE:update permission (canUpdateGarage=true)", () => {
    vi.mocked(drawerLogicModule.useGarageCaseDrawerLogic).mockReturnValue({
      ...baseLogicMock,
      canUpdateGarage: true,
      editMode: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseStandaloneDrawer
          isOpen={true}
          caseCode="CASE-001"
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(standardFormDrawerSpy).toHaveBeenCalled();
    const mainDrawerCall = standardFormDrawerSpy.mock.calls
      .map((c: any) => c[0])
      .find(
        (p: any) =>
          typeof p?.title === "string" && p.title.includes("Sổ báo giá"),
      );
    expect(mainDrawerCall).toBeDefined();
    expect(mainDrawerCall.onToggleEdit).toBeDefined();

    expect(defaultAttributesSectionSpy).toHaveBeenCalled();
    const lastAttrsCall =
      defaultAttributesSectionSpy.mock.calls[
        defaultAttributesSectionSpy.mock.calls.length - 1
      ]?.[0];
    expect(lastAttrsCall.onStartEdit).toBeDefined();
  });

  it("disables onToggleEdit and onStartEdit when user lacks GARAGE:update permission (canUpdateGarage=false)", () => {
    vi.mocked(drawerLogicModule.useGarageCaseDrawerLogic).mockReturnValue({
      ...baseLogicMock,
      canUpdateGarage: false,
      editMode: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseStandaloneDrawer
          isOpen={true}
          caseCode="CASE-001"
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(standardFormDrawerSpy).toHaveBeenCalled();
    const mainDrawerCall = standardFormDrawerSpy.mock.calls
      .map((c: any) => c[0])
      .find(
        (p: any) =>
          typeof p?.title === "string" && p.title.includes("Sổ báo giá"),
      );
    expect(mainDrawerCall).toBeDefined();
    expect(mainDrawerCall.onToggleEdit).toBeUndefined();

    expect(defaultAttributesSectionSpy).toHaveBeenCalled();
    const lastAttrsCall =
      defaultAttributesSectionSpy.mock.calls[
        defaultAttributesSectionSpy.mock.calls.length - 1
      ]?.[0];
    expect(lastAttrsCall.onStartEdit).toBeUndefined();
  });

  it("renders exactly 3 Main Tabs: 'quote_details', 'customer_details', and 'sync_history'", () => {
    vi.mocked(drawerLogicModule.useGarageCaseDrawerLogic).mockReturnValue({
      ...baseLogicMock,
      canUpdateGarage: true,
      editMode: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseStandaloneDrawer
          isOpen={true}
          caseCode="CASE-001"
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    const mainDrawerCall = standardFormDrawerSpy.mock.calls
      .map((c: any) => c[0])
      .find(
        (p: any) =>
          typeof p?.title === "string" && p.title.includes("Sổ báo giá"),
      );
    expect(mainDrawerCall).toBeDefined();
    expect(mainDrawerCall.tabs).toHaveLength(3);
    const tabKeys = mainDrawerCall.tabs.map((t: any) => t.key);
    expect(tabKeys).toEqual([
      "quote_details",
      "customer_details",
      "sync_history",
    ]);
  });
});
