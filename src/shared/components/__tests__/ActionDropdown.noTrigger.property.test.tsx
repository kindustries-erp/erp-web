import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { ActionDropdown } from "../ActionDropdown";
import type { ActionItem } from "../ActionDropdown";

/**
 * Property 4: ActionDropdown does not render trigger when all items are hidden or array is empty
 *
 * For any array of ActionItem objects where every item has `hidden === true`,
 * or for an empty array, the ActionDropdown component shall render no trigger
 * button element in the DOM.
 *
 * **Validates: Requirements 6.6, 2.6**
 */
describe("ActionDropdown - Property 4: No trigger when all items hidden or empty", () => {
  const actionItemAllHidden: fc.Arbitrary<ActionItem> = fc.record({
    label: fc.string({ minLength: 1, maxLength: 50 }),
    onClick: fc.constant(() => {}),
    icon: fc.constant(undefined),
    variant: fc.oneof(
      fc.constant("default" as const),
      fc.constant("danger" as const),
      fc.constant(undefined),
    ),
    hidden: fc.constant(true as const),
  });

  it("renders no trigger button when all items have hidden: true", () => {
    fc.assert(
      fc.property(
        fc.array(actionItemAllHidden, { minLength: 1, maxLength: 10 }),
        (items) => {
          const { container } = render(<ActionDropdown items={items} />);
          const button = screen.queryByRole("button");
          expect(button).not.toBeInTheDocument();
          // Clean up after each render
          container.remove();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("renders no trigger button when items array is empty", () => {
    fc.assert(
      fc.property(fc.constant([] as ActionItem[]), (items) => {
        const { container } = render(<ActionDropdown items={items} />);
        const button = screen.queryByRole("button");
        expect(button).not.toBeInTheDocument();
        container.remove();
      }),
      { numRuns: 100 },
    );
  });
});
