import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Table, TableBody, TableFooter, TableHeader, TableRow } from "./table";

describe("V2 Table Primitive", () => {
  it("renders without crashing", () => {
    const { container } = render(<Table />);
    expect(container).toBeInTheDocument();
  });

  it("applies border-border/40 to TableRow by default to prevent currentColor fallback", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow data-testid="test-row" />
        </TableBody>
      </Table>,
    );
    const row = container.querySelector("tr");
    expect(row).toBeInTheDocument();
    expect(row?.className).toContain("border-b");
    expect(row?.className).toContain("border-border/40");
  });

  it("applies border-border/40 to TableHeader and TableFooter", () => {
    const { container } = render(
      <Table>
        <TableHeader data-testid="test-header" />
        <TableFooter data-testid="test-footer" />
      </Table>,
    );
    const thead = container.querySelector("thead");
    const tfoot = container.querySelector("tfoot");
    expect(thead?.className).toContain("[&_tr]:border-border/40");
    expect(tfoot?.className).toContain("border-border/40");
  });
});
