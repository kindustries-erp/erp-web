import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import { ActionDropdown, type ActionItem } from "../ActionDropdown";

/**
 * Property 3: ActionDropdown renders only non-hidden items in provided order
 *
 * For any array of ActionItem objects passed to ActionDropdown, the rendered
 * menu items shall include exactly those items where hidden is not true, and
 * they shall appear in the same relative order as in the input array.
 *
 * **Validates: Requirements 6.5, 2.3**
 */
describe("ActionDropdown - Property 3: renders only non-hidden items in order", () => {
  // Generate labels that won't have whitespace normalization issues
  const labelArb = fc
    .stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,14}$/)
    .filter((s) => s.length > 0);

  const actionItemArb = (idx: number) =>
    fc.record({
      label: labelArb.map((s) => `${s}_${idx}`),
      onClick: fc.constant(() => {}),
      icon: fc.constant(undefined),
      variant: fc.oneof(
        fc.constant("default" as const),
        fc.constant("danger" as const),
        fc.constant(undefined),
      ),
      hidden: fc.oneof(
        fc.constant(true),
        fc.constant(false),
        fc.constant(undefined),
      ),
    });

  // Generate arrays of 0-10 items with unique labels (index appended)
  const actionItemsArb = fc
    .integer({ min: 0, max: 10 })
    .chain((len) =>
      len === 0
        ? fc.constant([] as ActionItem[])
        : fc
            .tuple(...Array.from({ length: len }, (_, i) => actionItemArb(i)))
            .map((items) => items as ActionItem[]),
    );

  it("renders exactly the non-hidden items in the same order as input", () => {
    fc.assert(
      fc.property(actionItemsArb, (items) => {
        const expectedVisible = items.filter((item) => item.hidden !== true);

        const { container, unmount } = render(<ActionDropdown items={items} />);

        if (expectedVisible.length === 0) {
          // No trigger should be rendered
          const trigger = container.querySelector("button");
          expect(trigger).toBeNull();
        } else {
          // Click the trigger to open the dropdown
          const trigger = container.querySelector("button");
          expect(trigger).not.toBeNull();

          // Radix uses pointer events to open the menu
          fireEvent.pointerDown(trigger!, { button: 0, pointerType: "mouse" });

          // Radix renders menu items in a portal, query from document body
          const menuItems = screen.getAllByRole("menuitem");

          // Assert count matches
          expect(menuItems).toHaveLength(expectedVisible.length);

          // Assert order matches - compare text content directly
          const renderedLabels = menuItems.map((el) => el.textContent);
          const expectedLabels = expectedVisible.map((item) => item.label);

          expect(renderedLabels).toEqual(expectedLabels);
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
