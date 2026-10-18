import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatGMT7, money } from "@/shared/utils/format";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FileText } from "lucide-react";

export interface BankTransactionVoucherPreviewProps {
  transaction: any;
}

export const BankTransactionVoucherPreview = React.memo(
  function BankTransactionVoucherPreview({
    transaction,
  }: BankTransactionVoucherPreviewProps) {
    const { t } = useTranslation();

    const bankTheme = useMemo(() => {
      const rawCode = String(
        transaction?.bankAccount?.bankCode || "",
      ).toUpperCase();
      const rawName = String(
        transaction?.bankAccount?.bankName || "",
      ).toUpperCase();
      const normalized = `${rawCode} ${rawName}`;

      if (normalized.includes("BIDV")) {
        return {
          code: "BIDV",
          bankLabel: "BIDV",
          paperTone: "from-cyan-50 via-white to-cyan-50/30",
          titleColor: "text-cyan-800",
          accentBorder: "border-cyan-200",
          accentBox: "bg-cyan-50/70",
          stripe: "from-cyan-700 to-teal-600",
        };
      }

      if (normalized.includes("TCB") || normalized.includes("TECHCOMBANK")) {
        return {
          code: "TCB",
          bankLabel: "TECHCOMBANK",
          paperTone: "from-red-50 via-white to-rose-50/40",
          titleColor: "text-red-700",
          accentBorder: "border-red-200",
          accentBox: "bg-red-50/70",
          stripe: "from-red-700 to-red-500",
        };
      }

      return {
        code: "DEFAULT",
        bankLabel: transaction?.bankAccount?.bankName || "Ngân hàng",
        paperTone: "from-slate-100 via-white to-slate-100",
        titleColor: "text-slate-800",
        accentBorder: "border-slate-200",
        accentBox: "bg-slate-50",
        stripe: "from-slate-700 to-slate-500",
      };
    }, [transaction]);

    const previewDocumentType =
      Number(transaction?.debitAmount || 0) > 0
        ? "Ủy nhiệm chi"
        : "Giấy báo có";

    const sourceLabel =
      transaction?.sourceType === "BANK"
        ? [
            transaction?.bankAccount?.bankName,
            transaction?.bankAccount?.accountNumber,
          ]
            .filter(Boolean)
            .join(" - ") || "—"
        : transaction?.cashBook?.name || "—";

    const counterpartLabel =
      [
        transaction?.correspondentName,
        transaction?.correspondentAccount,
        transaction?.correspondentBank,
      ]
        .filter(Boolean)
        .join(" · ") || "—";

    if (!transaction) return null;

    return (
      <div className="flex flex-col gap-4">
        <DrawerSection
          title={
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <FileText className="w-3.5 h-3.5 text-primary" />
              {t("bankStatement.previewStatementTitle", {
                defaultValue: "Xem trước chứng từ",
              })}
            </span>
          }
          collapsible={true}
          defaultCollapsed={false}
        >
          <div
            className={`mx-auto min-h-[420px] max-w-[960px] rounded-[20px] border border-slate-200 bg-gradient-to-br ${bankTheme.paperTone} p-5 shadow-sm md:p-7`}
          >
            <div
              className={`h-1.5 w-full rounded-full bg-gradient-to-r ${bankTheme.stripe}`}
            />
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div
                  className={`text-xl font-extrabold tracking-wide ${bankTheme.titleColor}`}
                >
                  {bankTheme.bankLabel}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-base font-bold uppercase ${bankTheme.titleColor}`}
                >
                  {previewDocumentType}
                </div>
                <div className="text-xs text-slate-500">
                  {t("bankStatement.columns.transDate", {
                    defaultValue: "Ngày GD",
                  })}
                  : {formatGMT7(transaction.transDate, "date")}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    {t("bankStatement.sourceAccount", {
                      defaultValue: "Tài khoản nguồn",
                    })}
                  </span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {sourceLabel}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    {t("bankStatement.partner", {
                      defaultValue: "Đối tác giao dịch",
                    })}
                  </span>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {counterpartLabel}
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  {t("bankStatement.columns.description", {
                    defaultValue: "Nội dung giao dịch",
                  })}
                </span>
                <div className="mt-1 text-xs text-slate-700">
                  {transaction.description || "—"}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  {t("bankStatement.totalAmount", {
                    defaultValue: "Số tiền giao dịch",
                  })}
                </span>
                <div
                  className={`mt-1 font-mono text-2xl font-black ${
                    Number(transaction.creditAmount || 0) > 0
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {Number(transaction.creditAmount || 0) > 0
                    ? `+${money(Number(transaction.creditAmount || 0))}`
                    : `-${money(Number(transaction.debitAmount || 0))}`}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {t("bankStatement.columns.referenceNumber", {
                  defaultValue: "Tham chiếu",
                })}
                : {transaction.referenceNumber || "—"}
              </div>
            </div>
          </div>
        </DrawerSection>
      </div>
    );
  },
);
