// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const withQuery = (ui: React.ReactElement) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {ui}
  </QueryClientProvider>
);
import { FifoUnitLedgerSection } from "../FifoUnitLedgerSection";
import { buildFifoFixtureRows } from "./fifoLedgerFixture";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "vi" },
  }),
}));

vi.mock("../useFifoUnitLedger", () => ({
  useFifoUnitLedger: () => ({ data: buildFifoFixtureRows(), isLoading: false }),
}));

vi.mock("@/modules/erp-invoices-core/components", () => ({
  ErpInvoiceStandaloneDrawer: () => null,
}));

vi.mock("../../VinfastPartsStockExportDrawer", () => ({
  VinfastPartsStockExportDrawer: () => null,
}));

describe("FifoUnitLedgerSection characterization", () => {
  it("shows all fixture rows with pagination total", () => {
    const { container } = render(
      withQuery(<FifoUnitLedgerSection sku="VF-TEST" />),
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(4);
    expect(container.textContent).toContain("HD-OUT-002");
  });

  it("matches the baseline DOM for the fixture", () => {
    const { container } = render(
      withQuery(<FifoUnitLedgerSection sku="VF-TEST" />),
    );
    expect(container).toMatchSnapshot();
  });
});
