import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { InvoiceShapePage } from "./invoice-shape";

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

  it("opens on the dashboard with KPIs and charts", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Hóa đơn điện tử" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Doanh số bán ra")).toBeInTheDocument();
    expect(screen.getByTestId("line")).toBeInTheDocument();
    expect(screen.getByTestId("donut")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("loads a list tab on demand and shows rows, pill tabs and search", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Hóa đơn mua vào"));
    expect(await screen.findByText("C26TGA-1001")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Tìm số hóa đơn, đối tác, MST" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Thay thế")).toBeInTheDocument();
    expect(window.location.search).toContain("tab=in");
  });

  it("narrows the list with the search box", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Hóa đơn mua vào"));
    await screen.findByText("C26TGA-1001");
    const box = screen.getByRole("textbox", {
      name: "Tìm số hóa đơn, đối tác, MST",
    });
    fireEvent.change(box, { target: { value: "1005" } });
    fireEvent.keyDown(box, { key: "Enter" });
    await waitFor(() =>
      expect(screen.queryByText("C26TGA-1001")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("C26TGA-1005")).toBeInTheDocument();
  });

  it("opens the detail drawer from a row with its info, preview and tabs", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Hóa đơn mua vào"));
    fireEvent.click(await screen.findByText("C26TGA-1001"));
    expect(await screen.findByText("Hóa đơn C26TGA-1001")).toBeInTheDocument();
    expect(window.location.search).toContain("overlay=");
    expect(screen.getByText("Thông tin chung")).toBeInTheDocument();
    expect(screen.getByText("Tài chính")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ liên kết")).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes("<SHDon>1001</SHDon>")),
    ).toBeInTheDocument();
  });

  it("stacks the posting drawer over the detail drawer and closes only the top one", async () => {
    window.history.replaceState(
      null,
      "",
      "/v2/invoices?tab=in&overlay=invoice%3AIN-1,posting",
    );
    renderPage();
    expect(await screen.findByText("Hóa đơn C26TGA-1001")).toBeInTheDocument();
    expect(await screen.findByText("Hạch toán hóa đơn")).toBeInTheDocument();

    const closers = screen.getAllByRole("button", {
      name: "Đóng",
      hidden: true,
    });
    fireEvent.click(closers[closers.length - 1]!);
    await waitFor(() =>
      expect(screen.queryByText("Hạch toán hóa đơn")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Hóa đơn C26TGA-1001")).toBeInTheDocument();
    expect(window.location.search).not.toContain("posting");
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
