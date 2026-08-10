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
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { PurchaseInvoicePickerDrawer } from "@/modules/purchase-orders-core/components/PurchaseInvoicePickerDrawer";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";

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
  purchaseOrderId?: string;
  open?: boolean;
}

export function PurchaseLinkedDocuments({
  receipts,
  editMode,
  pendingDocumentChanges,
  fieldSet,
  purchaseOrderId,
  open,
}: PurchaseLinkedDocumentsProps) {
  const [rows, setRows] = useState<LinkedDocumentRow[]>([]);
  const [linkedInvoices, setLinkedInvoices] = useState<ErpInvoice[]>([]);
  const [invoicePickerOpen, setInvoicePickerOpen] = useState(false);
  const [invoiceDrawerId, setInvoiceDrawerId] = useState<string | null>(null);

  const [grOptions, setGrOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const grDrawer = useGrDrawer();

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

  // Fetch linked invoices
  useEffect(() => {
    if (purchaseOrderId && open !== false) {
      purchaseOrdersCoreApi
        .getLinkedInvoices(purchaseOrderId)
        .then(setLinkedInvoices)
        .catch(console.error);
    } else if (open === false) {
      setLinkedInvoices([]);
    }
  }, [purchaseOrderId, open]);

  // Sync rows from props and pending changes
  useEffect(() => {
    const combined: LinkedDocumentRow[] = [];
    const pending = pendingDocumentChanges || [];

    const removedGrIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "GR")
      .map((p) => p.refId);

    const safeReceipts = receipts || [];
    safeReceipts.forEach((r) => {
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

    const removedInvoiceIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "INVOICE")
      .map((p) => p.refId);

    linkedInvoices.forEach((inv) => {
      if (removedInvoiceIds.includes(inv.id)) return;
      combined.push({
        id: inv.id,
        type: "INVOICE",
        refId: inv.id,
        refNo: inv.invoiceNo || "",
        date: inv.invoiceDate || inv.createdAt,
        totalQty: Number(inv.totalAmount || 0), // Use totalQty field to store amount for INVOICE type
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
            isNew: false,
          });
        } else if (p.type === "INVOICE") {
          combined.push({
            id: p.refId,
            type: "INVOICE",
            refId: p.refId,
            refNo: "HĐ đang chờ lưu",
            isNew: false,
          });
        }
      });

    // Keep any UI-only empty rows only if in edit mode
    const uiRows = editMode
      ? rows.filter((r) => r.isNew && r.type === "GR")
      : [];
    setRows([...combined, ...uiRows]);
  }, [receipts, linkedInvoices, pendingDocumentChanges, grOptions, editMode]); // removed rows to prevent loops on edit mode

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: createClientId(),
        type: "GR",
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
    } else if (type === "INVOICE") {
      setInvoiceDrawerId(id);
    }
  };

  const handleInvoicesSelected = (invoiceIds: string[]) => {
    invoiceIds.forEach((id) => {
      addPendingChange({ action: "ADD", type: "INVOICE", refId: id });
    });
    // Remove the temp INVOICE row
    setRows((prev) => prev.filter((r) => !(r.isNew && r.type === "INVOICE")));
  };

  return (
    <div className="flex-1 min-w-0 w-full space-y-4">
      <DrawerSection
        title="CHỨNG TỪ LIÊN KẾT"
        titleExtra={
          editMode ? (
            <div className="flex items-center gap-2">
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
          ) : undefined
        }
      >
        <div className="flex flex-col gap-3">
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
                                label: "Hóa đơn mua",
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
                          ) : (
                            <div
                              className="border rounded-md px-3 py-1.5 text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-colors w-full flex items-center justify-between bg-white"
                              onClick={() => setInvoicePickerOpen(true)}
                            >
                              <span>Nhấn để chọn hóa đơn...</span>
                            </div>
                          )
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
                                {row.type === "GR"
                                  ? `${row.totalQty.toLocaleString("vi-VN")} SL`
                                  : new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(row.totalQty)}
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
                  {rows.length > 0 && rows.some((r) => r.type === "GR") && (
                    <tr className="bg-slate-50/50">
                      <td
                        className="px-3 py-2 font-semibold text-right"
                        colSpan={2}
                      >
                        Tổng SL nhập:
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-primary">
                        {rows
                          .filter((r) => r.type === "GR" && !r.isNew)
                          .reduce((s, r) => s + (r.totalQty || 0), 0)
                          .toLocaleString("vi-VN")}{" "}
                        SL
                      </td>
                      <td></td>
                    </tr>
                  )}
                  {rows.length > 0 &&
                    rows.some((r) => r.type === "INVOICE") && (
                      <tr className="bg-slate-50/50">
                        <td
                          className="px-3 py-2 font-semibold text-right"
                          colSpan={2}
                        >
                          Tổng tiền hóa đơn:
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-primary">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(
                            rows
                              .filter((r) => r.type === "INVOICE" && !r.isNew)
                              .reduce((s, r) => s + (r.totalQty || 0), 0),
                          )}
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

      <PurchaseInvoicePickerDrawer
        open={invoicePickerOpen}
        onClose={() => setInvoicePickerOpen(false)}
        onConfirm={handleInvoicesSelected}
        purchaseOrderId={purchaseOrderId || ""}
        alreadyLinkedIds={[
          ...linkedInvoices.map((i) => i.id),
          ...(pendingDocumentChanges || [])
            .filter((p) => p.type === "INVOICE" && p.action === "ADD")
            .map((p) => p.refId),
        ]}
      />

      <ErpInvoiceStandaloneDrawer
        isOpen={!!invoiceDrawerId}
        invoiceId={invoiceDrawerId}
        onClose={() => setInvoiceDrawerId(null)}
      />
    </div>
  );
}
