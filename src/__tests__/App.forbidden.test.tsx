import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

const mockBootstrapAction = vi.fn();
const mockSyncFromUrl = vi.fn();

let appState = {
  currentPage: "dashboard",
  isLoggedIn: true,
  syncFromUrl: mockSyncFromUrl,
  forbidden: true,
  openTabs: ["dashboard"],
};

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => appState,
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    bootstrapAction: mockBootstrapAction,
  }),
}));

vi.mock("@/core/components/layout/Sidebar", () => ({
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

vi.mock("@/shared/components/Toast", () => ({
  Toast: () => <div>toast</div>,
}));

vi.mock("@/shared/components/ContextMenu", () => ({
  AppContextMenu: () => <div>contextmenu</div>,
}));

vi.mock("@/ReloadPrompt", () => ({
  ReloadPrompt: () => <div>reloadprompt</div>,
}));

vi.mock("@/shared/utils/pageUrl", () => ({
  pathToPage: () => ({ page: "dashboard" }),
}));

vi.mock("@/pages/Dashboard", () => ({
  Dashboard: () => <div>dashboard-page</div>,
}));

vi.mock("@/pages/Sales", () => ({
  BanHang: () => <div>sales-page</div>,
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

vi.mock("@/pages/Login", () => ({
  Login: () => <div>login-page</div>,
}));

vi.mock("@/pages/NotFound", () => ({
  NotFound: () => <div>not-found-page</div>,
}));

vi.mock("@/shared/components/ErrorPage", () => ({
  ErrorPage: ({ code }: { code: string }) => <div>error-page-{code}</div>,
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
      currentPage: "dashboard",
      isLoggedIn: true,
      syncFromUrl: mockSyncFromUrl,
      forbidden: true,
      openTabs: ["dashboard"],
    };
  });

  it("renders the current page instead of the 403 error page when logged in", () => {
    render(<App />);

    expect(screen.getByText("dashboard-page")).toBeInTheDocument();
    expect(screen.queryByText("error-page-403")).not.toBeInTheDocument();
  });
});
