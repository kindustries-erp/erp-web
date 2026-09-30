import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttributeFieldLabel } from "./AttributeFieldLabel";

describe("AttributeFieldLabel", () => {
  it("renders display name and system badge when isSystem is true", () => {
    render(
      <AttributeFieldLabel
        displayName="Mã định danh"
        isSystem={true}
        t={(k, f) => f}
      />,
    );
    expect(screen.getByText("Mã định danh")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống")).toBeInTheDocument();
  });

  it("renders parent info when isChild is true", () => {
    render(
      <AttributeFieldLabel
        displayName="Tiểu loại"
        isChild={true}
        parentDisplayName="Phân loại chính"
        parentCode="CAT_MAIN"
        t={(k, f) => f}
      />,
    );
    expect(screen.getByText("Tiểu loại")).toBeInTheDocument();
    expect(screen.getByText("Phân loại chính")).toBeInTheDocument();
    expect(screen.getByText("(CAT_MAIN)")).toBeInTheDocument();
  });
});
