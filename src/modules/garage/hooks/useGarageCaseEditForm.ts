import { useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";
import type { SettlementSubmissionItem } from "../components/GarageCaseSettlementDrawerModal";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface PendingAddedSettlement extends SettlementSubmissionItem {
  tempId: string;
  isPending: true;
}

export interface PendingAddedInvoice {
  tempId: string;
  isPending: true;
  invoiceId: string;
  linkType: "IN" | "OUT";
  note?: string;
  invoice?: ErpInvoice;
  invoiceNo?: string;
  totalAmount?: number;
  sellerName?: string;
  buyerName?: string;
}

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useGarageCaseEditForm(caseId?: string) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Client-side pending state
  const [pendingAddedSettlements, setPendingAddedSettlements] = useState<
    PendingAddedSettlement[]
  >([]);
  const [pendingDeletedSettlementIds, setPendingDeletedSettlementIds] =
    useState<string[]>([]);

  const [pendingAddedInvoices, setPendingAddedInvoices] = useState<
    PendingAddedInvoice[]
  >([]);
  const [pendingDeletedInvoiceIds, setPendingDeletedInvoiceIds] = useState<
    string[]
  >([]);

  const hasPendingChanges = useMemo(() => {
    return (
      pendingAddedSettlements.length > 0 ||
      pendingDeletedSettlementIds.length > 0 ||
      pendingAddedInvoices.length > 0 ||
      pendingDeletedInvoiceIds.length > 0
    );
  }, [
    pendingAddedSettlements,
    pendingDeletedSettlementIds,
    pendingAddedInvoices,
    pendingDeletedInvoiceIds,
  ]);

  const startEdit = useCallback(() => {
    setEditMode(true);
    setPendingAddedSettlements([]);
    setPendingDeletedSettlementIds([]);
    setPendingAddedInvoices([]);
    setPendingDeletedInvoiceIds([]);
  }, []);

  const cancelEdit = useCallback(() => {
    setPendingAddedSettlements([]);
    setPendingDeletedSettlementIds([]);
    setPendingAddedInvoices([]);
    setPendingDeletedInvoiceIds([]);
    setEditMode(false);
  }, []);

  // Add settlement items (client-side only)
  const addSettlements = useCallback((items: SettlementSubmissionItem[]) => {
    if (!items || items.length === 0) return;
    const newPending: PendingAddedSettlement[] = items.map((item) => ({
      ...item,
      tempId: createClientId(),
      isPending: true,
    }));

    setPendingAddedSettlements((prev) => [...prev, ...newPending]);
    toast.success(
      `Đã thêm ${items.length} giao dịch vào danh sách cấn trừ (chờ Lưu thay đổi).`,
    );
  }, []);

  // Remove settlement item (client-side only)
  const removeSettlement = useCallback((id: string) => {
    // Check if it's a pending added item
    setPendingAddedSettlements((prev) => {
      const found = prev.some((item) => item.tempId === id);
      if (found) {
        toast.success("Đã hủy giao dịch đang chờ lưu.");
        return prev.filter((item) => item.tempId !== id);
      }
      return prev;
    });

    // If it's a persisted item, track in pendingDeletedSettlementIds
    setPendingDeletedSettlementIds((prev) => {
      if (!prev.includes(id)) {
        toast.success("Đã đánh dấu xóa giao dịch (chờ Lưu thay đổi).");
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  // Add linked invoice (client-side only)
  const addLinkedInvoice = useCallback(
    (payload: {
      invoiceId: string;
      linkType: "IN" | "OUT";
      note?: string;
      invoice?: ErpInvoice;
    }) => {
      const totalAmt =
        payload.invoice?.totalAmount != null
          ? Number(payload.invoice.totalAmount)
          : undefined;

      const newPending: PendingAddedInvoice = {
        tempId: createClientId(),
        isPending: true,
        invoiceId: payload.invoiceId,
        linkType: payload.linkType,
        note: payload.note,
        invoice: payload.invoice,
        invoiceNo: payload.invoice?.invoiceNo || undefined,
        totalAmount: isNaN(Number(totalAmt)) ? undefined : totalAmt,
        sellerName: payload.invoice?.sellerName ?? undefined,
        buyerName: payload.invoice?.buyerName ?? undefined,
      };

      setPendingAddedInvoices((prev) => [...prev, newPending]);
      toast.success(
        `Đã thêm HĐ ${payload.invoice?.invoiceNo || payload.invoiceId} vào liên kết (chờ Lưu thay đổi).`,
      );
    },
    [],
  );

  // Remove linked invoice (client-side only)
  const removeLinkedInvoice = useCallback((id: string) => {
    // Check if it's a pending added item
    setPendingAddedInvoices((prev) => {
      const found = prev.some((item) => item.tempId === id);
      if (found) {
        toast.success("Đã hủy hóa đơn đang chờ lưu.");
        return prev.filter((item) => item.tempId !== id);
      }
      return prev;
    });

    // If it's a persisted item, track in pendingDeletedInvoiceIds
    setPendingDeletedInvoiceIds((prev) => {
      if (!prev.includes(id)) {
        toast.success("Đã đánh dấu hủy liên kết hóa đơn (chờ Lưu thay đổi).");
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  // Save all pending changes to backend
  const handleSave = useCallback(
    async (targetCaseId?: string) => {
      const activeCaseId = targetCaseId || caseId;
      if (!activeCaseId) {
        toast.error("Không tìm thấy thông tin vụ việc để lưu.");
        return;
      }

      setSaving(true);
      try {
        // 1. Add pending settlements
        for (const item of pendingAddedSettlements) {
          await garageApi.addCaseSettlement(activeCaseId, {
            bankTransactionId: item.bankTransactionId,
            settlementType: item.settlementType,
            sourceChannel: item.sourceChannel,
            category: item.category,
            amount: item.amount,
            transDate: item.transDate,
            partnerName: item.partnerName,
            note: item.note,
          });
        }

        // 2. Remove pending deleted settlements
        for (const settlementId of pendingDeletedSettlementIds) {
          await garageApi.removeCaseSettlement(activeCaseId, settlementId);
        }

        // 3. Add pending linked invoices
        for (const item of pendingAddedInvoices) {
          await garageApi.addCaseLinkedInvoice(
            activeCaseId,
            item.invoiceId,
            item.linkType,
            item.note,
          );
        }

        // 4. Remove pending deleted linked invoices
        for (const linkedId of pendingDeletedInvoiceIds) {
          await garageApi.removeCaseLinkedInvoice(activeCaseId, linkedId);
        }

        // Invalidate queries
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["garage-case-financial-summary", activeCaseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["garage-case-settlements", activeCaseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["garage-case-linked-invoices", activeCaseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["garage-case-traceability-graph", activeCaseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["garage-cases"],
          }),
        ]);

        toast.success("Đã lưu tất cả thay đổi thành công!");

        // Reset state
        setPendingAddedSettlements([]);
        setPendingDeletedSettlementIds([]);
        setPendingAddedInvoices([]);
        setPendingDeletedInvoiceIds([]);
        setEditMode(false);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Lỗi khi lưu thay đổi vụ việc",
        );
      } finally {
        setSaving(false);
      }
    },
    [
      caseId,
      pendingAddedSettlements,
      pendingDeletedSettlementIds,
      pendingAddedInvoices,
      pendingDeletedInvoiceIds,
      queryClient,
    ],
  );

  // Compute active settlements merging server data + client pending
  const getActiveSettlements = useCallback(
    (serverSettlements: any[] = []) => {
      const persisted = serverSettlements.filter(
        (s) => !pendingDeletedSettlementIds.includes(s.id),
      );

      const added = pendingAddedSettlements.map((item) => ({
        id: item.tempId,
        tempId: item.tempId,
        isPending: true,
        settlement_type: item.settlementType,
        source_channel: item.sourceChannel,
        category: item.category,
        amount: item.amount,
        trans_date: item.transDate,
        partner_name: item.partnerName,
        note: item.note,
        bank_transaction_id: item.bankTransactionId,
        referenceNumber: item.referenceNumber,
        bankName: item.bankName,
        correspondentName: item.correspondentName || item.partnerName,
      }));

      return [...persisted, ...added];
    },
    [pendingDeletedSettlementIds, pendingAddedSettlements],
  );

  // Compute active linked invoices merging server data + client pending
  const getActiveLinkedInvoices = useCallback(
    (serverInvoices: any[] = []) => {
      const persisted = serverInvoices.filter(
        (inv) => !pendingDeletedInvoiceIds.includes(inv.id),
      );

      const added = pendingAddedInvoices.map((item) => ({
        id: item.tempId,
        tempId: item.tempId,
        isPending: true,
        invoiceId: item.invoiceId,
        linkType: item.linkType,
        direction: item.linkType,
        note: item.note,
        invoiceNo: item.invoice?.invoiceNo || item.invoiceNo || "---",
        totalAmount: item.invoice?.totalAmount || item.totalAmount || 0,
        sellerName: item.invoice?.sellerName || item.sellerName,
        buyerName: item.invoice?.buyerName || item.buyerName,
      }));

      return [...persisted, ...added];
    },
    [pendingDeletedInvoiceIds, pendingAddedInvoices],
  );

  // Compute client-adjusted financial summary
  const getActiveFinancialSummary = useCallback(
    (serverSummary: any, activeSettlements: any[]) => {
      if (!serverSummary) return null;

      const targetRevenue = Number(serverSummary.targetRevenue || 0);
      const targetCost = Number(serverSummary.targetCost || 0);

      let totalCollected = 0;
      let totalPaid = 0;

      activeSettlements.forEach((s) => {
        const amt = Number(s.amount || 0);
        if (s.settlement_type === "RECEIPT") {
          totalCollected += amt;
        } else if (s.settlement_type === "PAYMENT") {
          totalPaid += amt;
        }
      });

      const remainingReceivable = Math.max(0, targetRevenue - totalCollected);
      const isOverCollected = totalCollected > targetRevenue;
      const overCollectedAmount = isOverCollected
        ? totalCollected - targetRevenue
        : 0;
      const remainingPayable = Math.max(0, targetCost - totalPaid);
      const realizedCashProfit = totalCollected - totalPaid;

      const kgaraPaid = Number(
        serverSummary.reconciliation?.kgaraPaidAmount || 0,
      );
      const discrepancy = Math.abs(kgaraPaid - totalCollected);
      const hasDiscrepancy = discrepancy > 1000;

      return {
        ...serverSummary,
        breakdown: {
          ...serverSummary.breakdown,
          receipts: {
            ...serverSummary.breakdown?.receipts,
            totalCollected,
            remainingReceivable,
            isOverCollected,
            overCollectedAmount,
          },
          payments: {
            ...serverSummary.breakdown?.payments,
            totalPaid,
            remainingPayable,
          },
          realizedCashProfit,
        },
        reconciliation: {
          ...serverSummary.reconciliation,
          erpCollectedAmount: totalCollected,
          discrepancy,
          hasDiscrepancy,
        },
      };
    },
    [],
  );

  return {
    editMode,
    setEditMode,
    startEdit,
    cancelEdit,
    saving,
    hasPendingChanges,
    pendingAddedSettlements,
    pendingDeletedSettlementIds,
    pendingAddedInvoices,
    pendingDeletedInvoiceIds,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    handleSave,
    getActiveSettlements,
    getActiveLinkedInvoices,
    getActiveFinancialSummary,
  };
}
