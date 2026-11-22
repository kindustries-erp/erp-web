import { describe, expect, it } from "vitest";
import { isSamePlate, normalizePlate, plateContains } from "./licensePlate";

describe("normalizePlate", () => {
  it.each([
    ["51a-123.45 ", "51A12345"],
    ["51A-123.45", "51A12345"],
    ["30G-258.46", "30G25846"],
    ["29-MĐ1 123.45", "29MD112345"],
    ["29-mđ1/123_45", "29MD112345"],
    ["  51B/756_95  ", "51B75695"],
    ["Ắ-Ế", "AE"],
  ])("%j → %j", (input, expected) => {
    expect(normalizePlate(input)).toBe(expected);
  });

  it.each([[null], [undefined], [""], ["---"], [" . - "]])(
    "%j → chuỗi rỗng",
    (input) => {
      expect(normalizePlate(input)).toBe("");
    },
  );

  it("các cách viết cùng một biển cho cùng kết quả", () => {
    const variants = ["51D88801", "51D-888.01", "51d 888 01", "51D.888-01"];
    expect(new Set(variants.map((v) => normalizePlate(v))).size).toBe(1);
  });
});

describe("isSamePlate", () => {
  it("khớp khi khác dấu câu, hoa thường hoặc khoảng trắng", () => {
    expect(isSamePlate("51A-123.45", "51a 12345")).toBe(true);
    expect(isSamePlate("29-MĐ1 123.45", "29-md1/123.45")).toBe(true);
  });

  it("khác biển thì không khớp", () => {
    expect(isSamePlate("51A-123.45", "51A-123.46")).toBe(false);
  });

  it("hai biển rỗng hoặc chỉ ký tự rác không bao giờ coi là cùng xe", () => {
    expect(isSamePlate("", "")).toBe(false);
    expect(isSamePlate("---", null)).toBe(false);
    expect(isSamePlate(undefined, "51A12345")).toBe(false);
  });
});

describe("plateContains", () => {
  it("tìm một phần biển không phân biệt dấu câu và hoa thường", () => {
    expect(plateContains("51A-123.45", "123.4")).toBe(true);
    expect(plateContains("51A-123.45", "51a 123")).toBe(true);
  });

  it("từ khóa rỗng hoặc chỉ ký tự rác không khớp", () => {
    expect(plateContains("51A-123.45", "")).toBe(false);
    expect(plateContains("51A-123.45", "..-")).toBe(false);
  });

  it("biển không chứa từ khóa thì không khớp", () => {
    expect(plateContains("51A-123.45", "999")).toBe(false);
  });
});
