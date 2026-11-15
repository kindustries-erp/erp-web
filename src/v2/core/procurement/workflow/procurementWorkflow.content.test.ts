import { describe, expect, it } from "vitest";
import {
  PROCUREMENT_WORKFLOW_EN,
  PROCUREMENT_WORKFLOW_VI,
} from "./procurementWorkflow.text.data";

/** Sơ đồ phải phản ánh flow mới: lưu + hành động một bước, Nhập kho, Hoàn nhập khi hàng chưa dùng. */
describe("nội dung sơ đồ quy trình mua hàng", () => {
  it("bản VI nêu Tạo mới (gửi duyệt), Nhập kho, Hoàn nhập và assertGoodsUnused", () => {
    expect(PROCUREMENT_WORKFLOW_VI["endUser.edges.ee1"]).toBe(
      "Tạo mới (gửi duyệt)",
    );
    expect(PROCUREMENT_WORKFLOW_VI["endUser.edges.ee7"]).toBe("Nhập kho");
    expect(PROCUREMENT_WORKFLOW_VI["endUser.edges.ee8"]).toBe("Hoàn nhập");
    expect(PROCUREMENT_WORKFLOW_VI["endUser.nodes.n9.badge1"]).toContain(
      "chưa xuất",
    );
    expect(PROCUREMENT_WORKFLOW_VI["dev.nodes.f2.badge2"]).toContain(
      "assertGoodsUnused",
    );
    expect(PROCUREMENT_WORKFLOW_VI["dev.description"]).toContain(
      "saveAndConfirm",
    );
  });

  it("bản EN có đủ các khóa mới như bản VI", () => {
    for (const key of [
      "endUser.edges.ee1",
      "endUser.edges.ee7",
      "endUser.edges.ee8",
      "endUser.nodes.n9.badge1",
      "dev.nodes.f1.badge3",
      "dev.nodes.f2.badge3",
      "dev.nodes.f2.badge2",
    ]) {
      expect(PROCUREMENT_WORKFLOW_EN[key], key).toBeTruthy();
      expect(PROCUREMENT_WORKFLOW_VI[key], key).toBeTruthy();
    }
  });
});
