import { describe, expect, it } from "vitest";

import {
  computeFocus,
  isEdgeDimmed,
  isNodeDimmed,
  type FocusEdge,
} from "./workflowFocus";

const edges: FocusEdge[] = [
  { id: "e1", source: "a", target: "b", flows: ["x"] },
  { id: "e2", source: "b", target: "c", flows: ["x", "y"] },
  { id: "e3", source: "d", target: "b" },
  { id: "e4", source: "e", target: "f", flows: ["y"] },
];

describe("computeFocus", () => {
  it("không chọn gì thì không thẻ hay mũi tên nào mờ, không animation", () => {
    const result = computeFocus(edges, null);

    expect(result.litNodes).toBeNull();
    expect(result.litEdges).toBeNull();
    expect(result.animatedEdges.size).toBe(0);
    expect(isNodeDimmed(result, "a")).toBe(false);
    expect(isEdgeDimmed(result, "e1")).toBe(false);
  });

  it("chọn luồng: chỉ mũi tên thuộc luồng và hai đầu của chúng sáng, mũi tên đó animated", () => {
    const result = computeFocus(edges, { kind: "flow", id: "x" });

    expect([...result.litEdges!].sort()).toEqual(["e1", "e2"]);
    expect([...result.litNodes!].sort()).toEqual(["a", "b", "c"]);
    expect([...result.animatedEdges].sort()).toEqual(["e1", "e2"]);
    expect(isNodeDimmed(result, "e")).toBe(true);
    expect(isEdgeDimmed(result, "e4")).toBe(true);
  });

  it("mũi tên dùng chung sáng ở cả hai luồng", () => {
    expect(
      computeFocus(edges, { kind: "flow", id: "y" }).litEdges!.has("e2"),
    ).toBe(true);
    expect(
      computeFocus(edges, { kind: "flow", id: "x" }).litEdges!.has("e2"),
    ).toBe(true);
  });

  it("chọn thẻ: thẻ đó và các thẻ nối trực tiếp hai chiều sáng, mũi tên chạm thẻ animated", () => {
    const result = computeFocus(edges, { kind: "node", id: "b" });

    expect([...result.litNodes!].sort()).toEqual(["a", "b", "c", "d"]);
    expect([...result.litEdges!].sort()).toEqual(["e1", "e2", "e3"]);
    expect([...result.animatedEdges].sort()).toEqual(["e1", "e2", "e3"]);
    expect(isNodeDimmed(result, "f")).toBe(true);
    expect(isEdgeDimmed(result, "e4")).toBe(true);
  });

  it("chọn thẻ không nối với mũi tên nào thì chỉ thẻ đó sáng, mọi thứ khác mờ", () => {
    const result = computeFocus(edges, { kind: "node", id: "z" });

    expect([...result.litNodes!]).toEqual(["z"]);
    expect(result.litEdges!.size).toBe(0);
    expect(result.animatedEdges.size).toBe(0);
    expect(isNodeDimmed(result, "a")).toBe(true);
  });

  it("chỉ tính các mũi tên được truyền vào (mũi tên đã ẩn không làm sáng thẻ)", () => {
    const visible = edges.filter((edge) => edge.id !== "e3");
    const result = computeFocus(visible, { kind: "node", id: "b" });

    expect(result.litNodes!.has("d")).toBe(false);
  });
});
