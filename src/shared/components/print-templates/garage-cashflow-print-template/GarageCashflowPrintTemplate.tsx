import React from "react";
import { format } from "date-fns";
import { V2Divider } from "@/v2/shared/components/atoms";
import {
  TransferQrCardVariant,
  TransferQrMode,
  TransferQrPaymentCard,
} from "@/v2/core/transfer-qr-core";
import {
  GARAGE_CASHFLOW_PRINT_DEFAULT_LOGO,
  GARAGE_CASHFLOW_PRINT_DOTTED,
  GARAGE_CASHFLOW_PRINT_LABELS,
  GARAGE_CASHFLOW_PRINT_LIGHT_VARS,
  GARAGE_CASHFLOW_PRINT_STATUTORY_NOTE,
} from "./GarageCashflowPrintTemplate.data";
import type { GarageCashflowPrintTemplateProps } from "./GarageCashflowPrintTemplate.type";

export const GarageCashflowPrintTemplate = React.forwardRef<
  HTMLDivElement,
  GarageCashflowPrintTemplateProps
>(({ companyProfile, data }, ref) => {
  if (!data) return null;

  const labels = GARAGE_CASHFLOW_PRINT_LABELS[data.variant];
  const date = data.transDate ? new Date(data.transDate) : new Date();
  const amountText = data.amount > 0 ? data.amount.toLocaleString("vi-VN") : "";
  const signers = [
    { title: "Giám đốc", hint: "(Ký, họ tên, đóng dấu)" },
    { title: "Kế toán trưởng", hint: "(Ký, họ tên)" },
    { title: labels.signerLabel, hint: "(Ký, họ tên)" },
    { title: "Người lập phiếu", hint: "(Ký, họ tên)" },
    { title: "Thủ quỹ", hint: "(Ký, họ tên)" },
  ];

  return (
    <div
      ref={ref}
      className="flex flex-col bg-white text-black font-serif print:p-0"
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        minHeight: "265mm",
        padding: "10mm",
        fontSize: "14px",
        lineHeight: "1.5",
        ...(GARAGE_CASHFLOW_PRINT_LIGHT_VARS as React.CSSProperties),
      }}
    >
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 10mm; }
          html, body { background-color: white !important; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
        `}
      </style>

      <div className="flex justify-between items-start gap-3 mb-6">
        <div className="flex items-start gap-3">
          <img
            src={companyProfile?.logo || GARAGE_CASHFLOW_PRINT_DEFAULT_LOGO}
            alt=""
            className="h-16 w-auto object-contain"
          />
          <div className="max-w-[320px]">
            <div className="font-bold uppercase">
              {companyProfile?.company_name || GARAGE_CASHFLOW_PRINT_DOTTED}
            </div>
            <div>{companyProfile?.address || GARAGE_CASHFLOW_PRINT_DOTTED}</div>
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold">{labels.templateNo}</div>
          <div className="text-sm font-normal italic max-w-[240px]">
            {GARAGE_CASHFLOW_PRINT_STATUTORY_NOTE}
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1">{labels.title}</h1>
        <div className="italic mb-2">
          Ngày {format(date, "dd")} tháng {format(date, "MM")} năm{" "}
          {format(date, "yyyy")}
        </div>
        <div className="text-center font-medium">Số: {data.voucherCode}</div>
      </div>

      <div className="mb-8 space-y-1">
        <div>
          - {labels.partyLabel}:{" "}
          {data.partyName || GARAGE_CASHFLOW_PRINT_DOTTED}
        </div>
        <div>
          - Địa chỉ: {data.partyAddress || GARAGE_CASHFLOW_PRINT_DOTTED}
        </div>
        <div>
          - {labels.reasonLabel}: {data.reason || GARAGE_CASHFLOW_PRINT_DOTTED}
        </div>
        <div>
          - Số tiền: <span className="font-bold">{amountText}</span> VND
        </div>
        <div>
          - Viết bằng chữ: {data.amountInWords || GARAGE_CASHFLOW_PRINT_DOTTED}
        </div>
        <div>
          - Kèm theo: {data.note || GARAGE_CASHFLOW_PRINT_DOTTED} chứng từ gốc
        </div>
      </div>

      <div className="flex justify-between text-center pb-32">
        {signers.map((s) => (
          <div key={s.title} className="flex-1">
            <div className="font-bold mb-1">{s.title}</div>
            <div className="italic text-sm">{s.hint}</div>
          </div>
        ))}
      </div>

      {data.qrCodeDataUrl && (
        <div
          className="flex flex-1 flex-col"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          <V2Divider
            orientation="horizontal"
            className="mt-6 mb-4 bg-slate-300"
          />
          <div className="flex flex-1 items-center justify-center">
            {data.qrTarget ? (
              <TransferQrPaymentCard
                qrDataUrl={data.qrCodeDataUrl}
                companyInfo={
                  companyProfile
                    ? {
                        companyName: companyProfile.company_name || undefined,
                        taxCode: companyProfile.tax_code ?? undefined,
                        logo: companyProfile.logo ?? undefined,
                      }
                    : undefined
                }
                target={data.qrTarget}
                amount={data.amount}
                content={data.qrContent}
                mode={
                  data.qrMode ??
                  (data.variant === "RECEIPT"
                    ? TransferQrMode.RECEIVE_FROM_CUSTOMER
                    : TransferQrMode.PAY_TO_SUPPLIER)
                }
                variant={TransferQrCardVariant.HORIZONTAL}
                className="w-full max-w-[460px] rounded-2xl border border-border bg-card p-3.5 text-foreground shadow-none"
              />
            ) : (
              <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg border border-slate-300 bg-white text-center max-w-[130px]">
                <img
                  src={data.qrCodeDataUrl}
                  alt="VietQR"
                  className="w-24 h-24 object-contain"
                />
                <div className="text-[10px] font-bold mt-1 text-slate-800 leading-tight">
                  Quét mã để thanh toán
                </div>
                {data.qrBankHint && (
                  <div className="text-[9px] font-mono text-slate-600 leading-tight mt-0.5 break-all">
                    {data.qrBankHint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

GarageCashflowPrintTemplate.displayName = "GarageCashflowPrintTemplate";
