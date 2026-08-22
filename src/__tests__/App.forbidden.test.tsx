import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

const mockBootstrapAction = vi.fn();
const mockSyncFromUrl = vi.fn();

let appState = {
  currentPage: "purchasing" as any,
  currentInstanceId: "purchasing",
  isLoggedIn: true,
  syncFromUrl: mockSyncFromUrl,
  forbidden: true,
  openTabs: [
    { instanceId: "purchasing", pageKey: "purchasing", instanceIndex: 1 },
  ] as any,
};

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => appState,
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    bootstrapAction: mockBootstrapAction,
  }),
}));

vi.mock("@/core/components/layout/sidebar/index", () => ({
  Sidebar: () => <div>sidebar</div>,
}));

vi.mock("@/core/components/layout/Topbar", () => ({
  Topbar: () => <div>topbar</div>,
}));

vi.mock("@/core/components/layout/TabBar", () => ({
  TabBar: () => <div>tabbar</div>,
}));

vi.mock("@/shared/components/SlidePanel", () => ({
  SlidePanel: () => <div>slidepanel</div>,
}));

vi.mock("@/shared/components/SerialGenerationProgress", () => ({
  SerialGenerationProgress: () => null,
}));

vi.mock(
  "@/modules/goods-receipts-core/hooks/useSerialGenerationProgress",
  () => ({
    useSerialGenerationProgress: () => {},
  }),
);

vi.mock("@/shared/components/Toast", () => ({
  Toast: () => null,
}));

vi.mock("@/shared/components/TopProgressBar", () => ({
  TopProgressBar: () => null,
}));

vi.mock("@/shared/components/ContextMenu", () => ({
  AppContextMenu: () => null,
}));

vi.mock("@/core/components/DocumentDependencyModal", () => ({
  DocumentDependencyModal: () => null,
}));

vi.mock("@/ReloadPrompt", () => ({
  ReloadPrompt: () => null,
}));

vi.mock("@/core/components/EnvStamp", () => ({
  EnvStamp: () => null,
}));

vi.mock("@/core/store/useEnvStore", () => ({
  useEnvStore: {
    getState: () => ({
      fetchAppConfig: vi.fn(),
    }),
  },
}));

vi.mock("@/core/components/GlobalErpDocumentOpener", () => ({
  GlobalErpDocumentOpener: () => null,
}));

vi.mock("@/shared/utils/pageUrl", () => ({
  pathToPage: () => ({ page: "purchasing" }),
}));

vi.mock("@/pages/Dashboard", () => ({
  Dashboard: () => <div>dashboard-page</div>,
}));

vi.mock("@/pages/Sales", () => ({
  BanHang: () => <div>sales-page</div>,
}));

vi.mock("@/pages/Login", () => ({
  Login: () => <div>login-page</div>,
}));

vi.mock("@/pages/NotFound", () => ({
  NotFound: () => <div>not-found-page</div>,
}));

vi.mock("@/pages/Forbidden", () => ({
  Forbidden: () => <div>error-page-403</div>,
}));

vi.mock("@/pages/Purchasing", () => ({
  MuaHang: () => <div>purchasing-page</div>,
}));

vi.mock("@/pages/Inventory", () => ({
  Kho: () => <div>inventory-page</div>,
}));

vi.mock("@/pages/MfgItems", () => ({
  MfgItems: () => <div>mfg-items-page</div>,
}));

vi.mock("@/pages/MfgVehicles", () => ({
  MfgVehicles: () => <div>mfg-vehicles-page</div>,
}));

vi.mock("@/core/components/ui/Tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("App forbidden handling", () => {
  beforeEach(() => {
    mockBootstrapAction.mockClear();
    mockSyncFromUrl.mockClear();
    appState = {
      currentPage: "purchasing" as any,
      currentInstanceId: "purchasing",
      isLoggedIn: true,
      syncFromUrl: mockSyncFromUrl,
      forbidden: true,
      openTabs: [
        { instanceId: "purchasing", pageKey: "purchasing", instanceIndex: 1 },
      ] as any,
    };
  });

  it("renders the current page instead of the 403 error page when logged in", async () => {
    render(<App />);

    expect(await screen.findByText("purchasing-page")).toBeInTheDocument();
    expect(screen.queryByText("error-page-403")).not.toBeInTheDocument();
  });
});
