import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageTab } from "../components/GarageTab/GarageTab";

// Mocks for child pages/views
vi.mock("@/modules/garage/pages/GarageDashboard", () => ({
  GarageDashboard: ({ activeTab, tabs }: any) => (
    <div data-testid="view-garage-dashboard">
      Dashboard View - Active: {activeTab} - TabsCount: {tabs?.length}
    </div>
  ),
}));

vi.mock("@/modules/garage/pages/GarageCases", () => ({
  GarageCases: ({ activeTab, tabs }: any) => (
    <div data-testid="view-garage-cases">
      Cases View - Active: {activeTab} - TabsCount: {tabs?.length}
    </div>
  ),
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("GarageTab Synchronous Keep-Alive Mounting & Default Dashboard Tab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/garage-cases");
  });

  it("by default mounts initial tab 'dashboard' immediately on first render", () => {
    render(<GarageTab />, { wrapper: createWrapper() });

    expect(screen.getByTestId("view-garage-dashboard")).toBeDefined();
    expect(screen.queryByTestId("view-garage-cases")).toBeNull();
  });

  it("mounts initial tab 'cases' when tab=cases query param is provided", () => {
    window.history.replaceState(null, "", "/garage-cases?tab=cases");
    render(<GarageTab />, { wrapper: createWrapper() });

    expect(screen.getByTestId("view-garage-cases")).toBeDefined();
    expect(screen.queryByTestId("view-garage-dashboard")).toBeNull();
  });

  it("synchronously mounts view-garage-cases when initialTab prop is 'cases'", () => {
    render(<GarageTab initialTab="cases" />, { wrapper: createWrapper() });

    expect(screen.getByTestId("view-garage-cases")).toBeDefined();
    expect(screen.queryByTestId("view-garage-dashboard")).toBeNull();
  });
});
