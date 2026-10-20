import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2UserBadge } from "./V2UserBadge";

describe("V2UserBadge Molecule", () => {
  it("render đúng tên và chữ cái viết tắt", () => {
    render(<V2UserBadge name="Nguyen Van A" role="Admin" />);
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("NA")).toBeInTheDocument();
  });

  it("ẩn thông tin chữ khi isCompact=true", () => {
    render(<V2UserBadge name="Tran B" isCompact={true} />);
    expect(screen.getByText("TB")).toBeInTheDocument();
    expect(screen.queryByText("Tran B")).not.toBeInTheDocument();
  });
});
