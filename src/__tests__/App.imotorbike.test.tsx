import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import App from "@/App";

const mockBootstrapAction = vi.fn();
const mockSyncFromUrl = vi.fn();
const mockFetchAppConfig = vi.fn();

const appState = {
  currentPage: "dashboard" as any,
  currentInstanceId: "dashboard",
  isLoggedIn: false,
  syncFromUrl: mockSyncFromUrl,
  openTabs: [] as any,
};

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => appState,
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    bootstrapAction: mockBootstrapAction,
  }),
}));

vi.mock("@/core/store/useEnvStore", () => ({
  useEnvStore: {
    getState: () => ({
      fetchAppConfig: mockFetchAppConfig,
    }),
  },
}));

vi.mock("@/v2/modules/auth/pages/login/V2LoginPage", () => ({
  V2LoginPage: () => <div data-testid="v2-login-page">login-page</div>,
}));

vi.mock("@/core/components/layout/V2ShellLayout", () => ({
  V2ShellLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="v2-shell-layout">{children}</div>
  ),
}));

vi.mock(
  "@/modules/goods-receipts-core/hooks/useSerialGenerationProgress",
  () => ({
    useSerialGenerationProgress: () => {},
  }),
);

vi.mock("@/shared/components/SerialGenerationProgress", () => ({
  SerialGenerationProgress: () => null,
}));

vi.mock("@/shared/components/SlidePanel", () => ({
  SlidePanel: () => null,
}));

vi.mock("@/v2/shared/components", () => ({
  V2Toaster: () => null,
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

vi.mock("@/core/components/GlobalErpDocumentOpener", () => ({
  GlobalErpDocumentOpener: () => null,
}));

vi.mock("@/core/components/ui/Tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("App public deck route (/imotorbike)", () => {
  beforeEach(() => {
    useV2LocaleStore.setState({ locale: "vi" });
    mockBootstrapAction.mockClear();
    mockSyncFromUrl.mockClear();
    mockFetchAppConfig.mockClear();
    appState.isLoggedIn = false;
  });

  it("renders V2DeckViewerPage on /imotorbike with toolbar and iframe without auth", async () => {
    window.history.pushState({}, "", "/imotorbike");
    render(<App />);

    const iframe = await screen.findByTitle(
      "iMotorbike Group – Phân tích tài chính đến 25/09/2026",
    );
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("src", "/decks/imotorbike.html#1");
    expect(screen.getByRole("button", { name: "Tải PDF" })).toBeInTheDocument();
    expect(screen.queryByTestId("v2-login-page")).not.toBeInTheDocument();
    expect(mockBootstrapAction).not.toHaveBeenCalled();
    expect(mockSyncFromUrl).not.toHaveBeenCalled();
  });

  it("renders V2DeckViewerPage on /imotorbike/ without auth", async () => {
    window.history.pushState({}, "", "/imotorbike/");
    render(<App />);

    const iframe = await screen.findByTitle(
      "iMotorbike Group – Phân tích tài chính đến 25/09/2026",
    );
    expect(iframe).toBeInTheDocument();
    expect(screen.queryByTestId("v2-login-page")).not.toBeInTheDocument();
  });

  it("still renders V2LoginPage on other routes when unauthenticated", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(screen.getByTestId("v2-login-page")).toBeInTheDocument();
    expect(mockBootstrapAction).toHaveBeenCalled();
  });
});
