import React from "react";
import { useTranslation } from "react-i18next";

export function QuoteDocumentSignatures() {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="grid grid-cols-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div>
        <p className="uppercase">
          {t("cases.quotePreview.director", "Giám Đốc")}
        </p>
        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
          {t("cases.quotePreview.signatureNote", "(Ký, ghi rõ họ tên)")}
        </p>
      </div>
      <div>
        <p className="uppercase">
          {t("cases.quotePreview.accountant", "Kế Toán DV")}
        </p>
        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
          {t("cases.quotePreview.signatureNote", "(Ký, ghi rõ họ tên)")}
        </p>
      </div>
      <div>
        <p className="uppercase">
          {t("cases.quotePreview.serviceManager", "Trưởng Phòng DV")}
        </p>
        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
          {t("cases.quotePreview.signatureNote", "(Ký, ghi rõ họ tên)")}
        </p>
      </div>
      <div>
        <p className="uppercase">
          {t("cases.quotePreview.advisor", "Cố Vấn DV")}
        </p>
        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
          {t("cases.quotePreview.signatureNote", "(Ký, ghi rõ họ tên)")}
        </p>
      </div>
    </div>
  );
}
