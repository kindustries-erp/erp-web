import { describe, expect, it } from "vitest";
import { placeBranchAfter } from "./procurement.branch";

const keys = (items: { key: string }[]) => items.map((i) => i.key);

describe("placeBranchAfter", () => {
  const items = [
    { key: "branchId" },
    { key: "requestDate" },
    { key: "neededDate" },
    { key: "title" },
    { key: "remarks" },
  ];

  it("giữ nguyên thứ tự khi chi nhánh không tùy chọn", () => {
    expect(
      keys(placeBranchAfter(items, ["branchId"], "neededDate", false)),
    ).toEqual(keys(items));
  });

  it("đặt chi nhánh ngay sau ngày cần hàng khi tùy chọn", () => {
    expect(
      keys(placeBranchAfter(items, ["branchId"], "neededDate", true)),
    ).toEqual(["requestDate", "neededDate", "branchId", "title", "remarks"]);
  });
});
