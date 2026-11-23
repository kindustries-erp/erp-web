import React from "react";
import { format } from "date-fns";
import {
  GARAGE_CASHFLOW_PRINT_DEFAULT_LOGO,
  GARAGE_CASHFLOW_PRINT_DOTTED,
  GARAGE_CASHFLOW_PRINT_LABELS,
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
      className="bg-white text-black font-serif print:p-0"
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        padding: "10mm",
        fontSize: "14px",
        lineHeight: "1.5",
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
        <div className="flex justify-end gap-10 pr-16 font-medium">
          <div>Quyển số: {GARAGE_CASHFLOW_PRINT_DOTTED}</div>
          <div>Số: {data.voucherCode}</div>
        </div>
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

      <div className="flex justify-between text-center pb-24">
        {signers.map((s) => (
          <div key={s.title} className="flex-1">
            <div className="font-bold mb-1">{s.title}</div>
            <div className="italic text-sm">{s.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

GarageCashflowPrintTemplate.displayName = "GarageCashflowPrintTemplate";
