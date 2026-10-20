import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { NeutralCountBadge } from "./NeutralCountBadge";

describe("NeutralCountBadge", () => {
  it("renders count value", () => {
    render(<NeutralCountBadge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
