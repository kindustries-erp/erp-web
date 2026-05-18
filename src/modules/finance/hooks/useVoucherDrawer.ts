import { useState } from "react";
import {
  getVoucherAttachmentsApi,
  deleteVoucherAttachmentApi,
  submitPaymentVoucherApi,
  approvePaymentVoucherApi,
  rejectPaymentVoucherApi,
  cancelPaymentVoucherApi,
  type PaymentVoucher,
  type PaymentVoucherAttachment,
  type AttachmentType,
} from "@/modules/finance/api/financeApi";
import { extractApiError } from "@/shared/utils/apiError";
import { useUIStore } from "@/core/config/uiStore";

/**
 * useVoucherDrawer — quản lý state của Drawer (mở/đóng, chế độ xem/sửa, attachments).
 * Dùng chung cho TienMat và TienGui.
 */
export function useVoucherDrawer() {
  const showToast = useUIStore((s) => s.showToast);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentVoucher | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Attachments
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentType, setAttachmentType] =
    useState<AttachmentType>("INVOICE");
  const [attachmentNote, setAttachmentNote] = useState("");
  const [existingAttachments, setExistingAttachments] = useState<
    PaymentVoucherAttachment[]
  >([]);

  async function loadExistingAttachments(voucherId: string) {
    try {
      setExistingAttachments(await getVoucherAttachmentsApi(voucherId));
    } catch {
      setExistingAttachments([]);
    }
  }

  function openDrawerForNew() {
    setEditing(null);
    setDrawerEditMode(true);
    setAttachmentFiles([]);
    setAttachmentType("INVOICE");
    setAttachmentNote("");
    setExistingAttachments([]);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openDrawerForEdit(v: PaymentVoucher) {
    setEditing(v);
    setDrawerEditMode(false);
    setAttachmentFiles([]);
    setAttachmentType("INVOICE");
    setAttachmentNote("");
    setExistingAttachments([]);
    setSaveError(null);
    setDrawerOpen(true);
    loadExistingAttachments(v.id);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setDrawerEditMode(false);
    setAttachmentFiles([]);
    setAttachmentNote("");
    setExistingAttachments([]);
    setSaveError(null);
  }

  async function handleDeleteAttachment(
    item: PaymentVoucherAttachment,
    onRefreshAttachments: () => void,
    attachmentFileName: (a: PaymentVoucherAttachment) => string,
  ) {
    if (!editing) return;
    try {
      await deleteVoucherAttachmentApi(item.id);
      await loadExistingAttachments(editing.id);
      onRefreshAttachments();
      showToast({
        title: "Đã xóa đính kèm",
        description: attachmentFileName(item),
        variant: "success",
      });
    } catch (e) {
      const reason = extractApiError(e);
      setSaveError(reason);
      showToast({
        title: "Xóa đính kèm thất bại",
        description: reason,
        variant: "destructive",
      });
    }
  }

  async function handleStatusTransition(
    action: "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL",
    onSuccess: () => void,
    opts?: { note?: string; cancel_reason?: string },
  ) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      switch (action) {
        case "SUBMIT":
          await submitPaymentVoucherApi(editing.id);
          break;
        case "APPROVE":
          await approvePaymentVoucherApi(editing.id);
          break;
        case "REJECT":
          await rejectPaymentVoucherApi(editing.id, opts?.note);
          break;
        case "POST":
          await approvePaymentVoucherApi(editing.id);
          break;
        case "CANCEL":
          await cancelPaymentVoucherApi(editing.id, opts?.cancel_reason);
          break;
      }
      const ACTION_LABELS: Record<string, string> = {
        SUBMIT: "Đã gửi duyệt",
        APPROVE: "Đã duyệt và hạch toán",
        REJECT: "Đã từ chối",
        POST: "Đã duyệt và hạch toán",
        CANCEL: "Đã hủy",
      };
      showToast({
        title: ACTION_LABELS[action] ?? "Thành công",
        description: editing.voucher_no,
        variant: "success",
      });
      closeDrawer();
      onSuccess();
    } catch (e) {
      const reason = extractApiError(e);
      setSaveError(reason);
      showToast({
        title: "Thao tác thất bại",
        description: reason,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return {
    drawerOpen,
    editing,
    drawerEditMode,
    setDrawerEditMode,
    saving,
    setSaving,
    saveError,
    setSaveError,
    attachmentFiles,
    setAttachmentFiles,
    attachmentType,
    setAttachmentType,
    attachmentNote,
    setAttachmentNote,
    existingAttachments,
    openDrawerForNew,
    openDrawerForEdit,
    closeDrawer,
    loadExistingAttachments,
    handleDeleteAttachment,
    cancelReason,
    setCancelReason,
    handleStatusTransition,
  };
}
