import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RequiredIndicator } from "./RequiredIndicator";

describe("RequiredIndicator", () => {
  it("renders asterisk when isRequired is true", () => {
    render(<RequiredIndicator isRequired={true} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders nothing when isRequired is false", () => {
    const { container } = render(<RequiredIndicator isRequired={false} />);
    expect(container.firstChild).toBeNull();
  });
});
