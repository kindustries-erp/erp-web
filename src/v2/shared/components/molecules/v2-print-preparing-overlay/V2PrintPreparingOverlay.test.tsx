import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2PrintPreparingOverlay } from "./V2PrintPreparingOverlay";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({ t: (key: string) => key }),
}));

describe("V2PrintPreparingOverlay", () => {
  it("hiện trạng thái chờ với nhãn mặc định khi mở", () => {
    render(<V2PrintPreparingOverlay open />);

    expect(screen.getByRole("status")).toHaveTextContent("v2.print.preparing");
  });

  it("dùng nhãn truyền vào khi có", () => {
    render(<V2PrintPreparingOverlay open label="Đang dựng QR" />);

    expect(screen.getByRole("status")).toHaveTextContent("Đang dựng QR");
  });

  it("không render gì khi đóng", () => {
    const { container } = render(<V2PrintPreparingOverlay open={false} />);

    expect(container).toBeEmptyDOMElement();
  });
});
