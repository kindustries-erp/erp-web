import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LicensePlateCell } from "./LicensePlateCell";

describe("LicensePlateCell Atom", () => {
  it("renders fallback text when license plate is empty or null", () => {
    render(<LicensePlateCell licensePlate="" />);
    expect(screen.getByText("— (Chưa có BKS)")).toBeDefined();
  });

  it("renders license plate text with mono style when license plate is provided", () => {
    render(<LicensePlateCell licensePlate="51H02028" />);
    expect(screen.getByText("51H02028")).toBeDefined();
  });
});
