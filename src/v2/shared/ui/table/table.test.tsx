import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Table } from "./table";

describe("V2 Table Primitive", () => {
  it("renders without crashing", () => {
    const { container } = render(<Table />);
    expect(container).toBeInTheDocument();
  });
});
