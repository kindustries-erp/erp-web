import { useState, useCallback } from "react";
import { useAppStore } from "@/core/config/appStore";
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
import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";
import { getPaymentVouchersPagedApi } from "@/modules/finance/api/financeApi";
import { extractApiError } from "@/shared/utils/apiError";
import { today } from "@/shared/utils/format";
import { usePurchaseOrderList } from "./usePurchaseOrderList";

export function usePurchaseOrderPage() {
  const t = useT();
  const navigate = useAppStore((s) => s.navigate);
  const showToast = useUIStore((s) => s.showToast);

  const listData = usePurchaseOrderList();

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
    rootDocumentType,
    settlementForm,
    setRootContext,
    setActiveStep,
    setSettlementState,
    resetFlow,
    setDetailState,
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

  const openPostingDrawer = useCallback(
    (row: OperationalDocument) => {
      navigate("erp-warehouse");
      const params = new URLSearchParams(window.location.search);
      params.set("purchaseOrderId", row.id);
      params.set("mode", "from-po");
      history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    },
    [navigate],
  );

  const openSettlement = useCallback(
    async (row: OperationalDocument) => {
      setRootContext(row, "purchase_orders");
      setActiveStep("settlement");
      setSettlementState({
        settlementError: null,
        settlementForm: {
          payment_voucher_id: "",
          applied_date: today(),
          applied_amount: Number(row.open_amount || 0),
          notes: "",
        },
        voucherLoading: true,
        paymentLinks: [],
        voucherOptions: [],
      });
      try {
        const [links, vouchers] = await Promise.all([
          operationalApi.listPaymentLinks("purchase_orders", row.id),
          getPaymentVouchersPagedApi({
            page: 1,
            pageSize: 100,
            status: "APPROVED",
            voucher_direction: "OUT",
            counterparty_id:
              typeof row.supplier_id === "string" ? row.supplier_id : undefined,
            sort: ["-document_date"],
          }),
        ]);
        setSettlementState({
          paymentLinks: links,
          voucherOptions: vouchers.items ?? [],
        });
      } catch (err) {
        setSettlementState({
          settlementError: extractApiError(
            err,
            t("Không tải được dữ liệu cấn trừ"),
          ),
          paymentLinks: [],
          voucherOptions: [],
        });
      } finally {
        setSettlementState({ voucherLoading: false });
      }
    },
    [setRootContext, setActiveStep, setSettlementState, t],
  );

  const closeSettlement = useCallback(() => {
    resetFlow();
  }, [resetFlow]);

  const refreshSettlementData = useCallback(async () => {
    if (!rootDocument || !rootDocumentType) return;
    const [document, links] = await Promise.all([
      operationalApi.getDocument(rootDocumentType, rootDocument.id),
      operationalApi.listPaymentLinks(rootDocumentType, rootDocument.id),
    ]);
    setRootContext(document, rootDocumentType);
    setDetailState({ detailDocument: document });
    setSettlementState({ paymentLinks: links });
  }, [
    rootDocument,
    rootDocumentType,
    setRootContext,
    setDetailState,
    setSettlementState,
  ]);

  const saveSettlement = useCallback(async () => {
    if (!rootDocument || !rootDocumentType) return;
    if (!settlementForm.payment_voucher_id) {
      setSettlementState({
        settlementError: t("Vui lòng chọn phiếu dòng tiền."),
      });
      return;
    }
    if (settlementForm.applied_amount <= 0) {
      setSettlementState({
        settlementError: t("Số tiền cấn trừ phải lớn hơn 0."),
      });
      return;
    }
    setSettlementState({ settlementLoading: true, settlementError: null });
    try {
      await operationalApi.createPaymentLink({
        document_type: rootDocumentType,
        document_id: rootDocument.id,
        payment_voucher_id: settlementForm.payment_voucher_id,
        applied_amount: settlementForm.applied_amount,
        applied_date: settlementForm.applied_date,
        notes: settlementForm.notes || undefined,
      });
      await refreshSettlementData();
      await listData.listQuery.refetch();
      showToast({
        title: t("Đã liên kết phiếu dòng tiền"),
        variant: "success",
      });
      setSettlementState({
        settlementForm: {
          ...settlementForm,
          payment_voucher_id: "",
          notes: "",
        },
      });
    } catch (err) {
      setSettlementState({
        settlementError: extractApiError(
          err,
          t("Liên kết thanh toán thất bại"),
        ),
      });
    } finally {
      setSettlementState({ settlementLoading: false });
    }
  }, [
    rootDocument,
    rootDocumentType,
    settlementForm,
    refreshSettlementData,
    listData.listQuery,
    showToast,
    setSettlementState,
    t,
  ]);

  const removePaymentLink = useCallback(
    async (linkId: string) => {
      if (!rootDocument || !rootDocumentType) return;
      setSettlementState({ settlementLoading: true, settlementError: null });
      try {
        await operationalApi.deletePaymentLink(
          rootDocumentType,
          rootDocument.id,
          linkId,
        );
        await refreshSettlementData();
        await listData.listQuery.refetch();
        showToast({
          title: t("Đã gỡ liên kết thanh toán"),
          variant: "success",
        });
      } catch (err) {
        setSettlementState({
          settlementError: extractApiError(
            err,
            t("Không gỡ được liên kết thanh toán"),
          ),
        });
      } finally {
        setSettlementState({ settlementLoading: false });
      }
    },
    [
      rootDocument,
      rootDocumentType,
      refreshSettlementData,
      listData.listQuery,
      showToast,
      setSettlementState,
      t,
    ],
  );

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

  return {
    listData,
    formOpen,
    formLoading,
    viewOnly,
    editingRow,
    poReceipts,
    pageError,
    openDetail,
    openPostingDrawer,
    openSettlement,
    closeSettlement,
    saveSettlement,
    removePaymentLink,
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
  };
}
