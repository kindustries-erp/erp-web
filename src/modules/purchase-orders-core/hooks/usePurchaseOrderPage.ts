import { useState, useCallback } from "react";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import {
  operationalApi,
  type OperationalDocument,
} from "@/modules/operational/api/operationalApi";
import {
  purchaseOrdersCoreApi,
  type ErpPoReceipt,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { extractApiError } from "@/shared/utils/apiError";
import { usePurchaseOrderList } from "./usePurchaseOrderList";
import { usePurchaseOrderGraph } from "./usePurchaseOrderGraph";

import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";

export function usePurchaseOrderPage() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  const listData = usePurchaseOrderList();

  // ── Connection Graph ──────────────────────────────────────────────────────
  const graph = usePurchaseOrderGraph();
  const [connectionGraphOpen, setConnectionGraphOpen] = useState(false);
  const [connectionGraphRow, setConnectionGraphRow] =
    useState<OperationalDocument | null>(null);

  const openConnectionGraph = useCallback(
    async (row: OperationalDocument) => {
      setConnectionGraphRow(row);
      setConnectionGraphOpen(true);
      await graph.loadGraph(row);
    },
    [graph],
  );

  const closeConnectionGraph = useCallback(() => {
    setConnectionGraphOpen(false);
    setConnectionGraphRow(null);
    graph.reset();
  }, [graph]);

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingRow, setEditingRow] = useState<OperationalDocument | null>(
    null,
  );
  const [poReceipts, setPoReceipts] = useState<ErpPoReceipt[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    id: string;
    action: "delete" | "cancel";
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const {
    rootDocument,
    setActiveStep,
    setPostingState,
    activeStep,
    postingLineForms,
    resetFlow,
  } = useOperationalFlowStore();

  const openDetail = useCallback(
    async (row: OperationalDocument) => {
      setEditingRow(row);
      setPoReceipts([]);
      setViewOnly(true);
      setFormOpen(true);
      setFormLoading(true);
      setPageError(null);
      try {
        const document = await operationalApi.getDocument(
          "purchase_orders",
          row.id,
        );
        const po = await purchaseOrdersCoreApi.get(row.id);
        setPoReceipts(po.receipts || []);
        setEditingRow(document);
      } catch (err) {
        setPageError(
          extractApiError(err, t("Không tải được chi tiết chứng từ")),
        );
      } finally {
        setFormLoading(false);
      }
    },
    [t],
  );

  /**
   * Set up inventory posting context.
   * Fetches PO detail to build postingLineForms (max_qty = qtyOrdered - qtyReceived),
   * then sets the flow store to activeStep="posting".
   */
  const openInventoryPosting = useCallback(
    async (row: OperationalDocument) => {
      setPageError(null);
      // Set document context immediately so drawer can show the header
      setPostingState({
        postingDocument: row,
        postingDocumentType: "purchase_orders",
        postingLoading: true,
        postingLineForms: [],
        postingNotes: "",
      });
      setActiveStep("posting");
      try {
        const po = await purchaseOrdersCoreApi.get(row.id);
        const lineForms = (po.lines ?? [])
          .filter((line) => line.itemId) // only lines with inventory items
          .map((line) => {
            const ordered = Number(line.qtyOrdered ?? 0);
            const received = Number(line.qtyReceived ?? 0);
            const remaining = Math.max(0, ordered - received);
            return {
              line_id: line.id ?? "",
              line_name:
                line.itemName || line.description || line.itemId || "—",
              requested_qty: remaining,
              max_qty: remaining,
              inventory_item_id: line.itemId ?? null,
            };
          })
          .filter((line) => line.max_qty > 0);
        setPostingState({ postingLineForms: lineForms, postingLoading: false });
      } catch (err) {
        setPostingState({ postingLoading: false });
        setPageError(
          extractApiError(err, t("Không tải được chi tiết đơn mua hàng")),
        );
      }
    },
    [setPostingState, setActiveStep, t],
  );

  /**
   * Submit inventory posting.
   * Calls postPurchaseReceipt then refreshes the list.
   */
  const handleInventoryPostingSubmit = useCallback(async () => {
    if (!rootDocument) return;
    setPostingState({ postingLoading: true });
    try {
      await operationalApi.postPurchaseReceipt(rootDocument.id, {
        receipt_lines: postingLineForms
          .filter((l: any) => l.requested_qty > 0)
          .map((l: any) => ({
            line_id: l.line_id,
            qty: l.requested_qty,
          })),
      });
      showToast({ title: t("Nhập kho thành công"), variant: "success" });
      resetFlow();
      await listData.listQuery.refetch();
    } catch (err) {
      setPostingState({ postingLoading: false });
      setPageError(extractApiError(err, t("Nhập kho thất bại")));
    }
  }, [
    rootDocument,
    postingLineForms,
    setPostingState,
    resetFlow,
    listData.listQuery,
    showToast,
    t,
  ]);

  const handleCreateNew = useCallback(() => {
    setEditingRow(null);
    setViewOnly(false);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
  }, []);

  const handleToggleEdit = useCallback(() => {
    setViewOnly(false);
  }, []);

  const handleFormSaved = useCallback(async () => {
    await listData.listQuery.refetch();
  }, [listData.listQuery]);

  const confirmDeleteDocument = useCallback((id: string) => {
    setConfirmState({ id, action: "delete" });
  }, []);

  const confirmCancelDocument = useCallback((id: string) => {
    setConfirmState({ id, action: "cancel" });
  }, []);

  const closeConfirmModal = useCallback(() => {
    if (!confirmLoading) setConfirmState(null);
  }, [confirmLoading]);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    setPageError(null);
    try {
      if (confirmState.action === "delete") {
        await operationalApi.deletePurchase(confirmState.id);
        showToast({ title: t("Xóa thành công"), variant: "success" });
      } else {
        await operationalApi.updatePurchase(confirmState.id, {
          status: "CANCELLED",
        });
        showToast({ title: t("Hủy thành công"), variant: "success" });
      }
      await listData.listQuery.refetch();
      setConfirmState(null);
    } catch (err) {
      showToast({
        title: extractApiError(
          err,
          confirmState.action === "delete"
            ? t("Xóa thất bại")
            : t("Hủy thất bại"),
        ),
        variant: "destructive",
      });
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmState, listData.listQuery, showToast, t]);

  const closeInventoryPosting = useCallback(() => {
    resetFlow();
  }, [resetFlow]);

  return {
    listData,
    formOpen,
    formLoading,
    viewOnly,
    editingRow,
    poReceipts,
    pageError,
    openDetail,
    openInventoryPosting,
    handleInventoryPostingSubmit,
    closeInventoryPosting,
    inventoryPostingOpen: activeStep === "posting",
    handleCreateNew,
    handleCloseForm,
    handleToggleEdit,
    handleFormSaved,
    confirmDeleteDocument,
    confirmCancelDocument,
    confirmState,
    confirmLoading,
    handleConfirmAction,
    closeConfirmModal,
    // Connection Graph
    connectionGraphOpen,
    connectionGraphRow,
    graphNodes: graph.nodes,
    graphEdges: graph.edges,
    graphLoading: graph.loading,
    graphError: graph.error,
    graphLayout: graph.layout,
    toggleGraphLayout: graph.toggleLayout,
    openConnectionGraph,
    closeConnectionGraph,
  };
}
