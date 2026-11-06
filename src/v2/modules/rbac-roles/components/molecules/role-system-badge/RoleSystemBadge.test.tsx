import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoleSystemBadge } from "./RoleSystemBadge";

describe("RoleSystemBadge", () => {
  it("shows the system label when isSystem is true", () => {
    render(<RoleSystemBadge isSystem={true} />);
    expect(screen.getByText("Hệ thống")).toBeInTheDocument();
  });

  it("shows the custom label when isSystem is false", () => {
    render(<RoleSystemBadge isSystem={false} />);
    expect(screen.getByText("Tùy biến")).toBeInTheDocument();
  });

  it("defaults to custom when isSystem is undefined", () => {
    render(<RoleSystemBadge />);
    expect(screen.getByText("Tùy biến")).toBeInTheDocument();
  });

  it("accepts and applies custom className", () => {
    const { container } = render(
      <RoleSystemBadge isSystem={false} className="test-custom-class" />,
    );
    expect(container.querySelector(".test-custom-class")).toBeInTheDocument();
  });
});
