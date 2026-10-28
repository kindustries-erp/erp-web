import { describe, expect, it } from "vitest";
import { parseEdgeLabel } from "./traceability.edge-label";

describe("parseEdgeLabel", () => {
  it("returns null for an empty label", () => {
    expect(parseEdgeLabel(undefined)).toBeNull();
    expect(parseEdgeLabel("   ")).toBeNull();
  });

  it("splits a receipt label into title and amount with the in tone", () => {
    expect(parseEdgeLabel("Thu trực tiếp: 2.160.000 đ")).toEqual({
      kind: "amount",
      title: "Thu trực tiếp",
      value: "2.160.000 đ",
      tone: "in",
    });
  });

  it("uses the out tone for a payment label", () => {
    expect(parseEdgeLabel("Chi phí: 100")).toMatchObject({
      kind: "amount",
      tone: "out",
    });
  });

  it("keeps extra colons in the value", () => {
    expect(parseEdgeLabel("Ghi chú: a:b")).toMatchObject({
      value: "a:b",
      tone: "neutral",
    });
  });

  it("splits a parenthesised note from the title", () => {
    expect(parseEdgeLabel("Doanh thu dịch vụ (HĐ bán)")).toEqual({
      kind: "note",
      title: "Doanh thu dịch vụ",
      note: "(HĐ bán)",
    });
  });

  it("falls back to plain text", () => {
    expect(parseEdgeLabel("Liên kết")).toEqual({
      kind: "plain",
      text: "Liên kết",
    });
  });
});
