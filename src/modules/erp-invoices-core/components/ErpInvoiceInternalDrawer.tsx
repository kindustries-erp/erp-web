import { useState } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  DrawerDocumentTraceability,
  type DrawerRelatedTabItem,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import { useTranslation } from "react-i18next";
import {
  type ErpInvoice,
  type CreateErpInvoicePayload,
  erpInvoicesCoreApi,
} from "../api/erpInvoicesCoreApi";

import {
  ChevronDown,
  RefreshCw,
  History,
  Link2,
  BookOpen,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";
import { ErpInvoiceLinkedDocuments } from "./ErpInvoiceLinkedDocuments";
import { VoucherNetoffSelectionModal } from "./VoucherNetoffSelectionModal";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { ErpInvoicePdfUpload } from "./ErpInvoicePdfUpload";
import toast from "react-hot-toast";

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  editMode: boolean;
  detailInvoice: ErpInvoice | null;
  startEdit: () => void;
  saving: boolean;
  handleSave: (statusOverride?: string) => void;
  cancelEdit: () => void;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  onSyncDetail?: () => void;
  loadingDetail?: boolean;
  hideEditToggle?: boolean;
  form?: CreateErpInvoicePayload;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  relatedTabs?: DrawerRelatedTabItem[];
  defaultRelatedTabKey?: string;
  defaultRelatedCollapsed?: boolean;
  bottomPanel?: React.ReactNode;
}

function formatTaxInvoiceStatus(val?: number | null) {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Thay thế";
    case 3:
      return "Điều chỉnh";
    case 4:
      return "Bị thay thế";
    case 5:
      return "Bị điều chỉnh";
    case 6:
      return "Bị hủy";
    default:
      return val?.toString() || "—";
  }
}

