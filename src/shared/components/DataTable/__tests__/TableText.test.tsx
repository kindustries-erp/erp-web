import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableText } from "../TableText";

// Mock matchMedia for Radix UI
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("TableText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders text correctly", () => {
    render(<TableText text="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("calls onDrawerClick when drawer icon is clicked", () => {
    const handleDrawerClick = vi.fn();
    const { container } = render(
      <TableText text="Drawer" onDrawerClick={handleDrawerClick} />,
    );
    // Find the button wrapping the drawer icon (first button if no copy)
    const button = container.querySelector("button");
    if (button) fireEvent.click(button);
    expect(handleDrawerClick).toHaveBeenCalledTimes(1);
  });

  it("copies text to clipboard when copy icon is clicked", () => {
    const { container } = render(<TableText text="CopyMe" enableCopy />);
    // The copy button is the only button in this render
    const button = container.querySelector("button");
    if (button) fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("CopyMe");
  });

  it("renders popover trigger when popoverContent is provided", () => {
    const { container } = render(
      <TableText
        text="PopoverText"
        popoverContent={<div>Popover Content</div>}
      />,
    );
    // The popover trigger button
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();

    // Test if Radix popover opens (might require async or specific radix handling)
    if (button) fireEvent.click(button);
    // Popover content is rendered in a portal, so we check document body
    expect(document.body.textContent).toContain("Popover Content");
  });
});
