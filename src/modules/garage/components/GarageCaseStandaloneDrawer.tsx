import React, { useEffect, useState, useMemo } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  type DrawerAuditLogItem,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerRow,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import {
  GarageCaseClassificationBadge,
  GARAGE_CASE_CLASSIFICATIONS,
} from "./GarageCaseClassificationBadge";
import { useTranslation } from "react-i18next";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCaseGrossProfit,
  useSyncGarageCaseDetail,
  useGarageCaseByCode,
} from "../hooks/useGarage";
import { useGarageCaseEditForm } from "../hooks/useGarageCaseEditForm";
import { GarageCasePreview } from "./GarageCasePreview";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import {
  GarageCaseSettlementDrawerModal,
  type SettlementSubmissionItem,
} from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import { GarageCaseSettlementSection } from "./GarageCaseSettlementSection";
import { DrawerDocumentTraceability } from "@/shared/components/drawer/DrawerDocumentTraceability";
import { garageApi } from "../api/garageApi";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";
import {
  Link2,
  History,
  RefreshCw,
  ChevronDown,
  Wallet,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityEdge,
} from "@/shared/types/traceability";
import { GarageCasePartnerTab } from "./GarageCasePartnerTab";

export const GARAGE_CASE_CLASSIFICATION_OPTIONS: ComboboxOption[] =
  Object.values(GARAGE_CASE_CLASSIFICATIONS).map((c) => ({
    value: c.value,
    label: c.label,
    subLabel: c.subLabel,
  }));

