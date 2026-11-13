import type {
  useRecordPaymentMutation,
  useUpdatePaymentMutation,
} from "../../api";
import {
  executePaymentRecord,
  executePaymentUpdate,
} from "./RecordPaymentModal.helper";

export interface ExecutePaymentSubmitParams {
  loanId: string;
  isEdit: boolean;
  paymentId?: string;
  periodNumber: number;
  paymentDate: string;
  principalPaid: number;
  interestPaid: number;
  paymentReference: string;
  notes: string;
  recordMutation: ReturnType<typeof useRecordPaymentMutation>;
  updateMutation: ReturnType<typeof useUpdatePaymentMutation>;
  t: (key: string, fallback: string) => string;
  onClose: () => void;
  setError: (msg: string | null) => void;
}

export async function submitPaymentForm(p: ExecutePaymentSubmitParams) {
  if (p.isEdit && p.paymentId) {
    await executePaymentUpdate(
      p.updateMutation,
      {
        loanId: p.loanId,
        paymentId: p.paymentId,
        periodNumber: p.periodNumber,
        paymentDate: p.paymentDate,
        principalPaid: p.principalPaid,
        interestPaid: p.interestPaid,
        paymentReference: p.paymentReference,
        notes: p.notes,
      },
      p.t,
      p.onClose,
      p.setError,
    );
  } else {
    await executePaymentRecord(
      p.recordMutation,
      {
        loanId: p.loanId,
        periodNumber: p.periodNumber,
        paymentDate: p.paymentDate,
        principalPaid: p.principalPaid,
        interestPaid: p.interestPaid,
        paymentReference: p.paymentReference,
        notes: p.notes,
      },
      p.t,
      p.onClose,
      p.setError,
    );
  }
}
