import { create } from "zustand";
import type {
  OperationalDocument,
  OperationalDocumentPaymentLink,
  OperationalDocumentType,
} from "../api/operationalApi";
import type { PaymentVoucher } from "@/modules/finance/api/financeApi";

export type { OperationalDocumentPaymentLink };

export type OperationalFlowStep = "detail" | "settlement" | "posting";

export interface SettlementFormState {
  payment_voucher_id: string;
  applied_date: string;
  applied_amount: number;
  notes: string;
}

export interface InventoryPostingLineForm {
  line_id: string;
  line_name: string;
  requested_qty: number;
  max_qty: number;
  inventory_item_id?: string | null;
}

interface OperationalFlowState {
  rootDocument: OperationalDocument | null;
  rootDocumentType: OperationalDocumentType | null;
  activeStep: OperationalFlowStep | null;

  detailDocument: OperationalDocument | null;
  detailLoading: boolean;
  detailError: string | null;

  settlementLoading: boolean;
  settlementError: string | null;
  voucherLoading: boolean;
  paymentLinks: OperationalDocumentPaymentLink[];
  voucherOptions: PaymentVoucher[];
  settlementForm: SettlementFormState;

  postingDocument: OperationalDocument | null;
  postingDocumentType: OperationalDocumentType | null;
  postingLoading: boolean;
  postingLineForms: InventoryPostingLineForm[];
  postingNotes: string;

  setRootContext: (
    document: OperationalDocument,
    documentType: OperationalDocumentType,
  ) => void;
  clearRootContext: () => void;
  setActiveStep: (step: OperationalFlowStep | null) => void;

  setDetailState: (
    payload: Partial<
      Pick<
        OperationalFlowState,
        "detailDocument" | "detailLoading" | "detailError"
      >
    >,
  ) => void;
  setSettlementState: (
    payload: Partial<
      Pick<
        OperationalFlowState,
        | "settlementLoading"
        | "settlementError"
        | "voucherLoading"
        | "paymentLinks"
        | "voucherOptions"
        | "settlementForm"
      >
    >,
  ) => void;
  setPostingState: (
    payload: Partial<
      Pick<
        OperationalFlowState,
        | "postingDocument"
        | "postingDocumentType"
        | "postingLoading"
        | "postingLineForms"
        | "postingNotes"
      >
    >,
  ) => void;
  resetFlow: () => void;
}

const defaultSettlementForm = (): SettlementFormState => ({
  payment_voucher_id: "",
  applied_date: "",
  applied_amount: 0,
  notes: "",
});

export const useOperationalFlowStore = create<OperationalFlowState>((set) => ({
  rootDocument: null,
  rootDocumentType: null,
  activeStep: null,

  detailDocument: null,
  detailLoading: false,
  detailError: null,

  settlementLoading: false,
  settlementError: null,
  voucherLoading: false,
  paymentLinks: [],
  voucherOptions: [],
  settlementForm: defaultSettlementForm(),

  postingDocument: null,
  postingDocumentType: null,
  postingLoading: false,
  postingLineForms: [],
  postingNotes: "",

  setRootContext: (rootDocument, rootDocumentType) =>
    set({ rootDocument, rootDocumentType }),
  clearRootContext: () => set({ rootDocument: null, rootDocumentType: null }),
  setActiveStep: (activeStep) => set({ activeStep }),

  setDetailState: (payload) => set(payload),
  setSettlementState: (payload) => set(payload),
  setPostingState: (payload) => set(payload),

  resetFlow: () =>
    set({
      rootDocument: null,
      rootDocumentType: null,
      activeStep: null,
      detailDocument: null,
      detailLoading: false,
      detailError: null,
      settlementLoading: false,
      settlementError: null,
      voucherLoading: false,
      paymentLinks: [],
      voucherOptions: [],
      settlementForm: defaultSettlementForm(),
      postingDocument: null,
      postingDocumentType: null,
      postingLoading: false,
      postingLineForms: [],
      postingNotes: "",
    }),
}));
