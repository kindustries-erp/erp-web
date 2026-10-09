import { describe, expect, it } from "vitest";
import { validateFiles } from "./V2FileUpload.helper";

const file = (name: string, size = 10, type = "") =>
  new File([new Uint8Array(size)], name, { type });

describe("validateFiles", () => {
  it("accepts everything without rules", () => {
    const files = [file("a.xml"), file("b.pdf")];
    expect(validateFiles(files, {}).accepted).toEqual(files);
  });

  it("matches by extension, case-insensitively", () => {
    const result = validateFiles([file("A.XML"), file("b.txt")], {
      accept: [".xml"],
    });
    expect(result.accepted.map((f) => f.name)).toEqual(["A.XML"]);
    expect(result.rejected).toEqual([
      { file: expect.any(File), reason: "type" },
    ]);
  });

  it("matches by mime type and wildcard", () => {
    const pdf = file("a.pdf", 10, "application/pdf");
    const png = file("a.png", 10, "image/png");
    const result = validateFiles([pdf, png], {
      accept: ["application/pdf", "image/*"],
    });
    expect(result.accepted).toHaveLength(2);
  });

  it("rejects files over the size limit", () => {
    const result = validateFiles([file("a.xml", 5), file("b.xml", 50)], {
      maxSizeBytes: 10,
    });
    expect(result.accepted.map((f) => f.name)).toEqual(["a.xml"]);
    expect(result.rejected[0]?.reason).toBe("size");
  });

  it("rejects files beyond the count limit", () => {
    const result = validateFiles(
      [file("1.xml"), file("2.xml"), file("3.xml")],
      { maxFiles: 2 },
    );
    expect(result.accepted).toHaveLength(2);
    expect(result.rejected[0]).toMatchObject({ reason: "count" });
  });
});
