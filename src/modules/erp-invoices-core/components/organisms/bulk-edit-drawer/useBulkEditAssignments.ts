import { useCallback, useEffect, useRef, useState } from "react";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

type Assignments = Record<string, string>;

interface UseBulkEditAssignmentsArgs {
  open: boolean;
  selectedIds: string[];
  availableInvoices: ErpInvoice[];
}

/**
 * Giá trị theo từng hóa đơn (phân loại, chi nhánh, ghi chú) và snapshot gốc để
 * phát hiện thay đổi.
 *
 * Seed mỗi HĐ đúng một lần cho mỗi lần mở drawer. Effect chỉ gọi setState khi có
 * HĐ mới chưa seed, nên chỉnh sửa của người dùng không bị ghi đè khi danh sách
 * HĐ đổi identity (mảng mới mỗi render) hoặc khi HĐ thiếu được tải về sau.
 */
/** Chi nhánh được gán cho từng hóa đơn (mảng rỗng = không gán) */
export type BranchAssignments = Record<string, string[]>;

export function useBulkEditAssignments({
  open,
  selectedIds,
  availableInvoices,
}: UseBulkEditAssignmentsArgs) {
  const [branchAssignments, setBranchAssignments] = useState<BranchAssignments>(
    {},
  );
  const [categoryAssignments, setCategoryAssignments] = useState<Assignments>(
    {},
  );
  const [notesAssignments, setNotesAssignments] = useState<Assignments>({});
  const [initBranch, setInitBranch] = useState<BranchAssignments>({});
  const [initCategory, setInitCategory] = useState<Assignments>({});
  const [initNotes, setInitNotes] = useState<Assignments>({});

  const seededRef = useRef<Set<string>>(new Set());
  const availableRef = useRef(availableInvoices);
  availableRef.current = availableInvoices;

  // Khóa chuỗi: so sánh theo nội dung, không theo identity của mảng.
  const selectedKey = selectedIds.join("|");
  const availableKey = availableInvoices.map((inv) => inv.id).join("|");

  useEffect(() => {
    if (!open) {
      seededRef.current = new Set();
      return;
    }
    const ids = selectedKey ? selectedKey.split("|") : [];
    const fresh = availableRef.current.filter(
      (inv) => ids.includes(inv.id) && !seededRef.current.has(inv.id),
    );
    if (fresh.length === 0) return;

    const nextBranch: BranchAssignments = {};
    const nextCategory: Assignments = {};
    const nextNotes: Assignments = {};
    fresh.forEach((inv) => {
      seededRef.current.add(inv.id);
      nextBranch[inv.id] = inv.branchIds?.length
        ? inv.branchIds
        : inv.branchId
          ? [inv.branchId]
          : [];
      nextCategory[inv.id] = inv.categoryId ?? inv.category?.id ?? "";
      nextNotes[inv.id] = inv.notes ?? "";
    });

    setBranchAssignments((prev) => ({ ...prev, ...nextBranch }));
    setCategoryAssignments((prev) => ({ ...prev, ...nextCategory }));
    setNotesAssignments((prev) => ({ ...prev, ...nextNotes }));
    setInitBranch((prev) => ({ ...prev, ...nextBranch }));
    setInitCategory((prev) => ({ ...prev, ...nextCategory }));
    setInitNotes((prev) => ({ ...prev, ...nextNotes }));
  }, [open, selectedKey, availableKey]);

  const handleBranchChange = useCallback((id: string, value: string[]) => {
    setBranchAssignments((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleCategoryChange = useCallback((id: string, value: string) => {
    setCategoryAssignments((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleNotesChange = useCallback((id: string, value: string) => {
    setNotesAssignments((prev) => ({ ...prev, [id]: value }));
  }, []);

  return {
    branchAssignments,
    categoryAssignments,
    notesAssignments,
    initBranch,
    initCategory,
    initNotes,
    setBranchAssignments,
    setCategoryAssignments,
    setNotesAssignments,
    handleBranchChange,
    handleCategoryChange,
    handleNotesChange,
  };
}
