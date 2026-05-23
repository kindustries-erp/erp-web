import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLayout } from "../PageLayout";

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ locale: "vi" }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

vi.mock("@/shared/components/PageHeader", () => ({
  PageHeader: ({
    title,
    desc,
    icon,
    actions,
  }: {
    title: React.ReactNode;
    desc?: React.ReactNode;
    icon: React.ReactNode;
    actions?: React.ReactNode;
  }) => (
    <div data-testid="page-header">
      <span data-testid="header-title">{title}</span>
      {desc && <span data-testid="header-desc">{desc}</span>}
      <span data-testid="header-icon">{icon}</span>
      {actions && <span data-testid="header-actions">{actions}</span>}
    </div>
  ),
}));

vi.mock("@/shared/components/ui/tabs", () => ({
  Tabs: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    value?: string;
  }) => (
    <div data-testid="tabs" data-value={props.value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button data-testid={`tab-${value}`}>{children}</button>,
}));

describe("PageLayout", () => {
  it("renders title and description in PageHeader", () => {
    render(
      <PageLayout
        title="Tiền mặt"
        desc="Quản lý thu chi"
        icon={<span>💰</span>}
      >
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("header-title")).toHaveTextContent("Tiền mặt");
    expect(screen.getByTestId("header-desc")).toHaveTextContent(
      "Quản lý thu chi",
    );
  });

  it("renders icon in PageHeader", () => {
    render(
      <PageLayout title="Test" icon={<span data-testid="my-icon">🏦</span>}>
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("my-icon")).toBeInTheDocument();
  });

  it("renders actions in PageHeader", () => {
    render(
      <PageLayout
        title="Test"
        icon={<span>📋</span>}
        actions={<button data-testid="action-btn">Add</button>}
      >
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <PageLayout title="Test" icon={<span>📋</span>}>
        <div data-testid="child-content">Hello World</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("child-content")).toHaveTextContent(
      "Hello World",
    );
  });

  it("does not render header when hideHeader is true", () => {
    render(
      <PageLayout title="Test" icon={<span>📋</span>} hideHeader>
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.queryByTestId("page-header")).not.toBeInTheDocument();
  });

  it("renders tabs when tabs prop is provided", () => {
    const tabs = [
      { value: "all", label: "Tất cả" },
      { value: "posted", label: "Đã ghi sổ" },
    ];

    render(
      <PageLayout
        title="Test"
        icon={<span>📋</span>}
        tabs={tabs}
        activeTab="all"
      >
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tab-all")).toHaveTextContent("Tất cả");
    expect(screen.getByTestId("tab-posted")).toHaveTextContent("Đã ghi sổ");
  });

  it("does not render tabs when hideTabs is true", () => {
    const tabs = [{ value: "all", label: "Tất cả" }];

    render(
      <PageLayout title="Test" icon={<span>📋</span>} tabs={tabs} hideTabs>
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.queryByTestId("tabs")).not.toBeInTheDocument();
  });

  it("applies className to root div", () => {
    const { container } = render(
      <PageLayout title="Test" icon={<span>📋</span>} className="custom-class">
        <div>content</div>
      </PageLayout>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("root div has space-y-4 class", () => {
    const { container } = render(
      <PageLayout title="Test" icon={<span>📋</span>}>
        <div>content</div>
      </PageLayout>,
    );

    expect(container.firstChild).toHaveClass("space-y-4");
  });
});
