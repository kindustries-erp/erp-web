import { useState } from "react";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "../api/erpInvoicesCoreApi";
import { today } from "@/shared/utils/format";
import { extractApiError } from "@/shared/utils/apiError";
import { useTranslation } from "react-i18next";

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
    items: [],
  };
}

export function useErpInvoiceForm(onReload: () => Promise<void> | void) {
  const { t } = useTranslation("erpInvoices");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<ErpInvoice | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<CreateErpInvoicePayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  function openNew(direction: Direction) {
    setDetailInvoice(null);
    setEditMode(true);
    setForm(emptyForm(direction));
    setFormError(null);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setDrawerOpen(true);
  }

  function mapInvoiceToForm(inv: ErpInvoice): CreateErpInvoicePayload {
    return {
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

  async function openDetail(inv: ErpInvoice) {
    // Show partial data first
    setDetailInvoice(inv);
    setForm(mapInvoiceToForm(inv));
    setEditMode(false);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setDrawerOpen(true);
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
    setForm(mapInvoiceToForm(detailInvoice));
    setFormError(null);
    setEditMode(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDetailInvoice(null);
    setEditMode(false);
    setDeleteConfirm(false);
    setCancelConfirm(false);
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
    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...form };
      if (statusOverride) payload.status = statusOverride;

      if (detailInvoice) {
        const updated = await erpInvoicesCoreApi.update(
          detailInvoice.id,
          payload,
        );
        setDetailInvoice(updated);
        setEditMode(false);
      } else {
        await erpInvoicesCoreApi.create(payload);
        closeDrawer();
      }
      await onReload();
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
    drawerOpen,
    detailInvoice,
    editMode,
    form,
    saving,
    formError,
    deleteConfirm,
    cancelConfirm,
    setDrawerOpen,
    setEditMode,
    setForm,
    setDeleteConfirm,
    setCancelConfirm,
    openNew,
    openDetail,
    startEdit,
    closeDrawer,
    handleSave,
    handleDelete,
    handleCancel,
    loadingDetail,
    handleSyncDetail,
  };
}
