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
import { FifoFlatTable, FifoFlatTableTotals } from "../FifoFlatTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { buildFlatLedgerRows } from "../fifoTransform";
import { buildFifoFixtureRows } from "./fifoLedgerFixture";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "vi" },
  }),
}));

const totals: FifoFlatTableTotals = {
  inQty: 10,
  outQty: 14,
  inValue: 1000,
  outValue: 1100,
  outRevenue: 2300,
  outProfit: 1200,
  balanceQty: -2,
  balanceValue: 0,
};

function Harness() {
  const tableState = useTableColumnState("fifo-characterization");
  return (
    <FifoFlatTable
      data={buildFlatLedgerRows(buildFifoFixtureRows())}
      onOpenInvoice={() => {}}
      tableState={tableState}
      totals={totals}
      optionsMap={{}}
    />
  );
}

describe("FifoFlatTable characterization", () => {
  it("renders one row per ledger entry with invoice numbers in order", () => {
    const { container } = render(withQuery(<Harness />));
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows).toHaveLength(4);
    expect(container.textContent).toContain("HD-IN-001");
    expect(container.textContent).toContain("HD-RET-001");
  });

  it("matches the baseline DOM for the fixture", () => {
    const { container } = render(withQuery(<Harness />));
    expect(container).toMatchSnapshot();
  });
});
