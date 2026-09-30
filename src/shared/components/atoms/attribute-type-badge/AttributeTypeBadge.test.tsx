import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttributeTypeBadge } from "./AttributeTypeBadge";

describe("AttributeTypeBadge", () => {
  it("renders badge for SELECT field type", () => {
    render(<AttributeTypeBadge type="SELECT" t={(k, f) => f} />);
    expect(screen.getByText("Lựa chọn")).toBeInTheDocument();
  });
});
