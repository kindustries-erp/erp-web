import React, { useState, useEffect } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { money } from "@/shared/utils/format";
import { VoucherNetoffSelectionModal } from "./VoucherNetoffSelectionModal";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { Combobox } from "@/shared/components/Combobox";

import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface LinkedDocument {
  id: string;
  type: "PO" | "BANK";
  refId: string;
  refNo: string;
  date?: string;
  amount?: number;
  status?: string;
  isNew?: boolean;
}

interface Props {
  form: CreateErpInvoicePayload;
  fieldSet: (key: string, value: unknown) => void;
  invoiceId: string;
  invoiceNo: string;
  direction: "IN" | "OUT";
  voucherNetOffs?: any[];
  relatedPos?: any[];
  editMode: boolean;
  onRefresh: () => void;
}

const EMPTY_ARRAY: any[] = [];

export function ErpInvoiceLinkedDocuments({
  form,
  fieldSet,
  direction,
  voucherNetOffs = EMPTY_ARRAY,
  relatedPos = EMPTY_ARRAY,
  editMode,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving] = useState(false);
  const [rows, setRows] = useState<LinkedDocument[]>([]);
  const [poOptions, setPoOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Sync rows from props and pending changes
  useEffect(() => {
    const combined: LinkedDocument[] = [];
    const pending = form.pendingDocumentChanges || [];

    // Filter out removed ones
    const removedBankIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "BANK")
      .map((p) => p.refId);
    const removedPoIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "PO")
      .map((p) => p.refId);

    relatedPos.forEach((po) => {
      if (removedPoIds.includes(po.id)) return;
      combined.push({
        id: po.id,
        type: "PO",
        refId: po.id,
        refNo: po.poNo,
        date: po.orderDate,
        status: po.status,
      });
    });

    voucherNetOffs.forEach((v) => {
      if (removedBankIds.includes(v.bankTransactionId)) return;
      combined.push({
        id: v.id, // the link id
        type: "BANK",
        refId: v.bankTransactionId,
        refNo: v.bankTransaction?.description || "Giao dịch ngân hàng",
        date: v.bankTransaction?.transDate,
        amount: v.netOffAmount,
      });
    });

    // Add pending adds
    pending
      .filter((p) => p.action === "ADD")
      .forEach((p) => {
        if (p.type === "PO") {
          const po = poOptions.find((o) => o.value === p.refId);
          combined.push({
            id: p.refId,
            type: "PO",
            refId: p.refId,
            refNo: po?.label || "PO đang chờ lưu",
            isNew: false, // Treat as existing row visually so it has remove button
          });
        } else if (p.type === "BANK") {
          combined.push({
            id: p.refId,
            type: "BANK",
            refId: p.refId,
            refNo: "Giao dịch đang chờ lưu",
            amount: p.amount,
            isNew: false,
          });
        }
      });

    // Keep any UI-only empty rows only if in edit mode
    const uiRows = editMode ? rows.filter((r) => r.isNew) : [];
    setRows([...combined, ...uiRows]);
  }, [
    relatedPos,
    voucherNetOffs,
    form.pendingDocumentChanges,
    poOptions,
    editMode,
  ]);

  // Fetch recent POs for dropdown
  useEffect(() => {
    if (editMode && direction === "IN") {
      purchaseOrdersCoreApi.list({ page: 1, pageSize: 50 }).then((res) => {
        setPoOptions(res.items.map((po) => ({ value: po.id, label: po.poNo })));
      });
    }
  }, [editMode, direction]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: createClientId(),
        type: direction === "IN" ? "PO" : "BANK",
        refId: "",
        refNo: "",
        isNew: true,
      },
    ]);
  };

  const updateRowType = (rowId: string, type: "PO" | "BANK") => {
    setRows(
      rows.map((r) =>
        r.id === rowId ? { ...r, type, refId: "", refNo: "" } : r,
      ),
    );
  };

  const addPendingChange = (change: {
    action: "ADD" | "REMOVE";
    type: "PO" | "BANK";
    refId: string;
    amount?: number;
  }) => {
    const current = form.pendingDocumentChanges || [];
    fieldSet("pendingDocumentChanges", [...current, change]);
  };

  const handleRemoveRow = async (row: LinkedDocument) => {
    if (row.isNew) {
      setRows(rows.filter((r) => r.id !== row.id));
      return;
    }

    addPendingChange({ action: "REMOVE", type: row.type, refId: row.refId });
  };

  const handleSelectBank = (selected: { id: string; amount: number }[]) => {
    if (selected.length === 0) return;

    selected.forEach((s) => {
      addPendingChange({
        action: "ADD",
        type: "BANK",
        refId: s.id,
        amount: s.amount,
      });
    });

    // Remove any pending new bank rows
    setRows(rows.filter((r) => !(r.isNew && r.type === "BANK")));
  };

  const handleSelectPO = async (rowId: string, poId: string) => {
    addPendingChange({ action: "ADD", type: "PO", refId: poId });
    setRows(rows.filter((r) => r.id !== rowId)); // Remove temp row
  };

  const openDocument = (type: "PO" | "BANK", id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: {
        type: type === "PO" ? "purchase_order" : "bank_transaction",
        id,
      },
    });
    window.dispatchEvent(event);
  };

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
                disabled={saving}
                className="gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
                Thêm chứng từ
              </Button>
            </div>
          )}

          {rows.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
              Chưa có chứng từ liên kết nào.
            </div>
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
                              ...(direction === "IN"
                                ? [{ value: "PO", label: "Đơn mua hàng (PO)" }]
                                : []),
                              { value: "BANK", label: "Giao dịch ngân hàng" },
                            ]}
                            value={row.type}
                            onChange={(val) =>
                              updateRowType(row.id, val as "PO" | "BANK")
                            }
                            allowClear={false}
                          />
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {row.type === "PO"
                              ? "Đơn mua hàng (PO)"
                              : "Giao dịch ngân hàng"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.isNew ? (
                          row.type === "PO" ? (
                            <Combobox
                              options={poOptions}
                              value={row.refId}
                              onChange={(val) => handleSelectPO(row.id, val)}
                              placeholder="-- Chọn PO --"
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalOpen(true)}
                              className="w-full justify-start text-muted-foreground"
                            >
                              Nhấn để chọn giao dịch...
                            </Button>
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
                            {row.amount !== undefined ? (
                              <span className="font-medium text-emerald-600">
                                {money(row.amount)}
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
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            onClick={() => handleRemoveRow(row)}
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DrawerSection>

      <VoucherNetoffSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectBank}
        existingVoucherIds={voucherNetOffs.map((v) => v.bankTransactionId)}
      />
    </div>
  );
}
