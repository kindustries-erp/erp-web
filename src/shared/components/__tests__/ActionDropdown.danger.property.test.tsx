import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import { ActionDropdown, type ActionItem } from "../ActionDropdown";

/**
 * Property 5: ActionDropdown renders danger-variant items with destructive styling
 *
 * For any ActionItem with variant set to "danger", when rendered in an open
 * ActionDropdown, that item's DOM element shall contain the destructive color
 * class (text-red-500) distinguishing it from default-variant items.
 *
 * **Validates: Requirements 6.7, 2.4**
 */
describe("ActionDropdown danger-variant styling (Property 5)", () => {
  afterEach(() => {
    cleanup();
  });

  // Arbitrary for generating a single ActionItem with a unique label prefix
  const actionItemArb = (
    forceDanger?: boolean,
  ): fc.Arbitrary<Omit<ActionItem, "label">> =>
    fc.record({
      onClick: fc.constant(vi.fn()),
      variant: forceDanger
        ? fc.constant("danger" as const)
        : fc.oneof(fc.constant("default" as const), fc.constant(undefined)),
      hidden: fc.constant(false),
    });

  // Generate arrays with at least one danger item that is visible, with unique labels
  const itemsWithAtLeastOneDangerArb: fc.Arbitrary<ActionItem[]> = fc
    .tuple(
      // At least one danger item (visible)
      fc.array(actionItemArb(true), { minLength: 1, maxLength: 3 }),
      // Additional random items (0-7) that are NOT danger
      fc.array(actionItemArb(false), { minLength: 0, maxLength: 7 }),
    )
    .map(([dangerItems, otherItems]) => {
      // Assign unique labels to each item
      const all = [...dangerItems, ...otherItems];
      return all.map((item, index) => ({
        ...item,
        label: `Item-${index}-${item.variant === "danger" ? "D" : "N"}`,
      }));
    });

  it("danger-variant items have text-red-500 class and non-danger items do not", () => {
    fc.assert(
      fc.property(itemsWithAtLeastOneDangerArb, (items) => {
        cleanup();
        const { unmount } = render(<ActionDropdown items={items} />);

        // Open the dropdown using pointer events (Radix requires pointerDown + click)
        const trigger = screen.getByRole("button");
        fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
        fireEvent.click(trigger);

        const visibleItems = items.filter((item) => item.hidden !== true);

        for (const item of visibleItems) {
          const element = screen.getByText(item.label);
          // The class is on the DropdownMenu.Item which wraps the text
          const menuItem = element.closest("[role='menuitem']") ?? element;

          if (item.variant === "danger") {
            expect(menuItem.className).toContain("text-red-500");
          } else {
            expect(menuItem.className).not.toContain("text-red-500");
          }
        }

        unmount();
      }),
      { numRuns: 20 },
    );
  }, 10000);
});
