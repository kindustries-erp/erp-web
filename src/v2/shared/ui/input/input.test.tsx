import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Input } from "./input";

describe("V2 Input Primitive", () => {
  it("renders without crashing", () => {
    const { container } = render(<Input />);
    expect(container).toBeInTheDocument();
  });
});
