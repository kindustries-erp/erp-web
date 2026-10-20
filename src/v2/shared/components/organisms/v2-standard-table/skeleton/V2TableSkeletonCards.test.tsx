import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  V2TableSkeletonCards,
  V2_TABLE_SKELETON_CARDS,
} from "./V2TableSkeletonCards";

describe("V2TableSkeletonCards", () => {
  it("renders the default number of card skeletons", () => {
    const { container } = render(
      <V2TableSkeletonCards loadingLabel="Đang tải..." />,
    );
    expect(container.querySelectorAll("li")).toHaveLength(
      V2_TABLE_SKELETON_CARDS,
    );
  });

  it("exposes the loading label once as a status for screen readers", () => {
    render(<V2TableSkeletonCards loadingLabel="Đang tải..." />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải...");
  });
});
