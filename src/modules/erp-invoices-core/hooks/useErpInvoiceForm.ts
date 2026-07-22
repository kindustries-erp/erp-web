import { useState } from "react";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "../api/erpInvoicesCoreApi";
import { today } from "@/shared/utils/format";
import { extractApiError } from "@/shared/utils/apiError";
import { useTranslation } from "react-i18next";
import { updateEntityTags } from "@/modules/tags/api/tagsApi";
import { purchaseOrdersCoreApi } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { usePosting } from "@/shared/components/accounting/usePosting";

type Direction = "IN" | "OUT";

function emptyForm(direction: Direction = "IN"): CreateErpInvoicePayload {
  return {
    invoiceNo: "",
    invoiceDate: today(),
    direction,
    status: "DRAFT",
    sellerName: "",
    sellerTaxCode: "",
    sellerAddress: "",
    sellerBank: "",
    buyerName: "",
    buyerTaxCode: "",
    buyerAddress: "",
    description: "",
    preVatAmount: 0,
    vatRate: 0,
    vatAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentDocumentNos: "",
    isValid: false,
    items: [],
  };
}

export function useErpInvoiceForm(onReload: () => Promise<void> | void) {
  const { t } = useTranslation("erpInvoices");

  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<ErpInvoice | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<CreateErpInvoicePayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [pendingUnpost, setPendingUnpost] = useState(false);

  const postingState = usePosting();

  function openNew(direction: Direction) {
    setDetailInvoice(null);
    setEditMode(true);
    setForm(emptyForm(direction));
    setFormError(null);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setPendingTagIds([]);
    setInfoDrawerOpen(true);
  }

  function mapInvoiceToForm(inv: ErpInvoice): CreateErpInvoicePayload {
    return {
      branchId: inv.branchId ?? undefined,
      invoiceNo: inv.invoiceNo,
      serialNo: inv.serialNo ?? undefined,
      invoiceDate: inv.invoiceDate,
      direction: inv.direction,
      status: inv.status,
      sellerName: inv.sellerName ?? "",
      sellerTaxCode: inv.sellerTaxCode ?? "",
      sellerAddress: inv.sellerAddress ?? "",
      sellerBank: inv.sellerBank ?? "",
      buyerName: inv.buyerName ?? "",
      buyerTaxCode: inv.buyerTaxCode ?? "",
      buyerAddress: inv.buyerAddress ?? "",
      description: inv.description ?? "",
      preVatAmount: Number(inv.preVatAmount),
      vatRate: inv.vatRate != null ? Number(inv.vatRate) : undefined,
      vatAmount: Number(inv.vatAmount),
      discountAmount: Number(inv.discountAmount),
      totalAmount: Number(inv.totalAmount),
      purchaseOrderId: inv.purchaseOrderId ?? undefined,
      salesOrderId: inv.salesOrderId ?? undefined,
      paymentDocumentNos: inv.paymentDocumentNos ?? "",
      notes: inv.notes ?? "",
      isValid: inv.isValid ?? false,
      accountingEnabled: inv.postingStatus === "POSTED",
      items:
        inv.items && inv.items.length > 0
          ? inv.items
          : [
              {
                description: inv.description || "",
                preVatAmount: Number(inv.preVatAmount),
                vatRate: inv.vatRate != null ? Number(inv.vatRate) : undefined,
                vatAmount: Number(inv.vatAmount),
                discountAmount: Number(inv.discountAmount),
                totalAmount: Number(inv.totalAmount),
              },
            ],
    };
  }

  async function openDetail(inv: ErpInvoice | string) {
    if (typeof inv === "string") {
      setInfoDrawerOpen(true);
      setLoadingDetail(true);
      setFormError(null);
      try {
        const fullInv = await erpInvoicesCoreApi.get(inv);
        setDetailInvoice(fullInv);
        setForm(mapInvoiceToForm(fullInv));
        setEditMode(false);
      } catch (err) {
        console.error("Failed to fetch invoice by ID", err);
      } finally {
        setLoadingDetail(false);
      }
      return;
    }

    // Show partial data first
    setDetailInvoice(inv);
    setForm(mapInvoiceToForm(inv));
    setEditMode(false);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setInternalDrawerOpen(false);
    setInfoDrawerOpen(true);
    setFormError(null);

    if (
      detailInvoice?.id === inv.id &&
      detailInvoice?.items &&
      detailInvoice.items.length > 0
    ) {
      setForm(mapInvoiceToForm(detailInvoice));
      return;
    }

    setLoadingDetail(true);

    try {
      let fullInv = await erpInvoicesCoreApi.get(inv.id);
      // Auto query detail if items are empty
      if (!fullInv.items || fullInv.items.length === 0) {
        const token = localStorage.getItem("erp_portal_token");
        if (token) {
          try {
            fullInv = await erpInvoicesCoreApi.syncDetail(inv.id, token);
          } catch (syncErr) {
            console.warn("Auto sync detail failed", syncErr);
          }
        }
      }
      setDetailInvoice(fullInv);
      setForm(mapInvoiceToForm(fullInv));
    } catch (err) {
      console.error("Failed to fetch full invoice", err);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function openInternal(inv: ErpInvoice | string) {
    // Handle string ID — open drawer first then fetch
    if (typeof inv === "string") {
      setInternalDrawerOpen(true);
      setEditMode(false);
      setDeleteConfirm(false);
      setCancelConfirm(false);
      setPendingUnpost(false);
      setFormError(null);
      postingState.reset();
      setLoadingDetail(true);
      try {
        const fullInv = await erpInvoicesCoreApi.get(inv);
        setDetailInvoice(fullInv);
        setForm(mapInvoiceToForm(fullInv));
      } catch (err) {
        console.error("Failed to fetch invoice by ID", err);
      } finally {
        setLoadingDetail(false);
      }
      return;
    }

    setDetailInvoice(inv);
    setForm(mapInvoiceToForm(inv));
    setEditMode(false);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setPendingUnpost(false);
    setFormError(null);
    postingState.reset();
    setInternalDrawerOpen(true);

    if (
      detailInvoice?.id === inv.id &&
      detailInvoice?.items &&
      detailInvoice.items.length > 0
    ) {
      setForm(mapInvoiceToForm(detailInvoice));
      return;
    }

    setLoadingDetail(true);

    try {
      let fullInv = await erpInvoicesCoreApi.get(inv.id);
      if (!fullInv.items || fullInv.items.length === 0) {
        const token = localStorage.getItem("erp_portal_token");
        if (token) {
          try {
            fullInv = await erpInvoicesCoreApi.syncDetail(inv.id, token);
          } catch (syncErr) {
            console.warn("Auto sync detail failed", syncErr);
          }
        }
      }
      setDetailInvoice(fullInv);
      setForm(mapInvoiceToForm(fullInv));
    } catch (err) {
      console.error("Failed to fetch full invoice", err);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSyncDetail() {
    if (!detailInvoice) return;
    const token = localStorage.getItem("erp_portal_token");
    if (!token) return;

    setLoadingDetail(true);
    try {
      const fullInv = await erpInvoicesCoreApi.syncDetail(
        detailInvoice.id,
        token,
      );
      setDetailInvoice(fullInv);
      setForm(mapInvoiceToForm(fullInv));
      await onReload();
    } catch (err) {
      console.error("Failed to sync detail manually", err);
    } finally {
      setLoadingDetail(false);
    }
  }

  function startEdit() {
    if (!detailInvoice) return;
    setForm({
      ...mapInvoiceToForm(detailInvoice),
      pendingDocumentChanges: [],
      pendingDeletedPdfs: [],
      pendingAddedPdfs: [],
    });
    setFormError(null);
    setPendingUnpost(false);
    postingState.reset();
    setEditMode(true);
  }

  function cancelEdit() {
    if (detailInvoice) {
      setForm({
        ...mapInvoiceToForm(detailInvoice),
        pendingDocumentChanges: [],
        pendingDeletedPdfs: [],
        pendingAddedPdfs: [],
      });
    }
    setFormError(null);
    setPendingUnpost(false);
    postingState.setIsDirty(false);
    setEditMode(false);
  }

  function closeDrawer() {
    setInfoDrawerOpen(false);
    setInternalDrawerOpen(false);
    setDetailInvoice(null);
    setEditMode(false);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setFormError(null);
  }

  async function handleSave(statusOverride?: string) {
    if (!form.invoiceNo.trim()) {
      setFormError(t("errorInvoiceNoRequired", "Số hóa đơn là bắt buộc."));
      return;
    }
    if (!form.invoiceDate) {
      setFormError(t("errorInvoiceDateRequired", "Ngày hóa đơn là bắt buộc."));
      return;
    }

    // Validate branch if internal drawer is open and there are accounting amounts
    if (internalDrawerOpen && !form.branchId && (form.totalAmount || 0) > 0) {
      setFormError(
        "Vui lòng chọn chi nhánh trước khi lưu thông tin nội bộ và hạch toán.",
      );
      return;
    }

    if (postingState.lines.length > 0 && !postingState.isBalanced) {
      setFormError(
        "Hạch toán kế toán không cân bằng. Vui lòng kiểm tra lại tổng Nợ và Có.",
      );
      return;
    }

    const pendingChanges = form.pendingDocumentChanges || [];
    let linkedCount =
      (detailInvoice?.voucherNetOffs?.length || 0) +
      ((detailInvoice as any)?.relatedPos?.length || 0);

    pendingChanges.forEach((p) => {
      if (p.action === "ADD") linkedCount++;
      else if (p.action === "REMOVE") linkedCount--;
    });

    if (linkedCount > 0 && !(form as any).accountingEnabled) {
      setFormError(
        "Bắt buộc phải bật Hạch toán kế toán khi có Chứng từ liên kết.",
      );
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...form };
      if (statusOverride) payload.status = statusOverride;

      // Remove frontend-only field before sending to API
      delete payload.pendingDocumentChanges;
      delete (payload as any).accountingEnabled;
      delete payload.pendingDeletedPdfs;
      delete payload.pendingAddedPdfs;

      let invoiceIdToProcess = "";
      let invoiceNoToProcess = form.invoiceNo;

      const accountingEnabled = !!(form as any).accountingEnabled;
      let needsRepost = false;

      if (detailInvoice) {
        invoiceIdToProcess = detailInvoice.id;
        const wasPosted = detailInvoice.postingStatus === "POSTED";

        if (wasPosted && !accountingEnabled) {
          await erpInvoicesCoreApi.unpostInvoice(invoiceIdToProcess);
          postingState.reset();
        } else if (wasPosted && accountingEnabled && postingState.isDirty) {
          await erpInvoicesCoreApi.unpostInvoice(invoiceIdToProcess);
          needsRepost = true;
        }

        const updated = await erpInvoicesCoreApi.update(
          detailInvoice.id,
          payload,
        );
        setDetailInvoice(updated);
        setEditMode(false);
      } else {
        const created = await erpInvoicesCoreApi.create(payload);
        invoiceIdToProcess = created.id;
        invoiceNoToProcess = created.invoiceNo;
        // Option B: apply pending tags to the newly created invoice
        if (pendingTagIds.length > 0) {
          try {
            await updateEntityTags("erp_invoice", created.id, pendingTagIds);
          } catch {
            // tags are non-critical, don't block UX
          }
        }
      }

      // Process pending document changes — capture snapshot first to avoid double-apply
      const pendingChanges = form.pendingDocumentChanges || [];
      if (pendingChanges.length > 0) {
        // Clear immediately in state so retry won't re-apply
        setForm((prev) => ({ ...prev, pendingDocumentChanges: [] }));

        for (const change of pendingChanges) {
          try {
            if (change.type === "BANK") {
              if (change.action === "ADD") {
                await erpInvoicesCoreApi.linkVouchers(invoiceIdToProcess, [
                  {
                    bankTransactionId: change.refId,
                    netOffAmount: change.amount || 0,
                  },
                ]);
              } else if (change.action === "REMOVE") {
                await erpInvoicesCoreApi.removeVoucherLink(
                  invoiceIdToProcess,
                  change.refId,
                );
              }
            } else if (change.type === "PO") {
              const po = await purchaseOrdersCoreApi.get(change.refId);
              let invNos = (po.supplierInvoiceNo || "")
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s);

              if (
                change.action === "ADD" &&
                !invNos.includes(invoiceNoToProcess)
              ) {
                invNos.push(invoiceNoToProcess);
                await purchaseOrdersCoreApi.update(change.refId, {
                  supplierInvoiceNo: invNos.join(", "),
                });
              } else if (change.action === "REMOVE") {
                invNos = invNos.filter((s) => s !== invoiceNoToProcess);
                await purchaseOrdersCoreApi.update(change.refId, {
                  supplierInvoiceNo: invNos.join(", "),
                });
              }
            }
          } catch (err) {
            console.error("Failed to process document change", change, err);
          }
        }
      }

      // Process pending PDF changes
      const pendingDeletedPdfs = form.pendingDeletedPdfs || [];
      if (pendingDeletedPdfs.length > 0) {
        setForm((prev) => ({ ...prev, pendingDeletedPdfs: [] }));
        for (const key of pendingDeletedPdfs) {
          try {
            await erpInvoicesCoreApi.deletePdf(invoiceIdToProcess, key);
          } catch (err) {
            console.error("Failed to delete PDF", key, err);
          }
        }
      }

      const pendingAddedPdfs = form.pendingAddedPdfs || [];
      if (pendingAddedPdfs.length > 0) {
        setForm((prev) => ({ ...prev, pendingAddedPdfs: [] }));
        try {
          await erpInvoicesCoreApi.uploadPdfs(invoiceIdToProcess, pendingAddedPdfs);
        } catch (err) {
          console.error("Failed to upload PDFs", err);
        }
      }

      // Auto-post accounting if there are lines and it should post
      const wasPosted = detailInvoice?.postingStatus === "POSTED";
      const shouldPost =
        accountingEnabled &&
        (!wasPosted || needsRepost) &&
        postingState.lines.length > 0;
      if (shouldPost) {
        // Validate accountId trước khi submit
        const emptyAccountLine = postingState.lines.find((l) => !l.accountId);
        if (emptyAccountLine) {
          setFormError(
            "Vui lòng chọn Tài khoản đầy đủ cho các dòng hạch toán trước khi lưu.",
          );
          setSaving(false);
          return;
        }

        try {
          await erpInvoicesCoreApi.postInvoice(invoiceIdToProcess, {
            postingDate:
              postingState.postingDate ||
              form.invoiceDate ||
              new Date().toISOString().slice(0, 10),
            description: postingState.description,
            lines: postingState.lines.map((l) => ({
              accountId: l.accountId,
              debit: l.debit || 0,
              credit: l.credit || 0,
              description: l.description,
            })),
          });
        } catch (err: any) {
          throw new Error(
            err?.response?.data?.message ||
              err.message ||
              "Lỗi hạch toán tự động sau khi lưu.",
          );
        }
      }

      if (!detailInvoice) {
        closeDrawer();
      }

      if (detailInvoice) {
        // Reload details for current invoice if editing without forcing drawer open
        try {
          const fullInv = await erpInvoicesCoreApi.get(detailInvoice.id);
          setDetailInvoice(fullInv);
          setForm(mapInvoiceToForm(fullInv));
        } catch (e) {
          console.error("Failed to reload invoice detail after save", e);
        }
        await onReload(); // Refresh table behind the scenes
      } else {
        await onReload();
      }
    } catch (e) {
      setFormError(
        extractApiError(e, t("errorSave", "Không thể lưu hóa đơn.")),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!detailInvoice) return;
    setSaving(true);
    try {
      await erpInvoicesCoreApi.remove(detailInvoice.id);
      closeDrawer();
      await onReload();
    } catch (e) {
      setFormError(
        extractApiError(e, t("errorDelete", "Không thể xóa hóa đơn.")),
      );
    } finally {
      setSaving(false);
      setDeleteConfirm(false);
    }
  }

  async function handleCancel() {
    if (!detailInvoice) return;
    setSaving(true);
    try {
      await erpInvoicesCoreApi.update(detailInvoice.id, {
        status: "CANCELLED",
      });
      setCancelConfirm(false);
      closeDrawer();
      await onReload();
    } catch (e) {
      setFormError(
        extractApiError(e, t("errorCancel", "Không thể hủy hóa đơn.")),
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    infoDrawerOpen,
    internalDrawerOpen,
    detailInvoice,
    editMode,
    form,
    saving,
    formError,
    deleteConfirm,
    cancelConfirm,
    pendingTagIds,
    pendingUnpost,
    setInfoDrawerOpen,
    setInternalDrawerOpen,
    setEditMode,
    setForm,
    setDeleteConfirm,
    setCancelConfirm,
    setPendingTagIds,
    setPendingUnpost,
    openNew,
    openDetail,
    openInternal,
    startEdit,
    cancelEdit,
    closeDrawer,
    handleSave,
    handleDelete,
    handleCancel,
    loadingDetail,
    handleSyncDetail,
    postingState,
  };
}
