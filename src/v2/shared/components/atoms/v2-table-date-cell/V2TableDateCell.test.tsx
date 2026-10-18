import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2TableDateCell } from "./V2TableDateCell";
import { formatDateTimeParts } from "./v2TableDate";

describe("formatDateTimeParts", () => {
  it("formats date-only strings without timezone shifting", () => {
    expect(formatDateTimeParts("2026-02-15")).toEqual({ date: "15/02/2026" });
  });

  it("splits date and time for date-times", () => {
    expect(formatDateTimeParts(new Date(2026, 0, 5, 9, 7))).toEqual({
      date: "05/01/2026",
      time: "09:07",
    });
  });

  it("omits the time at local midnight", () => {
    expect(formatDateTimeParts(new Date(2026, 0, 5, 0, 0))).toEqual({
      date: "05/01/2026",
    });
  });

  it("returns null for empty or invalid values", () => {
    expect(formatDateTimeParts(null)).toBeNull();
    expect(formatDateTimeParts("")).toBeNull();
    expect(formatDateTimeParts("not a date")).toBeNull();
  });
});

describe("V2TableDateCell", () => {
  it("renders the date on top and the time muted below", () => {
    render(<V2TableDateCell date={new Date(2026, 2, 1, 14, 30)} />);
    expect(screen.getByText("01/03/2026")).toBeInTheDocument();
    expect(screen.getByText("14:30")).toHaveClass("text-muted-fg");
  });

  it("renders only the date when there is no time", () => {
    render(<V2TableDateCell date="2026-03-01" />);
    expect(screen.getByText("01/03/2026")).toBeInTheDocument();
    expect(screen.queryByText(/:/)).not.toBeInTheDocument();
  });

  it("renders a dash for missing dates", () => {
    render(<V2TableDateCell date={undefined} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
