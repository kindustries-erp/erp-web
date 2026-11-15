import { describe, expect, it } from "vitest";
import { isProcurementCreator } from "./procurement.creator";

describe("isProcurementCreator", () => {
  it("khớp theo id người tạo", () => {
    expect(
      isProcurementCreator({ createdBy: "u1" }, "u1", "other@liouni.com"),
    ).toBe(true);
  });

  it("khớp theo email, không phân biệt hoa thường", () => {
    expect(
      isProcurementCreator(
        { createdBy: "u1", createdByEmail: "Lio@Liouni.com" },
        "u2",
        "lio@liouni.com",
      ),
    ).toBe(true);
  });

  it("không khớp id lẫn email thì không phải người tạo", () => {
    expect(
      isProcurementCreator(
        { createdBy: "u1", createdByEmail: "a@liouni.com" },
        "u2",
        "b@liouni.com",
      ),
    ).toBe(false);
  });

  it("không có thông tin người tạo thì không chặn", () => {
    expect(isProcurementCreator({ createdBy: null }, "u2", null)).toBe(true);
    expect(isProcurementCreator({}, null, null)).toBe(true);
  });

  it("có người tạo nhưng thiếu thông tin người dùng hiện tại thì không khớp", () => {
    expect(isProcurementCreator({ createdBy: "u1" }, null, null)).toBe(false);
  });
});
