import { describe, expect, it } from "vitest";
import { placeBranchField } from "./procurement.branch";

const keys = (items: { key: string }[]) => items.map((i) => i.key);

describe("placeBranchField", () => {
  const items = [
    { key: "branchId" },
    { key: "requestDate" },
    { key: "neededDate" },
    { key: "title" },
    { key: "remarks" },
  ];

  it("giữ nguyên thứ tự khi chi nhánh không tùy chọn (luồng thường)", () => {
    expect(keys(placeBranchField(items, ["branchId"], false))).toEqual(
      keys(items),
    );
  });

  it("đặt chi nhánh ngay trước ghi chú khi tùy chọn", () => {
    expect(keys(placeBranchField(items, ["branchId"], true))).toEqual([
      "requestDate",
      "neededDate",
      "title",
      "branchId",
      "remarks",
    ]);
  });

  it("đặt cuối danh sách nếu không có ghi chú", () => {
    const noRemarks = items.filter((i) => i.key !== "remarks");
    expect(keys(placeBranchField(noRemarks, ["branchId"], true))).toEqual([
      "requestDate",
      "neededDate",
      "title",
      "branchId",
    ]);
  });

  it("nhận nhiều khóa chi nhánh (chế độ xem dùng khóa 'branch')", () => {
    const view = [{ key: "branch" }, { key: "title" }, { key: "remarks" }];
    expect(keys(placeBranchField(view, ["branch"], true))).toEqual([
      "title",
      "branch",
      "remarks",
    ]);
  });
});
