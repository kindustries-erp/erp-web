import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseClassificationBadge } from "../components/GarageCaseClassificationBadge";

describe("GarageCaseClassificationBadge", () => {
  it("renders unclassified fallback when no category and no classification is given", () => {
    render(<GarageCaseClassificationBadge />);
    expect(screen.getByText("Chưa phân loại")).toBeDefined();
  });

  it("renders category name when category object is provided", () => {
    render(
      <GarageCaseClassificationBadge
        category={{
          id: "cat-1",
          code: "SUA_CHUA_CHUNG",
          name: "Sửa chữa chung",
        }}
      />,
    );
    expect(screen.getByText("Sửa chữa chung")).toBeDefined();
  });

  it("renders classification label when classification string is provided", () => {
    render(<GarageCaseClassificationBadge classification="KY_GUI_NOI_BO" />);
    expect(screen.getByText("Ký gửi / Nội bộ")).toBeDefined();
  });

  it("renders OJ_NGOAI correctly", () => {
    render(<GarageCaseClassificationBadge classification="OJ_NGOAI" />);
    expect(screen.getByText("OJ Ngoài")).toBeDefined();
  });
});
