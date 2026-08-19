import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  Wallet,
  Plus,
  Trash2,
  ExternalLink,
  Landmark,
  Scale,
  Lock,
} from "lucide-react";
import { VoucherNetoffSelectionModal } from "./VoucherNetoffSelectionModal";
import {
  type ErpInvoice,
  type CreateErpInvoicePayload,
  erpInvoicesCoreApi,
} from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";

interface Props {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  onRefresh?: () => void;
}

export function ErpInvoiceSettlementTab({
  invoice,
  form,
  editMode,
  fieldSet,
  direction = "OUT",
  onRefresh,
}: Props) {
  const { t } = useTranslation(["erpInvoices", "common"]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active vouchers combining invoice data and pending changes
  const activeVouchers = useMemo(() => {
    const list: any[] = [];
    const pending = form?.pendingDocumentChanges || [];

    const removedBankIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "BANK")
      .map((p) => p.refId);

    (invoice?.voucherNetOffs || []).forEach((v) => {
      if (removedBankIds.includes(v.bankTransactionId)) return;
      list.push({
        id: v.id,
        bankTransactionId: v.bankTransactionId,
        refNo:
          v.bankTransaction?.referenceNumber ||
          v.bankTransaction?.description ||
          `GD #${v.bankTransactionId.slice(0, 8)}`,
        description: v.bankTransaction?.description || "—",
        transDate: v.bankTransaction?.transDate || null,
        amount: Number(v.netOffAmount || 0),
        bankName:
          v.bankTransaction?.bankAccount?.bankName ||
          v.bankTransaction?.bankName ||
          v.bankTransaction?.cashBook?.name ||
          "Sao kê ERP",
        partnerName:
          v.bankTransaction?.partnerName ||
          v.bankTransaction?.correspondentName ||
          "",
        isPending: false,
      });
    });

    // Add pending ADD items
    pending
      .filter((p) => p.action === "ADD" && p.type === "BANK")
      .forEach((p) => {
        list.push({
          id: p.refId,
          bankTransactionId: p.refId,
          refNo: `Giao dịch #${p.refId.slice(0, 8)}`,
          description: "Giao dịch đang chờ lưu...",
          transDate: new Date().toISOString(),
          amount: Number(p.amount || 0),
          bankName: "Sao kê ERP",
          partnerName: "",
          isPending: true,
        });
      });

    return list;
  }, [invoice?.voucherNetOffs, form?.pendingDocumentChanges]);

  const totalInvoiceAmount = Number(
    invoice?.totalAmount || form?.totalAmount || 0,
  );
  const totalNetOff = activeVouchers.reduce(
    (sum, v) => sum + Number(v.amount || 0),
    0,
  );
  const remainingDebt = Math.max(0, totalInvoiceAmount - totalNetOff);
  const paymentPercent =
    totalInvoiceAmount > 0
      ? Math.min(100, Math.round((totalNetOff / totalInvoiceAmount) * 100))
      : totalNetOff > 0
        ? 100
        : 0;
  const isPaidFull =
    totalNetOff >= totalInvoiceAmount && totalInvoiceAmount > 0;

  const handleSelectBankNetOff = (
    selected: { id: string; amount: number }[],
  ) => {
    if (selected.length === 0) return;
    if (editMode) {
      const current = form?.pendingDocumentChanges || [];
      const newChanges = selected.map((s) => ({
        action: "ADD" as const,
        type: "BANK" as const,
        refId: s.id,
        amount: s.amount,
      }));
      fieldSet?.("pendingDocumentChanges", [...current, ...newChanges]);
      toast.success(
        t(
          "Đã thêm giao dịch ngân hàng vào danh sách cấn trừ (chờ Lưu thay đổi).",
        ),
      );
    } else if (invoice?.id) {
      setSaving(true);
      erpInvoicesCoreApi
        .linkVouchers(
          invoice.id,
          selected.map((s) => ({
            bankTransactionId: s.id,
            netOffAmount: s.amount,
          })),
        )
        .then(() => {
          toast.success(t("linkSuccess", "Đã cấn trừ phiếu thành công"));
          onRefresh?.();
        })
        .catch((e: any) => {
          toast.error(e.response?.data?.message || "Lỗi cấn trừ phiếu");
        })
        .finally(() => setSaving(false));
    }
  };

  const handleUnlinkVoucher = async (item: any) => {
    if (editMode) {
      const current = form?.pendingDocumentChanges || [];
      fieldSet?.("pendingDocumentChanges", [
        ...current,
        {
          action: "REMOVE" as const,
          type: "BANK" as const,
          refId: item.bankTransactionId,
        },
      ]);
      toast.success(t("Đã đánh dấu gỡ cấn trừ giao dịch (chờ Lưu thay đổi)."));
    } else if (invoice?.id) {
      try {
        setSaving(true);
        await erpInvoicesCoreApi.removeVoucherLink(
          invoice.id,
          item.bankTransactionId,
        );
        toast.success(t("unlinkSuccess", "Đã gỡ cấn trừ thành công"));
        onRefresh?.();
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Lỗi gỡ cấn trừ");
      } finally {
        setSaving(false);
      }
    }
  };

  const openBankVoucher = (id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: { type: "bank_transaction", id },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-4 p-3 max-h-[600px] overflow-y-auto">
      {/* ─── 1. BẢNG TIẾN ĐỘ THANH TOÁN HÓA ĐƠN (Neutral Business KPI Card) ─── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>{t("Theo dõi Tiến độ Thanh toán & Cấn trừ Hóa đơn")}</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {direction === "IN"
                ? t("Đối soát tiến độ thanh toán cho Nhà cung cấp")
                : t("Đối soát tiến độ thu tiền từ Khách hàng")}
            </p>
          </div>

          {!editMode && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60 font-medium">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>{t("Chế độ xem")}</span>
            </div>
          )}
        </div>

        {/* Thẻ KPI tổng quan */}
        <div className="p-3.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {direction === "IN"
                    ? t("Công nợ Hóa đơn Mua vào")
                    : t("Công nợ Hóa đơn Bán ra")}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t("HĐ số:")} {invoice?.invoiceNo || form?.invoiceNo || "—"}
                </div>
              </div>
            </div>

            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                isPaidFull
                  ? "bg-slate-50 text-emerald-700 border-emerald-300 dark:bg-slate-800 dark:text-emerald-300 dark:border-emerald-800"
                  : totalNetOff > 0
                    ? "bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
              )}
            >
              {isPaidFull
                ? `✓ ĐÃ THANH TOÁN ĐỦ (100%)`
                : totalNetOff > 0
                  ? `ĐÃ THANH TOÁN (${paymentPercent}%)`
                  : `CHƯA THANH TOÁN (0%)`}
            </span>
          </div>

          {/* Dòng số liệu & Progress bar */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {direction === "IN" ? t("Đã thanh toán:") : t("Đã thu tiền:")}
              </span>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {money(totalNetOff)}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">
                  / {money(totalInvoiceAmount)}
                </span>
              </div>
            </div>

            {/* Progress bar Neutral */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isPaidFull
                    ? "bg-emerald-600"
                    : "bg-slate-600 dark:bg-slate-400",
                )}
                style={{ width: `${Math.min(paymentPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Chi tiết nợ còn lại */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              {direction === "IN"
                ? t("Còn phải thanh toán:")
                : t("Còn phải thu:")}
            </span>
            <span
              className={cn(
                "font-bold",
                remainingDebt === 0 && totalInvoiceAmount > 0
                  ? "text-slate-700 dark:text-slate-300"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {money(remainingDebt)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. DANH SÁCH CHỨNG TỪ THANH TOÁN / CẤN TRỪ ─── */}
      <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5 text-slate-500" />
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {direction === "IN"
                ? t("Chứng từ thanh toán (Ủy nhiệm chi / Phiếu chi)")
                : t("Chứng từ thu tiền (Giấy báo có / Phiếu thu)")}
            </h5>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {activeVouchers.length}
            </span>
          </div>

          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowModal(true)}
              className="h-6 text-[11px] px-2 gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              {t("Cấn trừ Sao kê / Sổ quỹ")}
            </Button>
          )}
        </div>

        {activeVouchers.length > 0 ? (
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
            {activeVouchers.map((v) => (
              <div
                key={v.id}
                className="px-3 py-2 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
              >
                <div className="space-y-0.5 max-w-[65%]">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {v.bankName}
                    </span>

                    {v.isPending && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                        {t("Chờ lưu")}
                      </span>
                    )}

                    <span
                      className="font-mono text-xs cursor-pointer text-primary hover:underline flex items-center gap-1"
                      onClick={() => openBankVoucher(v.bankTransactionId)}
                    >
                      {v.refNo}
                      <ExternalLink className="w-3 h-3 text-slate-400 inline" />
                    </span>

                    {v.transDate && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(v.transDate).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>

                  <div className="text-slate-500 text-[11px] truncate">
                    {v.partnerName ? `${v.partnerName} - ` : ""}
                    {v.description}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums text-xs">
                    {money(v.amount)}
                  </div>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleUnlinkVoucher(v)}
                      disabled={saving}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title={t("common:delete", "Xóa")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            {direction === "IN"
              ? t(
                  "Chưa có chứng từ thanh toán nào được cấn trừ cho hóa đơn này.",
                )
              : t(
                  "Chưa có chứng từ thu tiền nào được cấn trừ cho hóa đơn này.",
                )}
          </div>
        )}
      </div>

      <VoucherNetoffSelectionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        invoice={invoice}
        onSelect={handleSelectBankNetOff}
        existingVoucherIds={activeVouchers.map((v) => v.bankTransactionId)}
      />
    </div>
  );
}
