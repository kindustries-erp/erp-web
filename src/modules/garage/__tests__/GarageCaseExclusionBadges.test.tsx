import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseExclusionBadges } from "../components/GarageCaseExclusionBadges";

describe("GarageCaseExclusionBadges", () => {
  it("renders null when both flags are false or null", () => {
    const { container } = render(
      <GarageCaseExclusionBadges
        excludeFromReports={false}
        excludeFromDebt={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders report exclusion badge when excludeFromReports is true", () => {
    render(
      <GarageCaseExclusionBadges
        excludeFromReports={true}
        excludeFromDebt={false}
        showLabels={true}
      />,
    );
    expect(screen.getByText("Không báo cáo")).toBeDefined();
  });

  it("renders debt exclusion badge when excludeFromDebt is true", () => {
    render(
      <GarageCaseExclusionBadges
        excludeFromReports={false}
        excludeFromDebt={true}
        showLabels={true}
      />,
    );
    expect(screen.getByText("Không công nợ")).toBeDefined();
  });

  it("renders both exclusion badges when both flags are true", () => {
    render(
      <GarageCaseExclusionBadges
        excludeFromReports={true}
        excludeFromDebt={true}
        showLabels={true}
      />,
    );
    expect(screen.getByText("Không báo cáo")).toBeDefined();
    expect(screen.getByText("Không công nợ")).toBeDefined();
  });
});
