import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { garageApi } from "@/modules/garage/api/garageApi";
import {
  useGarageCaseGrossProfit,
  useSyncGarageCaseDetail,
  useGarageCaseByCode,
} from "@/modules/garage/hooks/useGarage";
import { useGarageCaseEditForm } from "@/modules/garage/hooks/useGarageCaseEditForm";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { SettlementSubmissionItem } from "@/modules/garage/components/GarageCaseSettlementDrawerModal";
import type { DrawerAuditLogItem } from "@/shared/components/StandardFormDrawer";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityEdge,
} from "@/shared/types/traceability";
import { money } from "@/shared/utils/format";
import type { GarageCaseDetailViewMode } from "../../garage-case-details-tab/GarageCaseDetailsTab.type";

export interface UseGarageCaseDrawerLogicOptions {
  isOpen: boolean;
  caseCode?: string | null;
  initialEditMode?: boolean;
  initialTabKey?: string;
  initialSubTabKey?: GarageCaseDetailViewMode;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useGarageCaseDrawerLogic({
  isOpen,
  caseCode,
  initialEditMode = false,
  initialTabKey,
  initialSubTabKey,
  onSuccess,
}: UseGarageCaseDrawerLogicOptions) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();
  const canUpdateGarage = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.UPDATE,
  );

  const [showSettlementModal, setShowSettlementModal] =
    useState<boolean>(false);
  const [settlementModalType, setSettlementModalType] = useState<
    "RECEIPT" | "PAYMENT"
  >("RECEIPT");
  const [editingSettlementItem, setEditingSettlementItem] =
    useState<SettlementSubmissionItem | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const [activeCaseCode, setActiveCaseCode] = useState<
    string | null | undefined
  >(caseCode);

  useEffect(() => {
    setActiveCaseCode(caseCode);
  }, [caseCode]);

  const effectiveCaseCode = activeCaseCode || caseCode;

  const {
    data: selectedCase,
    isLoading: isLoadingCase,
    refetch: refetchCase,
  } = useGarageCaseByCode(
    isOpen && effectiveCaseCode ? effectiveCaseCode : undefined,
  );

  const { mutate: syncCaseDetail, isPending: isSyncingDetail } =
    useSyncGarageCaseDetail();

  const { data: grossProfit } = useGarageCaseGrossProfit(
    effectiveCaseCode || undefined,
  );

  // Client-side Draft States for Category, Exclusions, Attributes & ERP notes
  const [draftCategoryId, setDraftCategoryId] = useState<string | null>(null);
  const [draftClassification, setDraftClassification] = useState<string>("");
  const [draftExcludeFromReports, setDraftExcludeFromReports] =
    useState<boolean>(false);
  const [draftExcludeFromDebt, setDraftExcludeFromDebt] =
    useState<boolean>(false);
  const [draftErpNotes, setDraftErpNotes] = useState<string>("");
  const [draftAttributes, setDraftAttributes] = useState<Record<string, any>>(
    {},
  );
  const [draftGlobalAttributes, setDraftGlobalAttributes] = useState<
    Record<string, any>
  >({});

  useEffect(() => {
    if (selectedCase) {
      setDraftCategoryId(selectedCase.categoryId || null);
      setDraftClassification(selectedCase.classification || "");
      setDraftExcludeFromReports(Boolean(selectedCase.excludeFromReports));
      setDraftExcludeFromDebt(Boolean(selectedCase.excludeFromDebt));
      setDraftErpNotes(selectedCase.erpNotes || "");
      setDraftAttributes(
        selectedCase.attributes || selectedCase.attributeValues || {},
      );
      setDraftGlobalAttributes(selectedCase.globalAttributes || {});
      if (selectedCase.soChungTu && selectedCase.soChungTu !== activeCaseCode) {
        setActiveCaseCode(selectedCase.soChungTu);
      }
    }
  }, [selectedCase, activeCaseCode]);

  // Financial Summary & Settlements Queries
  const { data: serverSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", selectedCase?.id],
    queryFn: () => garageApi.getCaseFinancialSummary(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  const { data: serverSettlements } = useQuery({
    queryKey: ["garage-case-settlements", selectedCase?.id],
    queryFn: () => garageApi.getCaseSettlements(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  const { data: serverLinkedInvoices } = useQuery({
    queryKey: ["garage-case-linked-invoices", selectedCase?.id],
    queryFn: () => garageApi.getCaseLinkedInvoices(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  const { data: serverGraph } = useQuery({
    queryKey: ["garage-case-traceability-graph", selectedCase?.id],
    queryFn: () => garageApi.getCaseTraceabilityGraph(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // Client-side edit state and batch save hook
  const {
    editMode,
    startEdit,
    cancelEdit,
    saving,
    hasPendingChanges,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    handleSave,
    getActiveSettlements,
    getActiveLinkedInvoices,
    getActiveFinancialSummary,
  } = useGarageCaseEditForm(selectedCase?.id);

  const guardedStartEdit = useCallback(() => {
    if (!canUpdateGarage) {
      toast.error(
        t(
          "cases.errors.noPermissionEditGarage",
          "Bạn không có quyền chỉnh sửa vụ việc này",
        ),
      );
      return;
    }
    startEdit();
  }, [canUpdateGarage, startEdit, t]);

  const [activeTabKey, setActiveTabKey] = useState<string>(
    initialTabKey === "partner_details"
      ? "quote_details"
      : initialTabKey || "quote_details",
  );

  const [detailsSubTab, setDetailsSubTab] = useState<GarageCaseDetailViewMode>(
    initialTabKey === "partner_details"
      ? "partner"
      : initialSubTabKey || "details",
  );

  useEffect(() => {
    if (isOpen) {
      if (initialTabKey === "partner_details") {
        setActiveTabKey("quote_details");
        setDetailsSubTab("partner");
      } else {
        if (initialTabKey) {
          setActiveTabKey(initialTabKey);
        } else {
          setActiveTabKey("quote_details");
        }
        setDetailsSubTab(initialSubTabKey || "details");
      }
      if (initialEditMode && canUpdateGarage) {
        startEdit();
      } else {
        cancelEdit();
      }
      setShowSettlementModal(false);
      setEditingSettlementItem(null);
      setShowInvoiceModal(false);
    }
  }, [
    isOpen,
    caseCode,
    initialEditMode,
    initialTabKey,
    initialSubTabKey,
    cancelEdit,
    startEdit,
    canUpdateGarage,
  ]);

  const isConfigDirty = useMemo(() => {
    if (!selectedCase) return false;
    const origCategoryId = selectedCase.categoryId || null;
    const origClassification = selectedCase.classification || "";
    const origExcludeFromReports = Boolean(selectedCase.excludeFromReports);
    const origExcludeFromDebt = Boolean(selectedCase.excludeFromDebt);
    const origErpNotes = selectedCase.erpNotes || "";

    const categoryChanged = (draftCategoryId || null) !== origCategoryId;
    const classificationChanged =
      (draftClassification || "") !== origClassification;
    const excludeReportsChanged =
      draftExcludeFromReports !== origExcludeFromReports;
    const excludeDebtChanged = draftExcludeFromDebt !== origExcludeFromDebt;
    const notesChanged = (draftErpNotes || "") !== origErpNotes;

    const origAttrs = JSON.stringify(
      selectedCase.attributes || selectedCase.attributeValues || {},
    );
    const currAttrs = JSON.stringify(draftAttributes || {});
    const origGAttrs = JSON.stringify(selectedCase.globalAttributes || {});
    const currGAttrs = JSON.stringify(draftGlobalAttributes || {});
    const attrsChanged = origAttrs !== currAttrs || origGAttrs !== currGAttrs;

    return (
      categoryChanged ||
      classificationChanged ||
      excludeReportsChanged ||
      excludeDebtChanged ||
      notesChanged ||
      attrsChanged
    );
  }, [
    selectedCase,
    draftCategoryId,
    draftClassification,
    draftExcludeFromReports,
    draftExcludeFromDebt,
    draftErpNotes,
    draftAttributes,
    draftGlobalAttributes,
  ]);

  const totalHasPendingChanges = hasPendingChanges || isConfigDirty;

  const handleCancel = useCallback(() => {
    if (selectedCase) {
      setDraftCategoryId(selectedCase.categoryId || null);
      setDraftClassification(selectedCase.classification || "");
      setDraftExcludeFromReports(Boolean(selectedCase.excludeFromReports));
      setDraftExcludeFromDebt(Boolean(selectedCase.excludeFromDebt));
      setDraftErpNotes(selectedCase.erpNotes || "");
      setDraftAttributes(
        selectedCase.attributes || selectedCase.attributeValues || {},
      );
      setDraftGlobalAttributes(selectedCase.globalAttributes || {});
    }
    cancelEdit();
  }, [selectedCase, cancelEdit]);

  const handleSaveAll = useCallback(async () => {
    if (!selectedCase?.id) return;
    try {
      if (isConfigDirty) {
        await garageApi.updateCaseConfig(selectedCase.id, {
          categoryId: draftCategoryId || null,
          classification: draftClassification || null,
          excludeFromReports: draftExcludeFromReports,
          excludeFromDebt: draftExcludeFromDebt,
          erpNotes: draftErpNotes || null,
          customAttributes: {
            ...draftGlobalAttributes,
            ...draftAttributes,
          },
          attributes: draftAttributes,
        });
        queryClient.invalidateQueries({ queryKey: ["garage", "cases"] });
        queryClient.invalidateQueries({ queryKey: ["garage-case"] });
        queryClient.invalidateQueries({ queryKey: ["garage-case-code"] });
        queryClient.invalidateQueries({
          queryKey: ["garage-case-column-options"],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-customers-debt"],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-pnl"],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-checkpoint"],
        });
      }
      await handleSave(selectedCase.id);
      await refetchCase();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi lưu thay đổi vụ việc",
      );
    }
  }, [
    selectedCase,
    isConfigDirty,
    draftCategoryId,
    draftClassification,
    draftExcludeFromReports,
    draftExcludeFromDebt,
    draftErpNotes,
    draftAttributes,
    draftGlobalAttributes,
    handleSave,
    refetchCase,
    onSuccess,
    queryClient,
  ]);

  const activeSettlements = getActiveSettlements(serverSettlements);
  const activeLinkedInvoices = getActiveLinkedInvoices(serverLinkedInvoices);
  const activeSummary = getActiveFinancialSummary(
    serverSummary,
    activeSettlements,
  );

  // Real-time Reactive Graph Data
  const mergedGraphData = useMemo<TraceabilityGraphData | null>(() => {
    if (!selectedCase) return null;

    const rootId = selectedCase.id;
    const nodesMap = new Map<string, TraceabilityNode>();
    const edgesMap = new Map<string, TraceabilityEdge>();

    if (serverGraph) {
      for (const node of serverGraph.nodes) {
        if (node.id === rootId) {
          nodesMap.set(node.id, node);
        } else if (node.docType === "INVOICE") {
          const isStillActive = activeLinkedInvoices.some(
            (inv: any) =>
              inv.invoiceId === node.id ||
              inv.id === node.id ||
              inv.invoice?.id === node.id,
          );
          if (isStillActive) {
            nodesMap.set(node.id, node);
          }
        } else if (node.docType === "BANK_TXN") {
          const isStillActive = activeSettlements.some(
            (s: any) =>
              s.id === node.id ||
              `manual-${s.id}` === node.id ||
              s.tempId === node.id ||
              s.bank_transaction_id === node.id ||
              s.bankTransactionId === node.id,
          );
          if (isStillActive) {
            nodesMap.set(node.id, node);
          }
        } else {
          nodesMap.set(node.id, node);
        }
      }

      for (const edge of serverGraph.edges) {
        if (nodesMap.has(edge.source) && nodesMap.has(edge.target)) {
          edgesMap.set(edge.id, edge);
        }
      }
    }

    if (!nodesMap.has(rootId)) {
      nodesMap.set(rootId, {
        id: rootId,
        docType: "GARAGE_CASE",
        docNo: selectedCase.soChungTu || `PDV-${selectedCase.id.slice(0, 8)}`,
        title:
          `Sổ báo giá ${selectedCase.bienSoXe ? "(" + selectedCase.bienSoXe + ")" : ""}`.trim(),
        date: selectedCase.ngayPhatSinh
          ? new Date(selectedCase.ngayPhatSinh).toISOString().slice(0, 10)
          : null,
        amount: Number(
          selectedCase.tienCoThue ||
            selectedCase.rawData?.TongTienThanhToan ||
            selectedCase.doanhThu ||
            0,
        ),
        status: selectedCase.tenTinhTrangDichVu || "Đang xử lý",
        statusVariant:
          selectedCase.tinhTrangDichVu === 3 ? "default" : "secondary",
        partnerName: selectedCase.khachHangName,
        depth: 0,
        isCurrent: true,
        hasPermission: true,
        restricted: false,
        requiredResource: "garage",
      });
    }

    for (const inv of activeLinkedInvoices || []) {
      const invId = inv.invoiceId || inv.id || inv.invoice?.id;
      if (!invId) continue;
      const isOut = inv.linkType === "OUT" || inv.direction === "OUT";
      const invNo = inv.invoiceNo || inv.invoice?.invoiceNo || "HĐ";
      const serial = inv.serialNo || inv.invoice?.serialNo;
      const totalAmt = Number(inv.totalAmount || inv.invoice?.totalAmount || 0);

      if (!nodesMap.has(invId)) {
        nodesMap.set(invId, {
          id: invId,
          docType: "INVOICE",
          docNo: invNo,
          title:
            `HĐ ${isOut ? "đầu ra" : "đầu vào"} ${serial ? "(" + serial + ")" : ""}`.trim(),
          date:
            inv.invoiceDate ||
            inv.invoice?.invoiceDate ||
            inv.createdAt ||
            null,
          amount: totalAmt,
          status: inv.status || inv.invoice?.status || "CONFIRMED",
          statusVariant: "default",
          partnerName:
            inv.partnerName ||
            inv.sellerName ||
            inv.buyerName ||
            inv.invoice?.sellerName ||
            inv.invoice?.buyerName ||
            "",
          depth: 1,
          isCurrent: false,
          hasPermission: true,
          restricted: false,
          requiredResource: "invoices",
        });
      }

      const edgeId = `e-case-${rootId}-${invId}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, {
          id: edgeId,
          source: rootId,
          target: invId,
          relationType: "CASE_ATTACHED",
          label: isOut ? "HĐ Bán ra" : "HĐ Mua vào",
          isTransitive: false,
        });
      }
    }

    for (const s of activeSettlements || []) {
      const manualId = s.id || s.tempId || `manual-${Date.now()}`;
      const isReceipt =
        s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
      const isOnSystem =
        s.source_channel === "ON_SYSTEM" || s.sourceChannel === "ON_SYSTEM";
      const sAmt = Number(s.amount || 0);
      const category = s.category || "TIEN_MAT_NGOAI";

      if (isOnSystem) {
        const txnId = s.bank_transaction_id || s.bankTransactionId || manualId;
        if (!nodesMap.has(txnId)) {
          nodesMap.set(txnId, {
            id: txnId,
            docType: "BANK_TXN",
            docNo:
              s.referenceNumber ||
              s.reference_number ||
              `TXN-${txnId.slice(0, 8)}`,
            title: `${isReceipt ? "Thu ngân hàng" : "Chi ngân hàng"} (${s.bankName || "ERP"})`,
            date:
              s.trans_date ||
              s.transDate ||
              s.created_at ||
              s.createdAt ||
              null,
            amount: sAmt,
            netOffAmount: sAmt,
            status: "CLEARED",
            statusVariant: "default",
            partnerName:
              s.partner_name ||
              s.partnerName ||
              s.correspondentName ||
              "Đối tác",
            depth: 1,
            isCurrent: false,
            hasPermission: true,
            restricted: false,
            requiredResource: "bank_statements",
          });
        }

        const edgeId = `e-case-${rootId}-${txnId}`;
        if (!edgesMap.has(edgeId)) {
          edgesMap.set(edgeId, {
            id: edgeId,
            source: rootId,
            target: txnId,
            relationType: "NET_OFF",
            label: `${isReceipt ? "Cấn trừ Thu" : "Cấn trừ Chi"}: ${sAmt.toLocaleString("vi-VN")} ₫`,
            amount: sAmt,
            isTransitive: false,
          });
        }
      } else {
        if (!nodesMap.has(manualId)) {
          nodesMap.set(manualId, {
            id: manualId,
            docType: "BANK_TXN",
            docNo: `NOTE-${category}`,
            title: `${isReceipt ? "Khoản thu ngoài ERP" : "Khoản chi ngoài ERP"} (${s.partner_name || s.partnerName || "Nội bộ"})`,
            date: s.trans_date || s.transDate || s.createdAt || null,
            amount: sAmt,
            netOffAmount: sAmt,
            status: "MANUAL_NOTE",
            statusVariant: "outline",
            partnerName: s.partner_name || s.partnerName || "Nội bộ",
            depth: 1,
            isCurrent: false,
            hasPermission: true,
            restricted: false,
            requiredResource: "bank_statements",
            metadata: {
              isOffSystem: true,
              note: s.note,
              category: s.category,
            },
          });
        }

        const edgeId = `e-case-${rootId}-${manualId}`;
        if (!edgesMap.has(edgeId)) {
          edgesMap.set(edgeId, {
            id: edgeId,
            source: rootId,
            target: manualId,
            relationType: "NET_OFF",
            label: `${isReceipt ? "Thu ngoài ERP" : "Chi ngoài ERP"}: ${sAmt.toLocaleString("vi-VN")} ₫`,
            amount: sAmt,
            isTransitive: false,
          });
        }
      }
    }

    const nodes = Array.from(nodesMap.values());
    const edges = Array.from(edgesMap.values());

    const totalAmount = Number(
      selectedCase.tienCoThue ||
        selectedCase.rawData?.TongTienThanhToan ||
        selectedCase.doanhThu ||
        0,
    );
    let directCount = 0;
    let transitiveCount = 0;
    for (const n of nodes) {
      if (n.id === rootId) continue;
      if (n.depth === 1) directCount++;
      else transitiveCount++;
    }

    const totalNetOffAmount = edges
      .filter((e) => e.relationType === "NET_OFF")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const summary = {
      totalAmount,
      totalNetOffAmount,
      matchRatio:
        totalAmount > 0
          ? Math.min(100, Math.round((totalNetOffAmount / totalAmount) * 100))
          : 0,
      directCount,
      transitiveCount,
    };

    return {
      rootId,
      rootType: "GARAGE_CASE" as const,
      nodes,
      edges,
      summary,
    };
  }, [selectedCase, activeSettlements, activeLinkedInvoices, serverGraph]);

  // Audit items
  const auditItems = useMemo<DrawerAuditLogItem[]>(() => {
    if (!selectedCase) return [];
    const items: DrawerAuditLogItem[] = [];

    if (selectedCase.ngayPhatSinh || selectedCase.createdAt) {
      items.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: t(
          "cases.drawer.auditCreated",
          "Tiếp nhận xe & Khởi tạo phiếu",
        ),
        actorName: selectedCase.rawData?.NhanVienTiepNhanName || "KGara",
        timestamp: selectedCase.ngayPhatSinh || selectedCase.createdAt,
        message: `${selectedCase.soChungTu || ""} - ${selectedCase.bienSoXe || ""} (${selectedCase.khachHangName || "Khách hàng"})`,
      });
    }

    const startDate =
      selectedCase.ngayBatDauSuaChua || selectedCase.rawData?.NgayBatDauSuaChua;
    if (startDate) {
      items.push({
        id: "start_repair",
        actionType: "SYNC",
        actionLabel: t("cases.drawer.auditStartRepair", "Bắt đầu sửa chữa"),
        timestamp: startDate,
        message: t(
          "cases.drawer.auditStartRepairMsg",
          "Xe bắt đầu đưa vào quy trình sửa chữa & bảo dưỡng tại xưởng",
        ),
      });
    }

    const completionDate =
      selectedCase.ngayHoanThanhCongViec || selectedCase.rawData?.NgayKetThuc;
    if (completionDate) {
      items.push({
        id: "completed_repair",
        actionType: "APPROVE",
        actionLabel: t(
          "cases.drawer.auditCompletedRepair",
          "Nghiệm thu & Kết thúc sửa chữa",
        ),
        timestamp: completionDate,
        message: t(
          "cases.drawer.auditCompletedRepairMsg",
          "Xe đã hoàn thành toàn bộ hạng mục kỹ thuật và nghiệm thu xuất xưởng",
        ),
      });
    }

    const deliveryDate =
      selectedCase.ngayGiaoXe || selectedCase.rawData?.NgayGiaoXe;
    if (deliveryDate) {
      items.push({
        id: "delivered",
        actionType: "DONE",
        actionLabel: t("cases.drawer.auditDelivered", "Bàn giao xe cho khách"),
        timestamp: deliveryDate,
        message: t(
          "cases.drawer.auditDeliveredMsg",
          "Đã bàn giao xe cho khách hàng / đại diện bảo hiểm",
        ),
      });
    }

    if (selectedCase.updatedAt) {
      items.push({
        id: "synced",
        actionType: "SYNC",
        actionLabel: t("cases.drawer.auditSyncKgara", "Đồng bộ dữ liệu KGara"),
        timestamp: selectedCase.updatedAt,
        message: `${t("cases.drawer.refCode", "Mã tham chiếu:")} #${selectedCase.hdPhieuDichVuId || "---"}`,
      });
    }

    (activeLinkedInvoices || []).forEach((inv: any, idx: number) => {
      const invDate = inv.createdAt || inv.invoiceDate;
      if (invDate) {
        const isOut = inv.linkType === "OUT" || inv.direction === "OUT";
        items.push({
          id: `inv-${inv.id || idx}`,
          actionType: "INSERT",
          actionLabel: isOut
            ? t("cases.drawer.auditInvOut", "Liên kết HĐ Bán ra")
            : t("cases.drawer.auditInvIn", "Liên kết HĐ Mua vào"),
          timestamp: invDate,
          message: `Số HĐ: ${inv.invoiceNo || "---"} (${money(Number(inv.totalAmount || 0))})`,
        });
      }
    });

    (activeSettlements || []).forEach((s: any, idx: number) => {
      const sDate = s.trans_date || s.transDate || s.created_at || s.createdAt;
      if (sDate) {
        const isReceipt =
          s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
        const isOnSystem =
          s.source_channel === "ON_SYSTEM" || s.sourceChannel === "ON_SYSTEM";
        items.push({
          id: `settle-${s.id || idx}`,
          actionType: isReceipt ? "APPROVE" : "CONFIRM",
          actionLabel: isReceipt
            ? t("cases.drawer.auditReceipt", "Ghi nhận Thu tiền")
            : t("cases.drawer.auditPayment", "Ghi nhận Chi tiền"),
          timestamp: sDate,
          message: `${isOnSystem ? "Sao kê ERP" : "Ngoài sổ sách"}: ${money(Number(s.amount || 0))} ${s.referenceNumber ? `(#${s.referenceNumber})` : ""}`,
        });
      }
    });

    items.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return isNaN(timeB) ? -1 : isNaN(timeA) ? 1 : timeB - timeA;
    });

    return items;
  }, [selectedCase, activeLinkedInvoices, activeSettlements, t]);

  const handleOpenAddSettlement = useCallback(
    (type: "RECEIPT" | "PAYMENT" = "RECEIPT") => {
      setEditingSettlementItem(null);
      setSettlementModalType(type);
      setShowSettlementModal(true);
    },
    [],
  );

  const handleOpenAddInvoice = useCallback(() => {
    setShowInvoiceModal(true);
  }, []);

  const handleEditSettlementNode = useCallback(
    (node: any) => {
      if (!editMode) {
        toast(
          t(
            "cases.drawer.enterEditToModify",
            "Vui lòng chuyển sang chế độ Chỉnh sửa để sửa giao dịch.",
          ),
          { icon: "💡" },
        );
        return;
      }
      const target = (activeSettlements || []).find(
        (s: any) =>
          s.id === node.id ||
          `manual-${s.id}` === node.id ||
          s.tempId === node.id ||
          s.bank_transaction_id === node.id ||
          s.bankTransactionId === node.id,
      );
      if (target) {
        const isReceipt =
          target.settlement_type === "RECEIPT" ||
          target.settlementType === "RECEIPT";
        setEditingSettlementItem({
          id: target.id || target.tempId,
          bankTransactionId:
            target.bank_transaction_id || target.bankTransactionId,
          settlementType: isReceipt ? "RECEIPT" : "PAYMENT",
          sourceChannel:
            target.source_channel ||
            target.sourceChannel ||
            "OFF_SYSTEM_MANUAL",
          category: target.category || "TIEN_MAT_NGOAI",
          amount: Number(target.amount || 0),
          transDate: target.trans_date || target.transDate || target.createdAt,
          partnerName:
            target.partner_name ||
            target.partnerName ||
            target.correspondentName ||
            "",
          note: target.note || "",
          referenceNumber: target.referenceNumber || "",
          bankName: target.bankName || "",
        });
        setSettlementModalType(isReceipt ? "RECEIPT" : "PAYMENT");
      } else {
        setEditingSettlementItem({
          id: node.id,
          settlementType: (node.amount || 0) >= 0 ? "RECEIPT" : "PAYMENT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          category: "TIEN_MAT_NGOAI",
          amount: Math.abs(node.amount || node.netOffAmount || 0),
          transDate: node.date,
          partnerName: node.partnerName,
          note: node.title,
        });
        setSettlementModalType((node.amount || 0) >= 0 ? "RECEIPT" : "PAYMENT");
      }
      setShowSettlementModal(true);
    },
    [editMode, activeSettlements, t],
  );

  const handleSelectCase = useCallback(
    (
      newCaseCode: string,
      options?: {
        tabKey?: string;
        subTabKey?: GarageCaseDetailViewMode;
        editMode?: boolean;
      },
    ) => {
      setActiveCaseCode(newCaseCode);
      queryClient.invalidateQueries({
        queryKey: ["garage-case-by-code", newCaseCode],
      });

      if (options?.tabKey) {
        setActiveTabKey(options.tabKey);
      } else {
        setActiveTabKey("quote_details");
      }

      if (options?.subTabKey) {
        setDetailsSubTab(options.subTabKey);
      } else if (!options?.tabKey || options.tabKey === "quote_details") {
        setDetailsSubTab("details");
      }

      if (options?.editMode && canUpdateGarage) {
        startEdit();
      } else {
        cancelEdit();
      }
    },
    [queryClient, startEdit, cancelEdit, canUpdateGarage],
  );

  return {
    t,
    selectedBranchId,
    activeCaseCode,
    handleSelectCase,
    selectedCase,
    isLoadingCase,
    refetchCase,
    syncCaseDetail,
    isSyncingDetail,
    grossProfit,
    canUpdateGarage,
    // Edit & Draft state
    editMode,
    startEdit: guardedStartEdit,
    cancelEdit,
    saving,
    hasPendingChanges,
    totalHasPendingChanges,
    draftCategoryId,
    setDraftCategoryId,
    draftClassification,
    setDraftClassification,
    draftExcludeFromReports,
    setDraftExcludeFromReports,
    draftExcludeFromDebt,
    setDraftExcludeFromDebt,
    draftErpNotes,
    setDraftErpNotes,
    draftAttributes,
    setDraftAttributes,
    draftGlobalAttributes,
    setDraftGlobalAttributes,
    handleCancel,
    handleSaveAll,
    // Tabs & Traceability
    activeTabKey,
    setActiveTabKey,
    detailsSubTab,
    setDetailsSubTab,
    activeSettlements,
    activeLinkedInvoices,
    activeSummary,
    mergedGraphData,
    auditItems,
    // Modals
    showSettlementModal,
    setShowSettlementModal,
    settlementModalType,
    editingSettlementItem,
    setEditingSettlementItem,
    showInvoiceModal,
    setShowInvoiceModal,
    handleOpenAddSettlement,
    handleOpenAddInvoice,
    handleEditSettlementNode,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    queryClient,
  };
}
