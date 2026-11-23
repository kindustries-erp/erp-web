import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BusinessPartner } from "../../../domain/entities/businessPartner";
import { buildBusinessPartnerColumns } from "./BusinessPartnerTable.columns";
import { PARTNER_VIEW_VISIBILITY } from "./BusinessPartnerTable.views";

const partner = (status: string): BusinessPartner => ({
  id: "p1",
  code: "KH-001",
  name: "Khách hàng A",
  partnerType: "CUSTOMER",
  status,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
});

const columns = buildBusinessPartnerColumns(
  (_key, fallback) => fallback ?? "",
  () => undefined,
);

const codeCell = (row: BusinessPartner) => {
  const column = columns.find((item) => item.key === "code")!;
  return render(<>{column.cell(row, 1)}</>);
};

describe("buildBusinessPartnerColumns", () => {
  it("leaves the row number to V2StandardTable", () => {
    expect(columns.map((column) => column.key)).not.toContain("index");
  });

  it("marks inactive partners with a short badge next to the code", () => {
    const { unmount } = codeCell(partner("ACTIVE"));
    expect(screen.queryByText("Ngưng")).not.toBeInTheDocument();
    unmount();

    codeCell(partner("INACTIVE"));
    expect(screen.getByText("Ngưng")).toBeInTheDocument();
  });
});

describe("summary row", () => {
  it("counts partners: each row adds 1 to the page subtotal, the total comes from summaries.code", () => {
    const column = columns.find((item) => item.key === "code")!;

    expect(column.summary).toMatchObject({ variant: "count" });
    expect(column.summary?.accessor?.(partner("ACTIVE"))).toBe(1);
  });

  it("has no numeric column to sum, so only the code column carries a summary", () => {
    expect(
      columns.filter((item) => item.summary).map((item) => item.key),
    ).toEqual(["code"]);
  });
});

describe("PARTNER_VIEW_VISIBILITY", () => {
  it("keeps the legal view focused on tax and address columns", () => {
    expect(PARTNER_VIEW_VISIBILITY.legal.taxCode).toBe(true);
    expect(PARTNER_VIEW_VISIBILITY.legal.email).toBe(false);
  });
});