export function ErpInvoiceInternalDrawer({
  open,
  onClose,
  editMode,
  detailInvoice,
  startEdit,
  saving,
  handleSave,
  cancelEdit,
  rightPanel,
  children,
  onSyncDetail,
  loadingDetail,
  hideEditToggle = false,
  form,
  fieldSet,
  direction,
  postingState,
  pendingUnpost = false,
  onUnpost,
  relatedTabs: customRelatedTabs,
  defaultRelatedTabKey,
  defaultRelatedCollapsed = false,
  bottomPanel,
}: Props) {
  const { t } = useTranslation("erpInvoices");
  const [showNetOffModal, setShowNetOffModal] = useState(false);

  const handleSelectBankNetOff = (
    selected: { id: string; amount: number }[],
  ) => {
    if (selected.length === 0) return;
    const current = form?.pendingDocumentChanges || [];
    const newChanges = selected.map((s) => ({
      action: "ADD" as const,
      type: "BANK" as const,
      refId: s.id,
      amount: s.amount,
    }));
    fieldSet?.("pendingDocumentChanges", [...current, ...newChanges]);
    toast.success(
      t("Đã thêm giao dịch ngân hàng vào danh sách cấn trừ chờ lưu."),
    );
    onSyncDetail?.();
  };

  const editActions = [
    {
      label: t("actionCancel", "Hủy"),
      onClick: cancelEdit,
      variant: "outline" as const,
      disabled: saving,
    },
    {
      label: saving
        ? t("actionSaving", "Đang lưu...")
        : t("actionSaveChange", "Lưu thay đổi"),
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: () => handleSave("CONFIRMED"),
    },
  ];

  const drawerTitle = detailInvoice
    ? `${t("internalTitle", "Thông tin nội bộ")}: ${detailInvoice.invoiceNo}`
    : t("internalTitle", "Thông tin nội bộ");

  let titleExtra: React.ReactNode = undefined;
  if (detailInvoice && detailInvoice.taxInvoiceStatus != null) {
    const lbl = formatTaxInvoiceStatus(detailInvoice.taxInvoiceStatus);
    let badgeClass = "border-slate-200 bg-slate-50 text-slate-700";
    switch (detailInvoice.taxInvoiceStatus) {
      case 1:
        badgeClass = "border-blue-200 bg-blue-50 text-blue-700";
        break;
      case 2:
      case 3:
      case 5:
        badgeClass = "border-amber-200 bg-amber-50 text-amber-700";
        break;
      case 4:
      case 6:
        badgeClass = "border-red-200 bg-red-50 text-red-700";
        break;
    }
    titleExtra = (
      <Badge variant="ghost" className={`border ${badgeClass}`}>
        {lbl}
      </Badge>
    );
  }

  // Dropdown menu items for the left side of the footer (View mode only)
  let footerLeft: React.ReactNode = undefined;

  if (!editMode && onSyncDetail) {
    const dropdownItems: ActionDropdownItem[] = [
      {
        groupLabel: "ĐỒNG BỘ",
        items: [
          {
            label: "Đồng bộ từ GĐT",
            icon: (
              <RefreshCw
                className={`w-4 h-4 ${loadingDetail ? "animate-spin" : ""}`}
              />
            ),
            onClick: onSyncDetail,
            disabled: loadingDetail,
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              Thao tác
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    );
  }

  // Build default relatedTabs for Invoice if not explicitly passed
  let resolvedRelatedTabs = customRelatedTabs;
  if (!resolvedRelatedTabs && detailInvoice) {
    const auditItems: DrawerAuditLogItem[] = [];

    if (detailInvoice.createdAt) {
      auditItems.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: t("Đồng bộ / Khởi tạo hóa đơn"),
        timestamp: detailInvoice.createdAt,
        message: `Hóa đơn số ${detailInvoice.invoiceNo} (Ký hiệu: ${detailInvoice.serialNo || "—"})`,
      });
    }

    if (detailInvoice.validatedAt) {
      auditItems.push({
        id: "validated",
        actionType: "APPROVE",
        actionLabel: t("Kiểm duyệt hợp lệ"),
        timestamp: detailInvoice.validatedAt,
        message: t("Hóa đơn đã được kiểm tra tính hợp lý, hợp lệ."),
      });
    }

    if (detailInvoice.postingDate) {
      auditItems.push({
        id: "posted",
        actionType: "SYNC",
        actionLabel: t("Hạch toán sổ cái"),
        timestamp: detailInvoice.postingDate,
        message: `Đã ghi nhận bút toán kế toán mã #${detailInvoice.journalEntryId || ""}`,
      });
    }

    const linkedCount =
      (detailInvoice.voucherNetOffs?.length || 0) +
      ((detailInvoice as any).relatedPos?.length || 0);

    const attachmentCount =
      (detailInvoice.pdfFiles?.length || (detailInvoice.pdfFileKey ? 1 : 0)) +
      (detailInvoice.attachments?.length || 0);

    resolvedRelatedTabs = [
      // 1. Tab Chứng từ liên đới & Mạng lưới quan hệ (Canvas Graph)
      {
        key: "linked_docs",
        label: t("Chứng từ liên kết & Cấn trừ"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount: linkedCount,
        content: (
          <DrawerDocumentTraceability
            rootId={detailInvoice.id}
            rootType="INVOICE"
            fetchGraph={(id) => erpInvoicesCoreApi.getTraceabilityGraph(id)}
            editMode={editMode}
            onAddLink={(stageKey) => {
              if (stageKey === "ORDER_STOCK") {
                window.dispatchEvent(
                  new CustomEvent("open_erp_document", {
                    detail: { type: "erp_purchase_order", id: "new" },
                  }),
                );
              } else {
                setShowNetOffModal(true);
              }
            }}
            onCreateNewDoc={(stageKey) => {
              if (stageKey === "PAYMENT") {
                window.dispatchEvent(
                  new CustomEvent("open_erp_document", {
                    detail: { type: "bank_transaction", id: "new" },
                  }),
                );
              } else {
                window.dispatchEvent(
                  new CustomEvent("open_erp_document", {
                    detail: { type: "erp_purchase_order", id: "new" },
                  }),
                );
              }
            }}
            onUnlinkNode={async (node) => {
              try {
                if (node.docType === "BANK_TXN") {
                  await erpInvoicesCoreApi.removeVoucherLink(
                    detailInvoice.id,
                    node.id,
                  );
                  toast.success(t("Đã gỡ liên kết giao dịch ngân hàng."));
                } else if (node.docType === "PURCHASE_ORDER") {
                  await erpInvoicesCoreApi.update(detailInvoice.id, {
                    purchaseOrderId: undefined,
                  });
                  toast.success(t("Đã gỡ liên kết đơn mua hàng."));
                }

                onSyncDetail?.();
              } catch (err: any) {
                toast.error(err?.message || t("Lỗi gỡ liên kết chứng từ"));
              }
            }}
            editActionsSlot={
              editMode ? (
                <ErpInvoiceLinkedDocuments
                  form={form || ({} as any)}
                  fieldSet={fieldSet || (() => {})}
                  invoiceId={detailInvoice.id}
                  invoiceNo={detailInvoice.invoiceNo}
                  direction={direction || detailInvoice.direction || "IN"}
                  voucherNetOffs={detailInvoice.voucherNetOffs || []}
                  relatedPos={(detailInvoice as any).relatedPos || []}
                  editMode={editMode}
                  onRefresh={onSyncDetail || (() => {})}
                />
              ) : undefined
            }
          />
        ),
      },

      // 2. Tab Hạch toán kế toán (View & Edit)
      {
        key: "accounting",
        label: t("Hạch toán kế toán"),
        icon: <BookOpen className="w-3.5 h-3.5" />,
        badgeCount:
          detailInvoice.postingStatus === "POSTED" ||
          (form as any)?.accountingEnabled
            ? 1
            : 0,
        content:
          editMode && postingState ? (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Định khoản nghiệp vụ kế toán
                </span>
                {form?.branchId && (
                  <Button
                    type="button"
                    variant={
                      (form as any).accountingEnabled ? "outline" : "primary"
                    }
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      fieldSet?.(
                        "accountingEnabled",
                        !(form as any).accountingEnabled,
                      );
                    }}
                  >
                    {(form as any).accountingEnabled
                      ? "Hủy hạch toán"
                      : "Bật hạch toán"}
                  </Button>
                )}
              </div>

              {!form?.branchId ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch
                  toán kế toán.
                </div>
              ) : null}

              <div
                className={`transition-all duration-200 ${
                  (form as any).accountingEnabled
                    ? "opacity-100"
                    : "opacity-40 grayscale pointer-events-none"
                }`}
              >
                <PostingSection
                  postingState={postingState}
                  editMode={true}
                  isPosted={
                    detailInvoice.postingStatus === "POSTED" && !pendingUnpost
                  }
                  journalEntryId={detailInvoice.journalEntryId}
                  defaultDate={form?.invoiceDate || ""}
                  defaultDescription={
                    detailInvoice.description ||
                    form?.description ||
                    `Hạch toán hóa đơn ${form?.invoiceNo || ""}`
                  }
                  onUnpost={() => {
                    if (onUnpost) {
                      onUnpost();
                      postingState?.reset?.();
                    }
                  }}
                  getDefaultLines={(accountOptions) => {
                    const findAccount = (prefix: string) =>
                      accountOptions.find((a) =>
                        a.label.split(" - ")[0]?.startsWith(prefix),
                      )?.value || "";
                    const preVat =
                      Number(
                        detailInvoice?.preVatAmount || form?.preVatAmount,
                      ) || 0;
                    const vat =
                      Number(detailInvoice?.vatAmount || form?.vatAmount) || 0;
                    const total =
                      Number(detailInvoice?.totalAmount || form?.totalAmount) ||
                      0;
                    const baseDesc =
                      detailInvoice?.description ||
                      `${t("postingDefaultDesc", "Hạch toán hóa đơn")} ${detailInvoice?.invoiceNo || form?.invoiceNo}`;

                    const newLines = [];
                    if (direction === "IN") {
                      if (preVat > 0)
                        newLines.push({
                          id: createClientId(),
                          accountId:
                            findAccount("642") ||
                            findAccount("152") ||
                            findAccount("156"),
                          debit: preVat,
                          credit: 0,
                          description: baseDesc,
                        });
                      if (vat > 0)
                        newLines.push({
                          id: createClientId(),
                          accountId: findAccount("133"),
                          debit: vat,
                          credit: 0,
                          description: `Thuế GTGT ${detailInvoice?.invoiceNo || form?.invoiceNo}`,
                        });
                      if (total > 0)
                        newLines.push({
                          id: createClientId(),
                          accountId: findAccount("331"),
                          debit: 0,
                          credit: total,
                          description: baseDesc,
                        });
                    } else {
                      if (total > 0)
                        newLines.push({
                          id: createClientId(),
                          accountId: findAccount("131"),
                          debit: total,
                          credit: 0,
                          description: baseDesc,
                        });
                      if (preVat > 0)
                        newLines.push({
                          id: createClientId(),
                          accountId: findAccount("511") || findAccount("711"),
                          debit: 0,
                          credit: preVat,
                          description: baseDesc,
                        });
                      if (vat > 0)
                        newLines.push({
                          id: createClientId(),
                          accountId: findAccount("3331") || findAccount("333"),
                          debit: 0,
                          credit: vat,
                          description: `Thuế GTGT ${detailInvoice?.invoiceNo || form?.invoiceNo}`,
                        });
                    }
                    return newLines;
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="py-1">
              <PostedAccountingSummary
                isPosted={detailInvoice.postingStatus === "POSTED"}
                journalEntryId={detailInvoice.journalEntryId}
                postingDate={detailInvoice.postingDate}
              />
            </div>
          ),
      },
      // 3. Tab Tài liệu đính kèm
      {
        key: "attachments",
        label: t("Tài liệu đính kèm"),
        icon: <Paperclip className="w-3.5 h-3.5" />,
        badgeCount: attachmentCount,
        content: (
          <div className="py-1">
            <ErpInvoicePdfUpload
              invoiceId={detailInvoice.id}
              attachments={detailInvoice.attachments ?? null}
              pdfFileKey={detailInvoice.pdfFileKey ?? null}
              pdfFiles={detailInvoice.pdfFiles ?? null}
              editMode={editMode}
              pendingDeletedPdfs={form?.pendingDeletedPdfs}
              onPendingDeletePdf={(key) => {
                const current = form?.pendingDeletedPdfs || [];
                fieldSet?.("pendingDeletedPdfs", [...current, key]);
              }}
              pendingAddedAttachments={form?.pendingAddedAttachments}
              onPendingAddedAttachmentsChange={(files) => {
                fieldSet?.("pendingAddedAttachments", files);
              }}
            />
          </div>
        ),
      },
      // 4. Tab Lịch sử & Kiểm duyệt (Nằm cuối cùng)
      {
        key: "history",
        label: t("Lịch sử & Kiểm duyệt"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <DrawerAuditTimeline
            items={auditItems}
            emptyLabel={t("Chưa có ghi nhận lịch sử.")}
          />
        ),
      },
    ];
  }

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={editMode ? "edit" : "view"}
        onClose={onClose}
        onToggleEdit={!editMode && !hideEditToggle ? startEdit : undefined}
        title={drawerTitle}
        titleExtra={titleExtra}
        size="xl"
        layout={rightPanel ? "2-columns" : "1-column"}
        collapsibleRightPanel={true}
        confirmOnClose={editMode}
        actions={editMode ? editActions : undefined}
        footerLeft={footerLeft}
        leftPanel={children}
        rightPanel={rightPanel}
        relatedTabs={resolvedRelatedTabs}
        defaultRelatedTabKey={defaultRelatedTabKey}
        defaultRelatedCollapsed={defaultRelatedCollapsed}
        bottomPanel={bottomPanel}
      />

      {detailInvoice && (
        <VoucherNetoffSelectionModal
          open={showNetOffModal}
          onClose={() => setShowNetOffModal(false)}
          onSelect={handleSelectBankNetOff}
          existingVoucherIds={(detailInvoice.voucherNetOffs || []).map(
            (v) => v.bankTransactionId,
          )}
        />
      )}
    </>
  );
}
