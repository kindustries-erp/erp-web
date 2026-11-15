import { describe, expect, it } from "vitest";
import { orderByKeys, placeBranchAfter } from "./procurement.branch";

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

describe("orderByKeys", () => {
  const items = [
    { key: "remarks" },
    { key: "supplierId" },
    { key: "orderDate" },
    { key: "unknown" },
    { key: "branchId" },
  ];

  it("sắp theo danh sách khóa, mục lạ đặt cuối giữ thứ tự gốc", () => {
    expect(
      keys(
        orderByKeys(items, ["orderDate", "supplierId", "branchId", "remarks"]),
      ),
    ).toEqual(["orderDate", "supplierId", "branchId", "remarks", "unknown"]);
  });

  it("giữ nguyên khi danh sách khóa rỗng", () => {
    expect(keys(orderByKeys(items, []))).toEqual(keys(items));
  });
});
