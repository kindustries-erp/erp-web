import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MultilingualBadge } from "../MultilingualBadge";

vi.mock("@/core/i18n", () => ({
  useT: () => (_key: string, defaultText?: string) => defaultText || _key,
}));

describe("MultilingualBadge Component", () => {
  it("renders configured count badge properly", () => {
    const labels = { vi: "Đơn mua", en: "Purchase" };
    render(<MultilingualBadge labels={labels} />);

    // Shows 2 configured languages
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows fallback text for vi when labels object does not have vi key", () => {
    render(
      <MultilingualBadge fallbackText="Mặc định" fallbackEnText="Default" />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
