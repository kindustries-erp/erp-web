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

  function openNew(direction: Direction) {
    setDetailInvoice(null);
    setEditMode(true);
    setForm(emptyForm(direction));
    setFormError(null);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setDrawerOpen(true);
  }

  function openDetail(inv: ErpInvoice) {
    setDetailInvoice(inv);
    setEditMode(false);
    setDeleteConfirm(false);
    setCancelConfirm(false);
    setDrawerOpen(true);
  }

  function startEdit() {
    if (!detailInvoice) return;
    setForm({
      invoiceNo: detailInvoice.invoiceNo,
      serialNo: detailInvoice.serialNo ?? undefined,
      invoiceDate: detailInvoice.invoiceDate,
      direction: detailInvoice.direction,
      status: detailInvoice.status,
      sellerName: detailInvoice.sellerName ?? "",
      sellerTaxCode: detailInvoice.sellerTaxCode ?? "",
      sellerAddress: detailInvoice.sellerAddress ?? "",
      sellerBank: detailInvoice.sellerBank ?? "",
      buyerName: detailInvoice.buyerName ?? "",
      buyerTaxCode: detailInvoice.buyerTaxCode ?? "",
      buyerAddress: detailInvoice.buyerAddress ?? "",
      description: detailInvoice.description ?? "",
      preVatAmount: Number(detailInvoice.preVatAmount),
      vatRate:
        detailInvoice.vatRate != null
          ? Number(detailInvoice.vatRate)
          : undefined,
      vatAmount: Number(detailInvoice.vatAmount),
      discountAmount: Number(detailInvoice.discountAmount),
      totalAmount: Number(detailInvoice.totalAmount),
      purchaseOrderId: detailInvoice.purchaseOrderId ?? undefined,
      salesOrderId: detailInvoice.salesOrderId ?? undefined,
      paymentDocumentNos: detailInvoice.paymentDocumentNos ?? "",
      notes: detailInvoice.notes ?? "",
      items:
        detailInvoice.items && detailInvoice.items.length > 0
          ? detailInvoice.items
          : [
              {
                description: detailInvoice.description || "",
                preVatAmount: detailInvoice.preVatAmount,
                vatRate: detailInvoice.vatRate,
                vatAmount: detailInvoice.vatAmount,
                discountAmount: detailInvoice.discountAmount,
                totalAmount: detailInvoice.totalAmount,
              },
            ],
    });
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
  };
}
