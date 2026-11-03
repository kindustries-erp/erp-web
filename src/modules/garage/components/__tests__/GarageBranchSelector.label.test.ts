import { describe, it, expect } from "vitest";
import { formatGarageBranchLabel } from "../GarageBranchSelector";

describe("formatGarageBranchLabel", () => {
  it("keeps the plain label for MAIN branches", () => {
    expect(
      formatGarageBranchLabel({
        name: "GREENWAY AUTO",
        code: "GR",
        accountKey: "MAIN",
      }),
    ).toBe("GREENWAY AUTO (GR)");
  });

  it("appends the account key for OJ branches", () => {
    expect(
      formatGarageBranchLabel({
        name: "Chi nhánh 2",
        code: "CN2",
        accountKey: "OJ",
      }),
    ).toBe("Chi nhánh 2 (CN2) · OJ");
  });

  it("treats a missing account key as MAIN", () => {
    expect(formatGarageBranchLabel({ name: "Root", code: "Root" })).toBe(
      "Root (Root)",
    );
  });
});
