import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useBulkEditAssignments } from "./useBulkEditAssignments";

const mk = (id: string, notes = "", branchId = "b1"): ErpInvoice =>
  ({
    id,
    invoiceNo: id,
    notes,
    branchId,
    categoryId: "c1",
  }) as unknown as ErpInvoice;

type Props = { open: boolean; ids: string[]; invoices: ErpInvoice[] };

const setup = (initial: Props) =>
  renderHook(
    (p: Props) =>
      useBulkEditAssignments({
        open: p.open,
        selectedIds: p.ids,
        availableInvoices: p.invoices,
      }),
    { initialProps: initial },
  );

describe("useBulkEditAssignments", () => {
  it("seeds per-invoice values and snapshots when opened", () => {
    const { result } = setup({
      open: true,
      ids: ["a", "b"],
      invoices: [mk("a", "n-a"), mk("b", "n-b", "b2")],
    });

    expect(result.current.notesAssignments).toEqual({ a: "n-a", b: "n-b" });
    expect(result.current.branchAssignments).toEqual({ a: ["b1"], b: ["b2"] });
    expect(result.current.initNotes).toEqual({ a: "n-a", b: "n-b" });
  });

  it("keeps user edits when the invoices array identity changes every render", () => {
    const { result, rerender } = setup({
      open: true,
      ids: ["a"],
      invoices: [mk("a", "old")],
    });

    act(() => result.current.handleNotesChange("a", "ghi chú mới"));
    act(() => result.current.handleCategoryChange("a", "c9"));

    // Mảng mới với nội dung giống hệt, như khi query "missing" trả [] mỗi render
    rerender({ open: true, ids: ["a"], invoices: [mk("a", "old")] });
    rerender({ open: true, ids: ["a"], invoices: [mk("a", "old")] });

    expect(result.current.notesAssignments.a).toBe("ghi chú mới");
    expect(result.current.categoryAssignments.a).toBe("c9");
    // Snapshot gốc không bị đổi, nên isDirty vẫn đúng
    expect(result.current.initNotes.a).toBe("old");
  });

  it("adds invoices that arrive later without overwriting edited rows", () => {
    const { result, rerender } = setup({
      open: true,
      ids: ["a", "b"],
      invoices: [mk("a", "n-a")],
    });

    act(() => result.current.handleNotesChange("a", "đã sửa"));
    rerender({
      open: true,
      ids: ["a", "b"],
      invoices: [mk("a", "n-a"), mk("b", "n-b")],
    });

    expect(result.current.notesAssignments).toEqual({ a: "đã sửa", b: "n-b" });
    expect(result.current.initNotes).toEqual({ a: "n-a", b: "n-b" });
  });

  it("re-seeds from the server values when the drawer is reopened", () => {
    const invoices = [mk("a", "n-a")];
    const { result, rerender } = setup({ open: true, ids: ["a"], invoices });

    act(() => result.current.handleNotesChange("a", "chưa lưu"));
    rerender({ open: false, ids: ["a"], invoices });
    rerender({ open: true, ids: ["a"], invoices });

    expect(result.current.notesAssignments.a).toBe("n-a");
  });

  it("applies a per-row change through the setters used by apply-all", () => {
    const { result } = setup({
      open: true,
      ids: ["a", "b"],
      invoices: [mk("a"), mk("b")],
    });

    act(() => {
      result.current.setNotesAssignments({ a: "chung", b: "chung" });
    });

    expect(result.current.notesAssignments).toEqual({ a: "chung", b: "chung" });
    expect(result.current.initNotes).toEqual({ a: "", b: "" });
  });
});
