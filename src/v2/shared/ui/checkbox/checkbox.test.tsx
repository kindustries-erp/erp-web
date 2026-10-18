import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Checkbox } from "./checkbox";

describe("V2 Checkbox Primitive", () => {
  it("renders without crashing", () => {
    const { container } = render(<Checkbox />);
    expect(container).toBeInTheDocument();
  });
});
