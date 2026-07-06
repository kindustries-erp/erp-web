import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterButton, FilterPanel } from "../FilterPanel";
import type {
  FilterPanelConfig,
  FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

vi.mock("@/core/config/appStore", () => ({
  useAppStore: () => ({ locale: "vi" }),
}));

vi.mock("@/modules/finance/utils/financeHelpers", () => ({
  PERIOD_OPTS: [{ value: "2026-05", label: "Tháng 5/2026" }],
  initPeriod: () => "2026-05",
  initDateFrom: () => "2026-05-01",
  initDateTo: () => "2026-05-31",
  periodFirstDay: (p: string) => `${p}-01`,
  periodLastDay: (p: string) => {
    if (!p) return "";
    const [y, m] = p.split("-").map(Number);
    return `${p}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  },
  monthFirstDay: (date: string) => (date ? `${date.slice(0, 7)}-01` : ""),
}));

// Mock child components to simplify testing
vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ placeholder }: { placeholder?: string }) => (
    <input data-testid="date-picker" placeholder={placeholder} />
  ),
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="combobox">{placeholder}</div>
  ),
}));

function makeFilter(
  overrides: Partial<FilterPanelReturn> = {},
): FilterPanelReturn {
  return {
    state: {
      period: "2026-05",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
      channel: "",
      search: "",
      amountMin: "",
      amountMax: "",
      status: "",
      counterpartySource: "",
      custom: {},
    },
    inputs: { search: "", amountMin: "", amountMax: "" },
    panelOpen: false,
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    togglePanel: vi.fn(),
    setPeriod: vi.fn(),
    setDateFrom: vi.fn(),
    setDateTo: vi.fn(),
    setChannel: vi.fn(),
    setSearchInput: vi.fn(),
    setAmountMinInput: vi.fn(),
    setAmountMaxInput: vi.fn(),
    setStatus: vi.fn(),
    setCounterpartySource: vi.fn(),
    setCustom: vi.fn(),
    resetAll: vi.fn(),
    hasActiveFilter: false,
    activeFilterCount: 0,
    ...overrides,
  };
}

describe("FilterPanel", () => {
  it("renders with w-0 when panelOpen is false (desktop)", () => {
    const config: FilterPanelConfig = { search: true, period: true };
    const filter = makeFilter({ panelOpen: false });

    const { container } = render(
      <FilterPanel config={config} filter={filter} />,
    );

    // Desktop div (hidden md:block) should have w-0 class
    const desktopDiv = container.querySelector(".md\\:block");
    expect(desktopDiv).toHaveClass("w-0");
  });

  it("renders with w-[210px] when panelOpen is true (desktop)", () => {
    const config: FilterPanelConfig = { search: true, period: true };
    const filter = makeFilter({ panelOpen: true });

    const { container } = render(
      <FilterPanel config={config} filter={filter} />,
    );

    // Desktop div (hidden md:block) should have w-[210px] class
    const desktopDiv = container.querySelector(".md\\:block");
    expect(desktopDiv).toHaveClass("w-[210px]");
  });

  it("renders active filter count badge inside header when hasActiveFilter is true", () => {
    const config: FilterPanelConfig = { search: true };
    const filter = makeFilter({
      panelOpen: true,
      hasActiveFilter: true,
      activeFilterCount: 5,
    });

    render(<FilterPanel config={config} filter={filter} />);

    // Active filter count badge (5) should be present in the panel header (rendered twice: mobile and desktop)
    const badges = screen.getAllByText("Bộ lọc (5)");
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0]).toBeInTheDocument();
  });

  it("renders filter sections when panelOpen is true and config enables them", () => {
    const config: FilterPanelConfig = { period: true };
    const filter = makeFilter({ panelOpen: true });

    render(<FilterPanel config={config} filter={filter} />);

    // Period combobox should be rendered
    const comboboxes = screen.getAllByTestId("combobox");
    expect(comboboxes.length).toBeGreaterThan(0);
  });

  it("only renders enabled filters (period: false hides period)", () => {
    const config: FilterPanelConfig = { period: false };
    const filter = makeFilter({ panelOpen: true });

    render(<FilterPanel config={config} filter={filter} />);

    // Period combobox should NOT be present (no combobox rendered)
    expect(screen.queryAllByTestId("combobox")).toHaveLength(0);
  });

  it("calls closePanel when X button clicked", () => {
    const config: FilterPanelConfig = { search: true };
    const closePanel = vi.fn();
    const filter = makeFilter({ panelOpen: true, closePanel });

    const { container } = render(
      <FilterPanel config={config} filter={filter} />,
    );

    // Find the X close button (the one without title="Reset")
    const buttons = container.querySelectorAll("button");
    // The close button is the last button in the header (no title attribute)
    const closeBtn = Array.from(buttons).find(
      (btn) => !btn.getAttribute("title") && btn.querySelector("svg"),
    );
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);

    expect(closePanel).toHaveBeenCalled();
  });
});

describe("FilterButton", () => {
  it("renders with correct activeCount badge", () => {
    render(<FilterButton onClick={vi.fn()} activeCount={3} />);

    expect(screen.getByText("Bộ lọc (3)")).toBeInTheDocument();
  });

  it("does not render badge when activeCount is 0", () => {
    render(<FilterButton onClick={vi.fn()} activeCount={0} />);

    expect(screen.getByText("Bộ lọc")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("onClick calls the provided handler", () => {
    const onClick = vi.fn();
    render(<FilterButton onClick={onClick} activeCount={0} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
