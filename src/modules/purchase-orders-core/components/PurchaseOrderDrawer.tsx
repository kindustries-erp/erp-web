import { useMemo, useState, useEffect } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  type DrawerTopTabItem,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { usePurchaseOrderDrawer } from "@/modules/purchase-orders-core/hooks/usePurchaseOrderDrawer";
import { FormLineDetailPanel } from "@/modules/operational/components/form/FormLineDetailPanel";
import { FormGeneralInfoPanel } from "@/modules/operational/components/form/FormGeneralInfoPanel";
import { PurchaseLinkedDocuments } from "@/modules/operational/components/PurchaseLinkedDocuments";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  FileSpreadsheet,
  ChevronDown,
  FileText,
  Building2,
  Wallet,
  Link2,
  Paperclip,
  History,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { BusinessPartnerDetailDrawer } from "@/modules/business-partners-core/components/BusinessPartnerDetailDrawer";
import type { ErpBusinessPartner } from "@/modules/business-partners-core/api/businessPartnersCoreApi";
import {
  PurchaseOrderPartnerTab,
  PurchaseOrderPartnerRightPanel,
} from "./PurchaseOrderPartnerTab";
import { PurchaseOrderFinancialsTab } from "./PurchaseOrderFinancialsTab";
import { PurchaseOrderAttachmentsTab } from "./PurchaseOrderAttachmentsTab";