interface GarageCaseStandaloneDrawerProps {
  isOpen: boolean;
  caseCode?: string | null;
  initialEditMode?: boolean;
  initialTabKey?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageCaseStandaloneDrawer({
  isOpen,
  caseCode,
  initialEditMode = false,
  initialTabKey,
  onClose,
  onSuccess,
}: GarageCaseStandaloneDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();

  const [showSettlementModal, setShowSettlementModal] =
    useState<boolean>(false);
  const [settlementModalType, setSettlementModalType] = useState<
    "RECEIPT" | "PAYMENT"
  >("RECEIPT");
  const [editingSettlementItem, setEditingSettlementItem] =
    useState<SettlementSubmissionItem | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const {
    data: selectedCase,
    isLoading: isLoadingCase,
    refetch: refetchCase,
  } = useGarageCaseByCode(isOpen && caseCode ? caseCode : undefined);

  const { mutate: syncCaseDetail, isPending: isSyncingDetail } =
    useSyncGarageCaseDetail();

  const { data: grossProfit } = useGarageCaseGrossProfit(caseCode || undefined);

  // Client-side classification & ERP notes draft state
  const [draftClassification, setDraftClassification] = useState<string>("");
  const [draftErpNotes, setDraftErpNotes] = useState<string>("");

  useEffect(() => {
    if (selectedCase) {
      setDraftClassification(selectedCase.classification || "");
      setDraftErpNotes(selectedCase.erpNotes || "");
    }
  }, [selectedCase]);

  // 1. Fetch Financial Summary
  const { data: serverSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", selectedCase?.id],
    queryFn: () => garageApi.getCaseFinancialSummary(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // 2. Fetch Direct Settlements
  const { data: serverSettlements } = useQuery({
    queryKey: ["garage-case-settlements", selectedCase?.id],
    queryFn: () => garageApi.getCaseSettlements(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // 3. Fetch Linked Invoices
  const { data: serverLinkedInvoices } = useQuery({
    queryKey: ["garage-case-linked-invoices", selectedCase?.id],
    queryFn: () => garageApi.getCaseLinkedInvoices(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // 4. Fetch Server Traceability Graph
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

  // Reset state when caseId changes or drawer opens
  const [activeTabKey, setActiveTabKey] = useState<string>(
    initialTabKey || "quote_details",
  );

  useEffect(() => {
    if (isOpen) {
      if (initialTabKey) {
        setActiveTabKey(initialTabKey);
      } else {
        setActiveTabKey("quote_details");
      }
      if (initialEditMode) {
        startEdit();
      } else {
        cancelEdit();
      }
      setShowSettlementModal(false);
      setEditingSettlementItem(null);
      setShowInvoiceModal(false);
    }
  }, [isOpen, caseCode, initialEditMode, initialTabKey, cancelEdit, startEdit]);

  const isConfigDirty = useMemo(() => {
    if (!selectedCase) return false;
    const origClassification = selectedCase.classification || "";
    const origErpNotes = selectedCase.erpNotes || "";
    return (
      (draftClassification || "") !== origClassification ||
      (draftErpNotes || "") !== origErpNotes
    );
  }, [selectedCase, draftClassification, draftErpNotes]);

  const totalHasPendingChanges = hasPendingChanges || isConfigDirty;

  const handleCancel = () => {
    if (selectedCase) {
      setDraftClassification(selectedCase.classification || "");
      setDraftErpNotes(selectedCase.erpNotes || "");
    }
    cancelEdit();
  };

  const handleSaveAll = async () => {
    if (!selectedCase?.id) return;
    try {
      if (isConfigDirty) {
        await garageApi.updateCaseConfig(selectedCase.id, {
          classification: draftClassification || null,
          erpNotes: draftErpNotes || null,
        });
        queryClient.invalidateQueries({ queryKey: ["garage", "cases"] });
        queryClient.invalidateQueries({
          queryKey: ["garage-case-column-options"],
        });
      }
      await handleSave(selectedCase.id);
      refetchCase();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi lưu thay đổi vụ việc",
      );
    }
  };

  const activeSettlements = getActiveSettlements(serverSettlements);
  const activeLinkedInvoices = getActiveLinkedInvoices(serverLinkedInvoices);
  const activeSummary = getActiveFinancialSummary(
    serverSummary,
    activeSettlements,
  );

  // Real-time Reactive Graph Data: Merges active client settlements & invoices with server graph
  const mergedGraphData = useMemo<TraceabilityGraphData | null>(() => {
    if (!selectedCase) return null;

    const rootId = selectedCase.id;
    const nodesMap = new Map<string, TraceabilityNode>();
    const edgesMap = new Map<string, TraceabilityEdge>();

    // 1. Seed from serverGraph if available
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

    // 2. Ensure Root Node exists
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

    // 3. Add / Update Active Linked Invoices
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

      const edgeId = `e-case-${rootId}-inv-${invId}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, {
          id: edgeId,
          source: rootId,
          target: invId,
          relationType: isOut ? "INVOICED_FROM" : "EXPENSE_FOR",
          label: isOut
            ? "Doanh thu dịch vụ (HĐ Bán)"
            : "Chi phí vật tư (HĐ Mua)",
          isTransitive: false,
        });
      }
    }

    // 4. Add / Update Active Settlements (Both ON_SYSTEM and OFF_SYSTEM_MANUAL)
    for (const s of activeSettlements || []) {
      const isReceipt =
        s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
      const sAmt = Number(s.amount || 0);
      const isOnSystem =
        s.source_channel === "ON_SYSTEM" || s.sourceChannel === "ON_SYSTEM";

      if (isOnSystem) {
        const sId =
          s.bank_transaction_id || s.bankTransactionId || s.id || s.tempId;
        if (!sId) continue;

        if (!nodesMap.has(sId)) {
          const isCredit = isReceipt;
          const sourceLabel =
            s.bank_name ||
            s.bankName ||
            s.account_number ||
            s.accountNumber ||
            s.cash_book_name ||
            s.cashBookName ||
            "Sao kê ERP";
          const docNo =
            s.reference_number ||
            s.referenceNumber ||
            `${isCredit ? "GBC" : "UNC"}-${String(sId).slice(0, 8)}`;

          nodesMap.set(sId, {
            id: sId,
            docType: "BANK_TXN",
            docNo,
            title: `${s.source_type === "BANK" || s.sourceType === "BANK" ? (isCredit ? "Giấy báo có" : "Ủy nhiệm chi") : "Phiếu " + (isCredit ? "thu" : "chi")} (${sourceLabel})`,
            date: s.trans_date || s.transDate || s.createdAt || null,
            amount: sAmt,
            netOffAmount: sAmt,
            status: "RECORDED",
            statusVariant: "default",
            partnerName:
              s.partner_name ||
              s.partnerName ||
              s.correspondent_name ||
              s.correspondentName ||
              "",
            depth: 1,
            isCurrent: false,
            hasPermission: true,
            restricted: false,
            requiredResource: "bank_statements",
          });
        }

        const edgeId = `e-case-${rootId}-txn-${sId}`;
        if (!edgesMap.has(edgeId)) {
          edgesMap.set(edgeId, {
            id: edgeId,
            source: rootId,
            target: sId,
            relationType: "NET_OFF",
            label: `${isReceipt ? "Thu trực tiếp" : "Chi trực tiếp"}: ${sAmt.toLocaleString("vi-VN")} ₫`,
            amount: sAmt,
            isTransitive: false,
          });
        }
      } else {
        // OFF_SYSTEM_MANUAL
        const rawId = s.id || s.tempId;
        const manualId = rawId
          ? String(rawId).startsWith("manual-")
            ? String(rawId)
            : `manual-${rawId}`
          : `manual-${Math.random()}`;

        if (!nodesMap.has(manualId)) {
          const category =
            s.category || (isReceipt ? "THU-NGOAI" : "CHI-NGOAI");
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

  const handleOpenAddSettlement = (type: "RECEIPT" | "PAYMENT" = "RECEIPT") => {
    setEditingSettlementItem(null);
    setSettlementModalType(type);
    setShowSettlementModal(true);
  };

  const handleOpenAddInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleEditSettlementNode = (node: any) => {
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
          target.source_channel || target.sourceChannel || "OFF_SYSTEM_MANUAL",
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
  };

  // Dropdown menu items for the left side of the footer (View mode only)
  let footerLeft: React.ReactNode = undefined;

  if (!editMode) {
    const dropdownItems: ActionDropdownItem[] = [
      {
        groupLabel: "ĐỒNG BỘ",
        items: [
          {
            label: t("cases.actions.syncDetails", "Đồng bộ chi tiết từ KGara"),
            icon: (
              <RefreshCw
                className={`w-4 h-4 ${isSyncingDetail ? "animate-spin" : ""}`}
              />
            ),
            onClick: () => {
              if (selectedBranchId && selectedCase?.hdPhieuDichVuId) {
                syncCaseDetail({
                  branchId: selectedBranchId,
                  caseId: selectedCase.hdPhieuDichVuId,
                });
              }
            },
            disabled:
              isSyncingDetail ||
              !selectedBranchId ||
              !selectedCase?.hdPhieuDichVuId,
          },
        ],
      },
    ];

    footerLeft = (
      <ActionDropdown
        align="start"
        items={dropdownItems}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors cursor-pointer"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              {t("common:actions", "Thao tác")}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    );
  }

  const editActions = [
    {
      label: t("common:cancel", "Hủy"),
      variant: "outline" as const,
      disabled: saving,
      onClick: handleCancel,
    },
    {
      label: saving
        ? t("common:saving", "Đang lưu...")
        : t("common:saveChanges", "Lưu thay đổi"),
      primary: true,
      loading: saving,
      disabled: saving || !totalHasPendingChanges,
      onClick: handleSaveAll,
    },
  ];

  let resolvedDrawerTabs: DrawerTopTabItem[] | undefined = undefined;

  if (selectedCase) {
    const auditItems: DrawerAuditLogItem[] = [];

    // 1. Tiếp nhận xe & Khởi tạo phiếu
    if (selectedCase.ngayPhatSinh || selectedCase.createdAt) {
      auditItems.push({
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

    // 2. Bắt đầu sửa chữa (nếu có)
    const startDate =
      selectedCase.ngayBatDauSuaChua || selectedCase.rawData?.NgayBatDauSuaChua;
    if (startDate) {
      auditItems.push({
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

    // 3. Nghiệm thu & Kết thúc sửa chữa (nếu có)
    const completionDate =
      selectedCase.ngayHoanThanhCongViec || selectedCase.rawData?.NgayKetThuc;
    if (completionDate) {
      auditItems.push({
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

    // 4. Bàn giao xe (nếu có)
    const deliveryDate =
      selectedCase.ngayGiaoXe || selectedCase.rawData?.NgayGiaoXe;
    if (deliveryDate) {
      auditItems.push({
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

    // 5. Đồng bộ từ KGara
    if (selectedCase.updatedAt) {
      auditItems.push({
        id: "synced",
        actionType: "SYNC",
        actionLabel: t("cases.drawer.auditSyncKgara", "Đồng bộ dữ liệu KGara"),
        timestamp: selectedCase.updatedAt,
        message: `${t("cases.drawer.refCode", "Mã tham chiếu:")} #${selectedCase.hdPhieuDichVuId || "---"}`,
      });
    }

    // 6. Các hóa đơn VAT liên kết
    (activeLinkedInvoices || []).forEach((inv: any, idx: number) => {
      const invDate = inv.createdAt || inv.invoiceDate;
      if (invDate) {
        const isOut = inv.linkType === "OUT" || inv.direction === "OUT";
        auditItems.push({
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

    // 7. Các giao dịch dòng tiền
    (activeSettlements || []).forEach((s: any, idx: number) => {
      const sDate = s.trans_date || s.transDate || s.created_at || s.createdAt;
      if (sDate) {
        const isReceipt =
          s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
        const isOnSystem =
          s.source_channel === "ON_SYSTEM" || s.sourceChannel === "ON_SYSTEM";
        auditItems.push({
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

    // Sắp xếp giảm dần theo thời gian (mới nhất lên trước)
    auditItems.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return isNaN(timeB) ? -1 : isNaN(timeA) ? 1 : timeB - timeA;
    });

    resolvedDrawerTabs = [
      // Tab 1: Chi tiết báo giá (Nội dung chính / Sheet Báo giá & Phụ tùng, Nhân công)
      {
        key: "quote_details",
        label: t("cases.drawer.quoteDetails", "Chi tiết báo giá"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-4">
            <GarageCasePreview
              caseData={selectedCase}
              grossProfit={grossProfit}
            />
          </div>
        ),
      },

      // Tab 2: Chi tiết theo đối tác (Công nợ, phân tích tuổi nợ & lịch sử phiếu của KH)
      {
        key: "partner_details",
        label: t("cases.drawer.partnerDetails", "Chi tiết theo đối tác"),
        icon: <Users className="w-3.5 h-3.5" />,
        content: (
          <GarageCasePartnerTab
            customerCode={selectedCase.khachHangCode}
            customerName={selectedCase.khachHangName}
            currentCaseCode={selectedCase.soChungTu}
            branchId={selectedCase.branchExternalId || selectedBranchId}
            onSelectCase={(newCaseCode) => {
              queryClient.invalidateQueries({
                queryKey: ["garage-case-by-code", newCaseCode],
              });
              refetchCase();
            }}
          />
        ),
      },

      // Tab 3: Tài chính & Công nợ
      {
        key: "financials",
        label: t("cases.drawer.financials", "Tài chính & Công nợ"),
        icon: <Wallet className="w-3.5 h-3.5" />,
        badgeCount:
          (activeLinkedInvoices?.length || 0) +
          (activeSettlements?.length || 0),
        content: (
          <GarageCaseSettlementSection
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            editMode={editMode}
            activeSettlements={activeSettlements}
            activeLinkedInvoices={activeLinkedInvoices}
            activeSummary={activeSummary}
            onAddSettlement={addSettlements}
            onRemoveSettlement={removeSettlement}
            onAddInvoice={addLinkedInvoice}
            onRemoveInvoice={removeLinkedInvoice}
          />
        ),
      },

      // Tab 3: Trung tâm Trực quan hóa Mạng lưới Chứng từ (Visualization Hub)
      {
        key: "linked_docs",
        label: t("cases.drawer.linkedDocs", "Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount:
          (activeLinkedInvoices?.length || 0) +
          (activeSettlements?.length || 0),
        hideRightPanel: true, // Canvas Graph bung 100% full width để nhìn rõ nhất
        content: (
          <DrawerDocumentTraceability
            rootId={selectedCase.id}
            rootType="GARAGE_CASE"
            graphData={mergedGraphData}
            fetchGraph={(id) => garageApi.getCaseTraceabilityGraph(id)}
            editMode={editMode}
            allowedDocTypes={[
              "BANK_TXN",
              "INVOICE",
              "PURCHASE_ORDER",
              "SALES_ORDER",
            ]}
            onEditManualSettlement={handleEditSettlementNode}
            onAddLink={(stageKey, docType) => {
              if (docType === "INVOICE" || stageKey === "INVOICE") {
                handleOpenAddInvoice();
              } else if (docType === "BANK_TXN" || stageKey === "PAYMENT") {
                handleOpenAddSettlement("RECEIPT");
              } else if (
                docType === "PURCHASE_ORDER" ||
                stageKey === "ORDER_STOCK"
              ) {
                toast(
                  "Tính năng ghép nối Đơn mua hàng PO đang được cập nhật.",
                  { icon: "ℹ️" },
                );
              } else if (docType === "SALES_ORDER") {
                toast(
                  "Tính năng ghép nối Đơn bán hàng SO đang được cập nhật.",
                  { icon: "ℹ️" },
                );
              } else {
                handleOpenAddSettlement("RECEIPT");
              }
            }}
            onUnlinkNode={async (node) => {
              try {
                if (editMode) {
                  if (node.docType === "INVOICE") {
                    const target = activeLinkedInvoices.find(
                      (l: any) =>
                        l.invoiceId === node.id ||
                        l.id === node.id ||
                        l.invoice?.id === node.id,
                    );
                    if (target) {
                      removeLinkedInvoice(target.id || target.tempId);
                    }
                  } else if (node.docType === "BANK_TXN") {
                    const target = activeSettlements.find(
                      (s: any) =>
                        s.bank_transaction_id === node.id ||
                        s.bankTransactionId === node.id ||
                        s.id === node.id ||
                        s.tempId === node.id ||
                        `manual-${s.id}` === node.id,
                    );
                    if (target) {
                      removeSettlement(target.id || target.tempId);
                    }
                  }
                } else {
                  toast.error(
                    t(
                      "cases.drawer.enterEditToUnlink",
                      "Vui lòng chuyển sang chế độ Chỉnh sửa trước khi gỡ liên kết chứng từ.",
                    ),
                  );
                }
              } catch (err: any) {
                toast.error(
                  err?.response?.data?.message || "Lỗi khi hủy liên kết",
                );
              }
            }}
          />
        ),
      },

      // Tab 4: Lịch sử & Đồng bộ dữ liệu KGara (DrawerAuditTimeline)
      {
        key: "sync_history",
        label: t("cases.drawer.syncHistory", "Lịch sử & Đồng bộ"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
            <DrawerAuditTimeline
              items={auditItems}
              emptyLabel={t(
                "cases.drawer.noAuditLogs",
                "Chưa có ghi nhận lịch sử.",
              )}
            />
          </div>
        ),
      },
    ];
  }

  return (
    <>
      <StandardFormDrawer
        open={isOpen}
        mode={editMode ? "edit" : "view"}
        onToggleEdit={!editMode ? startEdit : undefined}
        confirmOnClose={editMode && totalHasPendingChanges}
        onClose={onClose}
        collapsibleRightPanel={true}
        title={`${t("cases.drawer.caseDetails", "Sổ báo giá:")} ${selectedCase?.soChungTu || ""}`}
        titleExtra={
          selectedCase?.tenTinhTrangDichVu ? (
            <KgaraCaseStatusBadge status={selectedCase.tenTinhTrangDichVu} />
          ) : undefined
        }
        footerLeft={footerLeft}
        actions={editMode ? editActions : undefined}
        tabs={resolvedDrawerTabs}
        activeTabKey={activeTabKey}
        onTabChange={setActiveTabKey}
        defaultTabKey="quote_details"
        leftPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 animate-pulse px-2 w-full">
              <div className="h-48 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-64 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ) : undefined
        }
        rightPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 animate-pulse px-2 w-full">
              <div className="h-20 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-40 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ) : selectedCase ? (
            <div className="space-y-3 pb-3">
              {/* 1. THÔNG TIN CHUNG */}
              <DrawerSection
                title={t("cases.drawer.generalInfo", "Thông tin chung")}
                collapsible
                defaultCollapsed={false}
              >
                <DrawerRow
                  label={t("cases.drawer.caseCode", "Số chứng từ")}
                  value={selectedCase.soChungTu}
                />
                <DrawerRow
                  label={t("cases.drawer.plate", "Biển số xe")}
                  value={selectedCase.bienSoXe}
                />
                <DrawerRow
                  label={t("cases.drawer.customer", "Khách hàng")}
                  value={selectedCase.khachHangName}
                />
                <DrawerRow
                  label={t("cases.drawer.serviceStatus", "Trạng thái")}
                  value={selectedCase.tenTinhTrangDichVu}
                />
                <DrawerRow
                  label={t("cases.drawer.creationDate", "Ngày phát sinh")}
                  value={formatGMT7(selectedCase.ngayPhatSinh, "date")}
                />
              </DrawerSection>

              {/* 2. PHÂN LOẠI NGHIỆP VỤ & GHI CHÚ ERP */}
              <DrawerSection
                title={t(
                  "cases.drawer.classificationAndNotes",
                  "Phân loại & Ghi chú ERP",
                )}
                collapsible
                defaultCollapsed={false}
              >
                {!editMode ? (
                  <>
                    <DrawerRow
                      label={t("cases.drawer.classification", "Phân loại")}
                      value={
                        <button
                          type="button"
                          onClick={() => startEdit()}
                          className="cursor-pointer transition-transform hover:scale-105 inline-flex"
                          title={t(
                            "cases.actions.clickToEditClassification",
                            "Nhấn để chỉnh sửa phân loại",
                          )}
                        >
                          <GarageCaseClassificationBadge
                            classification={selectedCase.classification}
                            interactive={true}
                          />
                        </button>
                      }
                    />
                    <DrawerRow
                      label={t("cases.drawer.erpNotes", "Ghi chú ERP")}
                      value={selectedCase.erpNotes || "—"}
                    />
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <DrawerField
                      label={t(
                        "cases.configDrawer.classificationLabel",
                        "Phân loại phiếu",
                      )}
                    >
                      <Combobox
                        options={GARAGE_CASE_CLASSIFICATION_OPTIONS}
                        value={draftClassification}
                        onChange={(val) => setDraftClassification(val)}
                        allowClear={true}
                        placeholder={t(
                          "cases.configDrawer.classificationPlaceholder",
                          "— Chọn phân loại —",
                        )}
                      />
                    </DrawerField>

                    <DrawerField
                      label={t(
                        "cases.configDrawer.erpNotesLabel",
                        "Ghi chú ERP",
                      )}
                    >
                      <textarea
                        className={inputCls}
                        rows={3}
                        value={draftErpNotes}
                        onChange={(e) => setDraftErpNotes(e.target.value)}
                        placeholder={t(
                          "cases.configDrawer.erpNotesPlaceholder",
                          "Nhập ghi chú nghiệp vụ nội bộ trên ERP...",
                        )}
                      />
                    </DrawerField>
                  </div>
                )}
              </DrawerSection>

              {/* 3. HIỆU QUẢ KINH DOANH & LỢI NHUẬN GỘP */}
              {(() => {
                const revenueAmount = Number(
                  grossProfit?.DoanhThu ??
                    selectedCase.doanhThu ??
                    selectedCase.rawData?.DoanhThu ??
                    selectedCase.rawData?.TongTienHang ??
                    0,
                );
                const totalCostAmount = Number(
                  grossProfit?.ChiPhi ??
                    selectedCase.chiPhi ??
                    selectedCase.rawData?.ChiPhi ??
                    0,
                );
                const grossProfitAmount = Number(
                  grossProfit?.LoiNhuan ??
                    selectedCase.loiNhuan ??
                    selectedCase.rawData?.LoiNhuan ??
                    revenueAmount - totalCostAmount,
                );
                const profitMargin =
                  grossProfit?.BienLoiNhuan != null
                    ? Number(grossProfit.BienLoiNhuan)
                    : revenueAmount > 0
                      ? Number(
                          ((grossProfitAmount / revenueAmount) * 100).toFixed(
                            1,
                          ),
                        )
                      : 0;

                if (
                  revenueAmount === 0 &&
                  totalCostAmount === 0 &&
                  !grossProfit
                ) {
                  return null;
                }

                return (
                  <DrawerSection
                    title={t(
                      "cases.drawer.businessPerformance",
                      "Hiệu quả kinh doanh & Lợi nhuận",
                    )}
                    collapsible
                    defaultCollapsed={false}
                  >
                    <DrawerRow
                      label={t(
                        "cases.drawer.preTaxRevenue",
                        "Doanh thu (chưa thuế)",
                      )}
                      value={money(revenueAmount)}
                    />
                    <DrawerRow
                      label={t(
                        "cases.drawer.totalCost",
                        "Tổng chi phí vụ việc",
                      )}
                      cls="text-slate-700 dark:text-slate-300 font-medium"
                      value={money(totalCostAmount)}
                    />
                    {Number(grossProfit?.GiaVonPhuTung || 0) > 0 && (
                      <DrawerRow
                        label={t("cases.drawer.partCost", "↳ Giá vốn phụ tùng")}
                        cls="text-xs text-slate-500 pl-2"
                        value={money(Number(grossProfit.GiaVonPhuTung))}
                      />
                    )}
                    {Number(grossProfit?.ChiPhiGiaCongNgoai || 0) > 0 && (
                      <DrawerRow
                        label={t(
                          "cases.drawer.subcontractCost",
                          "↳ Gia công ngoài",
                        )}
                        cls="text-xs text-slate-500 pl-2"
                        value={money(Number(grossProfit.ChiPhiGiaCongNgoai))}
                      />
                    )}
                    {Number(grossProfit?.ChiPhiHoaHongGDV || 0) > 0 && (
                      <DrawerRow
                        label={t(
                          "cases.drawer.commissionSurveyor",
                          "↳ Hoa hồng Giám định viên",
                        )}
                        cls="text-xs text-slate-500 pl-2"
                        value={money(Number(grossProfit.ChiPhiHoaHongGDV))}
                      />
                    )}
                    {Number(grossProfit?.ChiPhiHoaHongMG || 0) > 0 && (
                      <DrawerRow
                        label={t(
                          "cases.drawer.commissionBroker",
                          "↳ Hoa hồng Môi giới",
                        )}
                        cls="text-xs text-slate-500 pl-2"
                        value={money(Number(grossProfit.ChiPhiHoaHongMG))}
                      />
                    )}
                    <DrawerRow
                      label={t("cases.drawer.grossProfit", "Lợi nhuận gộp")}
                      cls="text-slate-900 dark:text-slate-100 font-bold"
                      value={money(grossProfitAmount)}
                    />
                    {revenueAmount > 0 && (
                      <DrawerRow
                        label={t("cases.drawer.profitMargin", "Biên lợi nhuận")}
                        cls={
                          profitMargin >= 0
                            ? "text-slate-900 dark:text-slate-100 font-bold font-mono"
                            : "text-rose-600 font-bold font-mono"
                        }
                        value={`${profitMargin >= 0 ? "+" : ""}${profitMargin}%`}
                      />
                    )}
                    {grossProfit?.LoiNhuanCoThue != null && (
                      <DrawerRow
                        label={t(
                          "cases.drawer.grossProfitTax",
                          "Lợi nhuận gộp có thuế",
                        )}
                        cls="text-slate-800 dark:text-slate-200 font-semibold"
                        value={money(Number(grossProfit.LoiNhuanCoThue || 0))}
                      />
                    )}
                  </DrawerSection>
                );
              })()}
            </div>
          ) : null
        }
      />

      {/* MODALS CHO GHÉP NỐI CHỨNG TỪ TỪ TRACEABILITY GRAPH HOẶC HEADER */}
      {selectedCase && (
        <>
          <GarageCaseSettlementDrawerModal
            open={showSettlementModal}
            onClose={() => {
              setShowSettlementModal(false);
              setEditingSettlementItem(null);
            }}
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            defaultType={settlementModalType}
            editingItem={editingSettlementItem}
            suggestedAmount={
              settlementModalType === "RECEIPT"
                ? activeSummary?.breakdown?.receipts?.remainingReceivable || 0
                : activeSummary?.breakdown?.payments?.remainingPayable || 0
            }
            remainingReceivable={
              activeSummary?.breakdown?.receipts?.remainingReceivable || 0
            }
            remainingPayable={
              activeSummary?.breakdown?.payments?.remainingPayable || 0
            }
            existingTxnIds={
              activeSettlements
                ?.map((s: any) => s.bank_transaction_id || s.bankTransactionId)
                .filter(Boolean) || []
            }
            onSubmit={async (items) => {
              if (editMode) {
                if (editingSettlementItem?.id) {
                  removeSettlement(editingSettlementItem.id);
                }
                addSettlements(items);
              } else {
                if (editingSettlementItem?.id) {
                  await garageApi.removeCaseSettlement(
                    selectedCase.id,
                    editingSettlementItem.id,
                  );
                }
                for (const item of items) {
                  await garageApi.addCaseSettlement(selectedCase.id, item);
                }
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-financial-summary", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-settlements", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-traceability-graph", selectedCase.id],
                });
                toast.success(
                  editingSettlementItem
                    ? "Đã cập nhật giao dịch thành công"
                    : "Đã ghi nhận giao dịch thành công",
                );
              }
            }}
          />

          <InvoiceSelectionDrawer
            open={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            defaultLinkType="OUT"
            onSubmit={async (payloads) => {
              const items = Array.isArray(payloads) ? payloads : [payloads];
              if (editMode) {
                addLinkedInvoice(items);
              } else {
                if (items.length === 1) {
                  await garageApi.addCaseLinkedInvoice(
                    selectedCase.id,
                    items[0].invoiceId,
                    items[0].linkType,
                    items[0].note,
                  );
                } else if (items.length > 1) {
                  await garageApi.addCaseLinkedInvoices(
                    selectedCase.id,
                    items.map((i) => ({
                      invoiceId: i.invoiceId,
                      linkType: i.linkType,
                      note: i.note,
                    })),
                  );
                }
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-financial-summary", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-linked-invoices", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-traceability-graph", selectedCase.id],
                });
                toast.success(
                  items.length > 1
                    ? `Đã liên kết thành công ${items.length} hóa đơn`
                    : "Đã liên kết hóa đơn thành công",
                );
              }
            }}
          />
        </>
      )}
    </>
  );
}
