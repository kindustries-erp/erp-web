import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NavSection } from "../SidebarPrimitives";
import React from "react";

describe("NavSection", () => {
  it("renders children without label", () => {
    render(
      <NavSection>
        <div data-testid="child">Child Content</div>
      </NavSection>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders label and toggles expansion", () => {
    render(
      <NavSection label="Test Section">
        <div data-testid="child">Child Content</div>
      </NavSection>,
    );

    expect(screen.getByText("Test Section")).toBeInTheDocument();

    const container = screen.getByTestId("child").parentElement?.parentElement;
    expect(container).toHaveStyle({ gridTemplateRows: "1fr" });

    const labelEl = screen.getByText("Test Section").parentElement;
    fireEvent.click(labelEl!);

    expect(container).toHaveStyle({ gridTemplateRows: "0fr" });
  });

  it("forces expansion when collapsed prop is true", () => {
    render(
      <NavSection label="Test Section" collapsed={true}>
        <div data-testid="child">Child Content</div>
      </NavSection>,
    );

    const labelEl = screen.getByText("Test Section").parentElement;
    const container = screen.getByTestId("child").parentElement?.parentElement;

    fireEvent.click(labelEl!);

    expect(container).toHaveStyle({ gridTemplateRows: "1fr" });
  });
});
