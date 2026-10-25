import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ExportExcelDrawer } from "@/v2/shared/components/organisms/v2-export-excel-drawer";
import { V2ExportPeriodFields } from "./V2ExportPeriodFields";

const fields = (
  <V2ExportPeriodFields
    periodType="custom"
    onPeriodTypeChange={vi.fn()}
    period=""
    onPeriodChange={vi.fn()}
    periodOptions={[]}
    quarter=""
    onQuarterChange={vi.fn()}
    quarterOptions={[]}
    dateFrom="2026-10-01"
    onDateFromChange={vi.fn()}
    dateTo="2026-10-31"
    onDateToChange={vi.fn()}
  />
);

describe("date picker inside the export drawer", () => {
  it("closes when clicking another area of the drawer", async () => {
    render(
      <V2ExportExcelDrawer
        open
        onClose={vi.fn()}
        title="Drawer test"
        columnGroups={[]}
        selectedColumns={[]}
        defaultColumns={[]}
        onColumnsChange={vi.fn()}
        columnsTitle="Cột"
        historyTitle="Lịch sử"
        history={<div>history body</div>}
        conditions={fields}
      />,
    );
    const [fromTrigger] = screen.getAllByRole("button", { name: "dd/mm/yyyy" });

    fireEvent.click(fromTrigger);
    expect(fromTrigger).toHaveAttribute("aria-expanded", "true");
    await new Promise((r) => setTimeout(r, 50));

    fireEvent.pointerDown(screen.getByText("history body"), {
      pointerType: "mouse",
      button: 0,
    });
    expect(fromTrigger).toHaveAttribute("aria-expanded", "false");
  });
});
