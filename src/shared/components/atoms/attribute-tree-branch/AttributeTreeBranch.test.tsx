import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttributeTreeBranch } from "./AttributeTreeBranch";

describe("AttributeTreeBranch", () => {
  it("renders children with tree border styling", () => {
    render(
      <AttributeTreeBranch>
        <div>Child item</div>
      </AttributeTreeBranch>,
    );
    expect(screen.getByText("Child item")).toBeInTheDocument();
  });
});
