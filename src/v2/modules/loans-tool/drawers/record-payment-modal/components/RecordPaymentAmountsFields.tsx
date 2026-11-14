import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Input, V2NumberInput, V2Text } from "@/v2/shared/components";

interface RecordPaymentAmountsFieldsProps {
  principalPaid: number;
  setPrincipalPaid: (val: number) => void;
  interestPaid: number;
  setInterestPaid: (val: number) => void;
  paymentReference: string;
  setPaymentReference: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export const RecordPaymentAmountsFields: React.FC<
  RecordPaymentAmountsFieldsProps
> = ({
  principalPaid,
  setPrincipalPaid,
  interestPaid,
  setInterestPaid,
  paymentReference,
  setPaymentReference,
  notes,
  setNotes,
}) => {
  const { t } = useV2Translation();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <V2Text variant="caption" className="font-medium mb-1 block">
            {t("v2.loans.table.principalPaid", "Tiền gốc trả (VNĐ)")} *
          </V2Text>
          <V2NumberInput
            sizeVariant="md"
            min={0}
            value={principalPaid}
            onValueChange={(val) => setPrincipalPaid(Math.max(0, val ?? 0))}
          />
        </div>
        <div>
          <V2Text variant="caption" className="font-medium mb-1 block">
            {t("v2.loans.table.interestPaid", "Tiền lãi trả (VNĐ)")} *
          </V2Text>
          <V2NumberInput
            sizeVariant="md"
            min={0}
            value={interestPaid}
            onValueChange={(val) => setInterestPaid(Math.max(0, val ?? 0))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <V2Text variant="caption" className="font-medium mb-1 block">
            {t("v2.loans.form.paymentReference", "Mã giao dịch / UNC")}
          </V2Text>
          <V2Input
            sizeVariant="md"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder={t(
              "v2.loans.form.paymentReferencePlaceholder",
              "VD: FT2412345678",
            )}
          />
        </div>
        <div>
          <V2Text variant="caption" className="font-medium mb-1 block">
            {t("v2.loans.form.notes", "Ghi chú")}
          </V2Text>
          <V2Input
            sizeVariant="md"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t(
              "v2.loans.form.paymentNotesPlaceholder",
              "VD: Đã trừ tự động qua tài khoản VCB",
            )}
          />
        </div>
      </div>
    </>
  );
};
RecordPaymentAmountsFields.displayName = "RecordPaymentAmountsFields";
