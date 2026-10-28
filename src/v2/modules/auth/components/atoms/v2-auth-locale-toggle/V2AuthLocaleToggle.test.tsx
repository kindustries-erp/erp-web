import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2AuthLocaleToggle } from "./V2AuthLocaleToggle";

const mockSetLocale = vi.fn();
let currentLocale: "vi" | "en" = "vi";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    locale: currentLocale,
    setLocale: mockSetLocale,
    t: (key: string) => key,
  }),
}));

describe("V2AuthLocaleToggle", () => {
  it("renders current locale indicator and toggles when clicked", () => {
    currentLocale = "vi";
    render(<V2AuthLocaleToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("VI");

    fireEvent.click(button);
    expect(mockSetLocale).toHaveBeenCalledWith("en");
  });
});
