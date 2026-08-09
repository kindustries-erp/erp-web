import React, { useState, useEffect } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { EmptyState } from "@/shared/components/EmptyState";
import { Combobox } from "@/shared/components/Combobox";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface LinkedDocumentRow {
  id: string;
  type: "GR" | "INVOICE";
  refId: string;
  refNo: string;
  date?: string;
  totalQty?: number;
  isNew?: boolean;
}

export interface PendingDocChange {
  action: "ADD" | "REMOVE";
  type: "GR" | "INVOICE";
  refId: string;
}

export interface PurchaseLinkedDocumentsProps {
  receipts: ErpPoReceipt[];
  editMode: boolean;
  pendingDocumentChanges?: PendingDocChange[];
  fieldSet?: (key: string, value: unknown) => void;
}

export function PurchaseLinkedDocuments({
  receipts = [],
  editMode,
  pendingDocumentChanges = [],
  fieldSet,
}: PurchaseLinkedDocumentsProps) {
  const [rows, setRows] = useState<LinkedDocumentRow[]>([]);
  const [grOptions, setGrOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const grDrawer = useGrDrawer();

  // Sync rows from props and pending changes
  useEffect(() => {
    const combined: LinkedDocumentRow[] = [];
    const pending = pendingDocumentChanges || [];

    const removedGrIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "GR")
      .map((p) => p.refId);

    receipts.forEach((r) => {
      if (removedGrIds.includes(r.id)) return;
      const totalQty =
        r.lines?.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0) || 0;
      combined.push({
        id: r.id,
        type: "GR",
        refId: r.id,
        refNo: r.receiptNo || "",
        date: r.createdAt || r.receiptDate,
        totalQty,
      });
    });

    // Add pending adds
    pending
      .filter((p) => p.action === "ADD")
      .forEach((p) => {
        if (p.type === "GR") {
          const opt = grOptions.find((o) => o.value === p.refId);
          combined.push({
            id: p.refId,
            type: "GR",
            refId: p.refId,
            refNo: opt?.label || "GR đang chờ lưu",
            isNew: false, // visually looks like an existing row
          });
        }
      });

    // Keep any UI-only empty rows only if in edit mode
    const uiRows = editMode ? rows.filter((r) => r.isNew) : [];
    setRows([...combined, ...uiRows]);
  }, [receipts, pendingDocumentChanges, grOptions, editMode]); // removed rows to prevent loops on edit mode

  // Fetch GRs for dropdown
  useEffect(() => {
    if (editMode) {
      goodsReceiptsCoreApi
        .list({ page: 1, pageSize: 100 })
        .then((res) => {
          setGrOptions(
            res.items.map((gr) => ({ value: gr.id, label: gr.receiptNo })),
          );
        })
        .catch(console.error);
    }
  }, [editMode]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: createClientId(),
        type: "INVOICE",
        refId: "",
        refNo: "",
        isNew: true,
      },
    ]);
  };

  const updateRowType = (rowId: string, type: "GR" | "INVOICE") => {
    setRows(
      rows.map((r) =>
        r.id === rowId ? { ...r, type, refId: "", refNo: "" } : r,
      ),
    );
  };

  const addPendingChange = (change: PendingDocChange) => {
    if (fieldSet) {
      const current = pendingDocumentChanges || [];
      fieldSet("pendingDocumentChanges", [...current, change]);
    }
  };

  const handleRemoveRow = (row: LinkedDocumentRow) => {
    if (row.isNew) {
      setRows(rows.filter((r) => r.id !== row.id));
      return;
    }
    addPendingChange({ action: "REMOVE", type: row.type, refId: row.refId });
  };

  const handleSelectGR = (rowId: string, grId: string) => {
    addPendingChange({ action: "ADD", type: "GR", refId: grId });
    setRows(rows.filter((r) => r.id !== rowId)); // Remove temp row
  };

  const openDocument = (type: "GR" | "INVOICE", id: string) => {
    if (type === "GR") {
      void grDrawer.openDetail(id, true);
    }
  };

  const totalQtySum = rows
    .filter((r) => !r.isNew)
    .reduce((sum, r) => sum + (r.totalQty || 0), 0);

  return (
    <div className="flex-1 min-w-0 w-full space-y-4">
      <DrawerSection title="CHỨNG TỪ LIÊN KẾT">
        <div className="flex flex-col gap-3">
          {editMode && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
                Thêm chứng từ
              </Button>
            </div>
          )}

          {rows.length === 0 ? (
            <EmptyState size="md" message="Chưa có chứng từ liên kết nào." />
          ) : (
            <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 py-2.5 font-medium text-slate-700 w-1/4">
                      Loại chứng từ
                    </th>
                    <th className="px-3 py-2.5 font-medium text-slate-700 w-1/3">
                      Chứng từ
                    </th>
                    <th className="px-3 py-2.5 font-medium text-slate-700 w-1/4 text-right">
                      Chi tiết
                    </th>
                    <th className="px-3 py-2.5 font-medium text-slate-700 text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 group">
                      <td className="px-3 py-2">
                        {row.isNew ? (
                          <Combobox
                            options={[
                              {
                                value: "INVOICE",
                                label: "Hóa đơn mua (Sắp ra mắt)",
                              },
                            ]}
                            value={row.type}
                            onChange={(val) =>
                              updateRowType(row.id, val as "GR" | "INVOICE")
                            }
                            allowClear={false}
                          />
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {row.type === "GR"
                              ? "Phiếu nhập kho"
                              : "Hóa đơn mua"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.isNew ? (
                          row.type === "GR" ? (
                            <Combobox
                              options={grOptions}
                              value={row.refId}
                              onChange={(val) => handleSelectGR(row.id, val)}
                              placeholder="-- Chọn phiếu nhập --"
                            />
                          ) : null
                        ) : (
                          <span
                            className="text-primary font-medium cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-80 group/link w-fit"
                            onClick={() => openDocument(row.type, row.refId)}
                          >
                            <span className="group-hover/link:underline underline-offset-4 line-clamp-1">
                              {row.refNo}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all flex-shrink-0" />
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {!row.isNew && (
                          <div className="flex flex-col items-end">
                            {row.totalQty !== undefined ? (
                              <span className="font-medium text-emerald-600">
                                {row.totalQty.toLocaleString("vi-VN")} SL
                              </span>
                            ) : null}
                            {row.date ? (
                              <span className="text-xs text-muted-foreground">
                                {row.date.slice(0, 10)}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {editMode && row.type !== "GR" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            onClick={() => handleRemoveRow(row)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length > 0 && totalQtySum > 0 && (
                    <tr className="bg-slate-50/50">
                      <td
                        className="px-3 py-2 font-semibold text-right"
                        colSpan={2}
                      >
                        Tổng cộng:
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-primary">
                        {totalQtySum.toLocaleString("vi-VN")} SL
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DrawerSection>
      <GrFormDrawer drawer={grDrawer} />
    </div>
  );
}
