import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2DevQuickFill } from "./V2DevQuickFill";
import * as authConstants from "../../../domain/auth.constants";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string) => key,
  }),
}));

describe("V2DevQuickFill", () => {
  it("renders button when in local environment and triggers callback", () => {
    vi.spyOn(authConstants, "isLocalEnvironment").mockReturnValue(true);
    const handleQuickFill = vi.fn();

    render(<V2DevQuickFill onQuickFill={handleQuickFill} />);

    const button = screen.getByRole("button", { name: "v2.auth.devAdminFill" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleQuickFill).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when not in local environment", () => {
    vi.spyOn(authConstants, "isLocalEnvironment").mockReturnValue(false);
    const { container } = render(<V2DevQuickFill onQuickFill={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
