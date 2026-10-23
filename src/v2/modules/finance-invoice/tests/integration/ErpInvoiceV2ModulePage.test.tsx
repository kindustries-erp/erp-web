import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { InvoiceShapePage } from "@/v2/modules/finance-invoice";

vi.mock("react-chartjs-2", () => {
  const stub = (name: string) => () => <div data-testid={name} />;
  return { Bar: stub("bar"), Line: stub("line"), Doughnut: stub("donut") };
});

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <div style={{ height: 800 }}>
        <InvoiceShapePage />
      </div>
    </QueryClientProvider>,
  );

describe("InvoiceShape page (parity smoke test)", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/v2/invoices");
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("opens on the dashboard with KPIs and charts", async () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Hóa đơn điện tử" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Doanh số bán ra")).toBeInTheDocument();
    expect(await screen.findByTestId("line")).toBeInTheDocument();
    expect(screen.getByTestId("donut")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("loads a list tab on demand, shows rows and the tax filter group in the view popover", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Hóa đơn mua vào"));
    expect(await screen.findByText("C26TGA-1001")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Thay thế/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    expect(
      screen.getByRole("option", { name: /Thay thế/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /Tìm số hóa đơn/ }),
    ).toBeNull();
    expect(window.location.search).toContain("tab=in");
  });

  it("opens the read-only detail drawer with its info and no edit or posting actions", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Hóa đơn mua vào"));
    fireEvent.click(await screen.findByText("C26TGA-1001"));
    expect(await screen.findByText("Hóa đơn C26TGA-1001")).toBeInTheDocument();
    expect(window.location.search).toContain("overlay=");
    expect(screen.getByText("Thông tin chung")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hạch toán" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Tài chính" })).toBeNull();
  });

  it("ignores non-detail overlay keys in the URL and still opens the detail drawer", async () => {
    window.history.replaceState(
      null,
      "",
      "/v2/invoices?tab=in&overlay=invoice%3AIN-1,posting",
    );
    renderPage();
    expect(await screen.findByText("Hóa đơn C26TGA-1001")).toBeInTheDocument();
  });

  it("restores an open drawer from the URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/v2/invoices?tab=in&overlay=invoice%3AIN-3",
    );
    renderPage();
    expect(await screen.findByText("Hóa đơn C26TGA-1003")).toBeInTheDocument();
  });
});
