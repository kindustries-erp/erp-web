import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/shared/components/ui/Button";

describe("Button component", () => {
  // ═══════════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════════
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("renders as a button element by default", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Link button" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });

  // ═══════════════════════════════════════════════════════════════════
  // VARIANTS
  // ═══════════════════════════════════════════════════════════════════
  it("applies primary variant classes by default", () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-primary");
    expect(btn.className).toContain("text-primary-fg");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-surface");
    expect(btn.className).toContain("text-foreground");
    expect(btn.className).toContain("border-border");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("text-primary");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("border-none");
  });

  it("applies danger variant classes", () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-red-500");
    expect(btn.className).toContain("text-white");
  });

  it("applies danger-outline variant classes", () => {
    render(<Button variant="danger-outline">Remove</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("text-red-600");
    expect(btn.className).toContain("border-red-200");
  });

  it("applies link variant classes", () => {
    render(<Button variant="link">Link</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("underline");
  });

  // ═══════════════════════════════════════════════════════════════════
  // SIZES
  // ═══════════════════════════════════════════════════════════════════
  it("applies sm size by default", () => {
    render(<Button>Small</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("rounded-lg");
    expect(btn.className).toContain("text-xs");
  });

  it("applies md size", () => {
    render(<Button size="md">Medium</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("rounded-xl");
    expect(btn.className).toContain("px-4");
  });

  it("applies lg size (full width)", () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("w-full");
    expect(btn.className).toContain("text-sm");
  });

  it("applies icon size", () => {
    render(<Button size="icon">🔔</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("w-8");
    expect(btn.className).toContain("h-8");
  });

  it("applies icon-sm size", () => {
    render(<Button size="icon-sm">×</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("p-1.5");
    expect(btn.className).toContain("rounded-md");
  });

  // ═══════════════════════════════════════════════════════════════════
  // BEHAVIOR
  // ═══════════════════════════════════════════════════════════════════
  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies disabled styling", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("disabled:opacity-50");
    expect(btn.className).toContain("disabled:cursor-not-allowed");
  });

  it("merges custom className", () => {
    render(<Button className="my-custom-class">Custom</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("my-custom-class");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement>;
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("passes through HTML attributes", () => {
    render(
      <Button type="submit" title="Submit form">
        Submit
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("title", "Submit form");
  });
});