export interface PurchaseOrderDrawerProps {
  open: boolean;
  loading?: boolean;
  editing: OperationalDocument | null;
  viewOnly?: boolean;
  poReceipts?: ErpPoReceipt[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
  onExportExcel?: () => void;
  /** Pending tag IDs for Option B create flow */
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  isAdminEmail?: boolean;
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;
  partnerViewMode?: "orders" | "lines";
}

function formatPoStatus(status?: string | null, t?: (k: string) => string) {
  const tr = (k: string) => (t ? t(k) : k);
  switch (status) {
    case "DRAFT":
      return {
        label: tr("Nháp"),
        variant: "secondary" as const,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "APPROVED":
    case "CONFIRMED":
      return {
        label: tr("Đã xác nhận"),
        variant: "default" as const,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "PARTIAL_RECEIVED":
      return {
        label: tr("Nhập một phần"),
        variant: "default" as const,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    case "RECEIVED":
    case "FULLY_RECEIVED":
      return {
        label: tr("Đã nhập đủ"),
        variant: "default" as const,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "CANCELLED":
      return {
        label: tr("Đã hủy"),
        variant: "destructive" as const,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    default:
      return {
        label: status || "—",
        variant: "outline" as const,
        className: "",
      };
  }
}

export function PurchaseOrderDrawer({
  open,
  loading,
  editing,
  viewOnly,
  poReceipts,
  onClose,
  onSaved,
  onToggleEdit,
  onExportExcel,
  pendingTagIds = [],
  onPendingTagsChange,
  isAdminEmail,
  activeTabKey: controlledActiveTabKey,
  defaultTabKey = "po_details",
  onTabChange,
  partnerViewMode = "orders",
}: PurchaseOrderDrawerProps) {
  const t = useT();
  const [internalTabKey, setInternalTabKey] = useState<string>(defaultTabKey);

  const currentTabKey = controlledActiveTabKey || internalTabKey;

  useEffect(() => {
    if (open) {
      if (!editing) {
        setInternalTabKey(defaultTabKey);
        onTabChange?.(defaultTabKey);
      } else if (controlledActiveTabKey) {
        setInternalTabKey(controlledActiveTabKey);
      } else {
        setInternalTabKey(defaultTabKey);
      }
    }
  }, [open, editing, controlledActiveTabKey, defaultTabKey, onTabChange]);

  const handleTabChange = (key: string) => {
    setInternalTabKey(key);
    onTabChange?.(key);
  };

  const drawerState = usePurchaseOrderDrawer({
    open,
    editing,
    viewOnly,
    poReceipts,
    onClose,
    onSaved,
    pendingTagIds,
  });

  const {
    docNo,
    status,
    saving,
    error,
    submittingStatus,
    branchOptions,
    partnerOptions,
    setPartnerId,
    setPartnerOptions,
    isPurchaseLocked,
    hasLinkedReceipts,
    purchaseFieldLocked,
    purchaseInventoryOptions,
    handleSubmit,
    pendingDocumentChanges,
    fieldSet,
    onItemSearch,
    onScrollBottomItems,
    loadingItems,
  } = drawerState;

  const [createSupplierOpen, setCreateSupplierOpen] = useState(false);
  const [supplierDrawerMode, setSupplierDrawerMode] = useState<"view" | "edit">(
    "edit",
  );

  const handleSupplierCreated = (partner: ErpBusinessPartner) => {
    if (partner && partner.id) {
      const newOption = {
        value: partner.id,
        label: partner.code
          ? `${partner.code} — ${partner.name}`
          : partner.name,
      };
      setPartnerOptions([newOption, ...partnerOptions]);
      setPartnerId(partner.id);
    }
    setCreateSupplierOpen(false);
  };

  const linkedCount = useMemo(() => {
    const receiptsCount = poReceipts?.length || 0;
    const pendingCount = pendingDocumentChanges?.length || 0;
    return receiptsCount + pendingCount;
  }, [poReceipts, pendingDocumentChanges]);

  // Build Audit Logs for PO
  const auditLogs: DrawerAuditLogItem[] = useMemo(() => {
    if (!editing) return [];
    const items: DrawerAuditLogItem[] = [];

    const orderDateStr = editing.document_date || (editing as any).orderDate;
    if (orderDateStr) {
      items.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: t("Tạo đơn mua hàng"),
        timestamp: orderDateStr,
        message: `${t("Đơn mua hàng số")} ${docNo || editing.id}`,
      });
    }

    if (status === "CONFIRMED" || status === "APPROVED") {
      items.push({
        id: "approved",
        actionType: "APPROVE",
        actionLabel: t("Duyệt & Xác nhận đơn hàng"),
        timestamp: editing.document_date || new Date().toISOString(),
        message: t("Đơn hàng đã được phê duyệt và gửi tới Nhà cung cấp."),
      });
    }

    if (poReceipts && poReceipts.length > 0) {
      poReceipts.forEach((rc, idx) => {
        items.push({
          id: `receipt-${rc.id || idx}`,
          actionType: "SYNC",
          actionLabel: `${t("Nhập kho đợt")} #${idx + 1} (${rc.receiptNo || "GR"})`,
          timestamp: rc.receiptDate || rc.createdAt || new Date().toISOString(),
          message:
            rc.remarks ||
            `${t("Đã nhập kho")} ${rc.lines?.length || 0} ${t("dòng hàng")}`,
        });
      });
    }

    if (status === "CANCELLED") {
      items.push({
        id: "cancelled",
        actionType: "REVERT",
        actionLabel: t("Hủy đơn mua hàng"),
        timestamp: new Date().toISOString(),
        message: t("Đơn hàng đã được đánh dấu hủy."),
      });
    }

    return items;
  }, [editing, docNo, status, poReceipts, t]);

  const supplierId =
    (editing as any)?.supplierId || (editing as any)?.supplier_id || null;

  const supplierName =
    (editing as any)?.supplierName ||
    (editing as any)?.supplier_name_snapshot ||
    null;

  const drawerTabs: DrawerTopTabItem[] = useMemo(
    () => [
      // 1. Tab Chi tiết đơn hàng
      {
        key: "po_details",
        label: t("Chi tiết đơn hàng"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <FormLineDetailPanel
            variant="purchase"
            isPurchaseLocked={isPurchaseLocked}
            hasLinkedReceipts={hasLinkedReceipts}
            purchaseFieldLocked={purchaseFieldLocked}
            viewOnly={viewOnly}
            purchaseInventoryOptions={purchaseInventoryOptions}
            onItemSearch={onItemSearch}
            onScrollBottomItems={onScrollBottomItems}
            loadingItems={loadingItems}
          />
        ),
      },
      // 2. Tab Chi tiết theo đối tượng (Nhà cung cấp)
      {
        key: "partner",
        label: t("Chi tiết theo đối tượng"),
        icon: <Building2 className="w-3.5 h-3.5" />,
        content: (
          <PurchaseOrderPartnerTab
            purchaseOrder={editing}
            supplierId={supplierId}
            supplierName={supplierName}
            defaultViewMode={partnerViewMode}
          />
        ),
        rightPanel: (
          <PurchaseOrderPartnerRightPanel
            purchaseOrder={editing}
            supplierId={supplierId}
          />
        ),
      },
      // 3. Tab Tài chính & Thanh toán
      {
        key: "financials",
        label: t("Tài chính & Thanh toán"),
        icon: <Wallet className="w-3.5 h-3.5" />,
        content: <PurchaseOrderFinancialsTab purchaseOrder={editing} />,
      },
      // 4. Tab Chứng từ liên kết (Traceability Graph / Full Width)
      {
        key: "linked_docs",
        label: t("Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount: linkedCount,
        hideRightPanel: true,
        content: (
          <div className="space-y-4">
            <PurchaseLinkedDocuments
              receipts={poReceipts || []}
              editMode={!viewOnly}
              pendingDocumentChanges={pendingDocumentChanges}
              fieldSet={fieldSet}
              purchaseOrderId={editing?.id}
              open={open}
            />
          </div>
        ),
      },
      // 5. Tab Tài liệu đính kèm
      {
        key: "attachments",
        label: t("Tài liệu đính kèm"),
        icon: <Paperclip className="w-3.5 h-3.5" />,
        content: (
          <PurchaseOrderAttachmentsTab
            purchaseOrder={editing}
            editMode={!viewOnly}
          />
        ),
      },
      // 6. Tab Lịch sử & Kiểm duyệt
      {
        key: "history",
        label: t("Lịch sử & Kiểm duyệt"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditLogs.length,
        content: <DrawerAuditTimeline items={auditLogs} />,
      },
    ],
    [
      t,
      isPurchaseLocked,
      hasLinkedReceipts,
      purchaseFieldLocked,
      viewOnly,
      purchaseInventoryOptions,
      onItemSearch,
      onScrollBottomItems,
      loadingItems,
      editing,
      supplierId,
      supplierName,
      partnerViewMode,
      linkedCount,
      poReceipts,
      pendingDocumentChanges,
      fieldSet,
      open,
      auditLogs,
    ],
  );

  const footerLeft =
    editing && onExportExcel ? (
      <ActionDropdown
        align="start"
        items={[
          {
            groupLabel: t("common.exportGroup", "XUẤT DỮ LIỆU"),
            items: [
              {
                label:
                  status === "DRAFT"
                    ? t("Xuất phiếu đề xuất mua hàng")
                    : t("Xuất bảng kê mua hàng"),
                icon: <FileSpreadsheet className="w-4 h-4" />,
                onClick: onExportExcel,
                disabled: loading || saving,
              },
            ],
          },
        ]}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white dark:bg-zinc-800 hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              {t("common.actions", "Thao tác")}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    ) : undefined;

  const actions =
    viewOnly || loading
      ? [
          {
            label: t("Đóng"),
            onClick: onClose,
            variant: "outline" as const,
            disabled: loading,
          },
        ]
      : status === "DRAFT" || !editing
        ? [
            {
              label: t("Hủy"),
              onClick: onClose,
              variant: "outline" as const,
              disabled: saving,
            },
            {
              label: editing ? t("Lưu Nháp") : t("Tạo Nháp"),
              variant: "outline" as const,
              loading: saving && submittingStatus === "DRAFT",
              disabled: saving,
              onClick: () => handleSubmit("DRAFT"),
            },
            {
              label: editing ? t("Xác nhận") : t("Tạo Mới"),
              primary: true,
              loading: saving && submittingStatus === "CONFIRMED",
              disabled: saving,
              onClick: () => handleSubmit("CONFIRMED"),
            },
          ]
        : [
            {
              label: t("Hủy"),
              onClick: onClose,
              variant: "outline" as const,
              disabled: saving,
            },
            {
              label: t("Lưu thay đổi"),
              primary: true,
              loading: saving,
              disabled: saving,
              onClick: () => handleSubmit(),
            },
          ];

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  const statusBadgeMeta = formatPoStatus(status, t);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        confirmOnClose={!viewOnly}
        onClose={onClose}
        onToggleEdit={onToggleEdit}
        footerLeft={footerLeft}
        tabs={drawerTabs}
        activeTabKey={currentTabKey}
        defaultTabKey={defaultTabKey}
        onTabChange={handleTabChange}
        title={
          viewOnly
            ? t("Chi tiết Đơn mua hàng")
            : editing
              ? t("Cập nhật Đơn mua hàng")
              : t("Tạo mới Đơn mua hàng")
        }
        titleExtra={
          editing ? (
            <Badge
              variant={statusBadgeMeta.variant}
              className={`border ${statusBadgeMeta.className} text-[11px]`}
            >
              {statusBadgeMeta.label}
            </Badge>
          ) : undefined
        }
        subtitle={
          editing
            ? `${t("Mã")}: ${docNo || editing.id}`
            : t("Nhập thông tin chứng từ")
        }
        actions={actions}
        loading={loading}
        error={error}
        rightPanel={
          <FormGeneralInfoPanel
            variant="purchase"
            isPurchaseLocked={isPurchaseLocked}
            purchaseFieldLocked={purchaseFieldLocked}
            viewOnly={viewOnly}
            branchOptions={branchOptions}
            partnerOptions={partnerOptions}
            onCreatePartner={() => setCreateSupplierOpen(true)}
            entityId={editing?.id ?? null}
            entityType="erp_purchase_order"
            pendingTagIds={pendingTagIds}
            onPendingTagsChange={onPendingTagsChange}
            isAdminEmail={isAdminEmail}
          />
        }
      />
      <BusinessPartnerDetailDrawer
        open={createSupplierOpen}
        mode={supplierDrawerMode}
        setMode={setSupplierDrawerMode}
        onClose={() => setCreateSupplierOpen(false)}
        partnerId={null}
        partnerType="VENDOR"
        onSuccess={handleSupplierCreated}
        zIndex={700}
      />
    </>
  );
}
