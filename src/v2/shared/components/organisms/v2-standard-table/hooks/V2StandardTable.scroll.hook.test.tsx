import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useV2TableScroll } from "./V2StandardTable.scroll.hook";

const Harness = ({ rows = 10 }: { rows?: number }) => {
  const { scrollRef, isScrolledTop, isScrolledBottom } = useV2TableScroll(
    rows,
    false,
  );
  return (
    <div
      ref={scrollRef}
      data-testid="scroller"
      data-top={isScrolledTop}
      data-bottom={isScrolledBottom}
    />
  );
};

const setMetrics = (
  el: HTMLElement,
  metrics: { scrollTop: number; clientHeight: number; scrollHeight: number },
) =>
  Object.entries(metrics).forEach(([key, value]) =>
    Object.defineProperty(el, key, { value, configurable: true }),
  );

describe("useV2TableScroll", () => {
  it("flags nothing when the content fits", () => {
    render(<Harness />);
    const el = screen.getByTestId("scroller");
    setMetrics(el, { scrollTop: 0, clientHeight: 300, scrollHeight: 300 });
    fireEvent.scroll(el);
    expect(el).toHaveAttribute("data-top", "false");
    expect(el).toHaveAttribute("data-bottom", "false");
  });

  it("flags the bottom shadow at the top of a long table", () => {
    render(<Harness />);
    const el = screen.getByTestId("scroller");
    setMetrics(el, { scrollTop: 0, clientHeight: 300, scrollHeight: 900 });
    fireEvent.scroll(el);
    expect(el).toHaveAttribute("data-top", "false");
    expect(el).toHaveAttribute("data-bottom", "true");
  });

  it("flags both shadows in the middle and only the top at the end", () => {
    render(<Harness />);
    const el = screen.getByTestId("scroller");
    setMetrics(el, { scrollTop: 100, clientHeight: 300, scrollHeight: 900 });
    fireEvent.scroll(el);
    expect(el).toHaveAttribute("data-top", "true");
    expect(el).toHaveAttribute("data-bottom", "true");
    setMetrics(el, { scrollTop: 598, clientHeight: 300, scrollHeight: 900 });
    fireEvent.scroll(el);
    expect(el).toHaveAttribute("data-top", "true");
    expect(el).toHaveAttribute("data-bottom", "false");
  });
});
