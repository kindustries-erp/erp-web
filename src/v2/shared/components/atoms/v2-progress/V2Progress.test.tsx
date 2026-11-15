import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { V2Progress } from "./V2Progress";
import type { V2ProgressTone } from "./V2Progress.type";

const indicatorOf = (container: HTMLElement) =>
  container.querySelector("[data-state]")!.firstElementChild as HTMLElement;

describe("V2Progress", () => {
  const cases: Array<[V2ProgressTone, string]> = [
    ["primary", "bg-primary"],
    ["emerald", "bg-up-fg"],
    ["amber", "bg-warn-fg"],
    ["rose", "bg-destructive"],
    ["neutral", "bg-muted-foreground"],
  ];

  it.each(cases)("tone %s dùng class token %s", (tone, token) => {
    const { container } = render(<V2Progress value={50} tone={tone} />);
    expect(indicatorOf(container).className).toContain(token);
  });

  it("không dùng màu raw cố định cho tone có token", () => {
    const { container } = render(<V2Progress value={50} tone="emerald" />);
    expect(indicatorOf(container).className).not.toMatch(
      /emerald-500|amber-500|rose-500/,
    );
  });

  it("chưa biết tiến độ (value undefined) thì nhấp nháy", () => {
    const { container } = render(<V2Progress />);
    expect(indicatorOf(container).className).toContain("animate-pulse");
  });
});
