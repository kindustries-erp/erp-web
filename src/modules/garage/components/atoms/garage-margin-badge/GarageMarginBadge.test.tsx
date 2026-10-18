import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageMarginBadge, getMarginRangeClasses } from "./GarageMarginBadge";

describe("GarageMarginBadge Atom", () => {
  it("renders dash placeholder when margin is null or undefined", () => {
    const { container: c1 } = render(<GarageMarginBadge margin={null} />);
    expect(c1.textContent).toContain("—");

    const { container: c2 } = render(<GarageMarginBadge margin={undefined} />);
    expect(c2.textContent).toContain("—");
  });

  it("renders dash placeholder when revenue is 0 and margin is 0", () => {
    const { container } = render(<GarageMarginBadge margin={0} revenue={0} />);
    expect(container.textContent).toContain("—");
  });

  it("renders range 1 (negative < 0%): rose color", () => {
    const { container } = render(<GarageMarginBadge margin={-5.2} />);
    expect(screen.getByText("-5.2%")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("text-rose-800");
  });

  it("renders range 2 (low 0% - < 20%): amber color", () => {
    const { container } = render(<GarageMarginBadge margin={15.4} />);
    expect(screen.getByText("+15.4%")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("text-amber-800");
  });

  it("renders range 3 (medium 20% - < 40%): sky color", () => {
    const { container } = render(<GarageMarginBadge margin={30.0} />);
    expect(screen.getByText("+30.0%")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("text-sky-800");
  });

  it("renders range 4 (good 40% - < 60%): emerald color", () => {
    const { container } = render(<GarageMarginBadge margin={52.5} />);
    expect(screen.getByText("+52.5%")).toBeDefined();
    expect(container.firstElementChild?.className).toContain(
      "text-emerald-800",
    );
  });

  it("renders range 5 (great 60% - < 80%): teal color", () => {
    const { container } = render(<GarageMarginBadge margin={70.1} />);
    expect(screen.getByText("+70.1%")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("text-teal-800");
  });

  it("renders range 6 (excellent >= 80%): purple color", () => {
    const { container } = render(<GarageMarginBadge margin={85.0} />);
    expect(screen.getByText("+85.0%")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("text-purple-800");
  });

  it("getMarginRangeClasses unit check for boundary values", () => {
    expect(getMarginRangeClasses(-0.1)).toContain("rose");
    expect(getMarginRangeClasses(0)).toContain("amber");
    expect(getMarginRangeClasses(19.9)).toContain("amber");
    expect(getMarginRangeClasses(20)).toContain("sky");
    expect(getMarginRangeClasses(39.9)).toContain("sky");
    expect(getMarginRangeClasses(40)).toContain("emerald");
    expect(getMarginRangeClasses(59.9)).toContain("emerald");
    expect(getMarginRangeClasses(60)).toContain("teal");
    expect(getMarginRangeClasses(79.9)).toContain("teal");
    expect(getMarginRangeClasses(80)).toContain("purple");
    expect(getMarginRangeClasses(120)).toContain("purple");
  });
});
