import { create } from "zustand";
import type {
  OperationalDocument,
  OperationalDocumentType,
} from "../api/operationalApi";

export type OperationalFlowStep = "detail" | "posting";

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

export const useOperationalFlowStore = create<OperationalFlowState>((set) => ({
  rootDocument: null,
  rootDocumentType: null,
  activeStep: null,

  detailDocument: null,
  detailLoading: false,
  detailError: null,

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
  setPostingState: (payload) => set(payload),

  resetFlow: () =>
    set({
      rootDocument: null,
      rootDocumentType: null,
      activeStep: null,
      detailDocument: null,
      detailLoading: false,
      detailError: null,
      postingDocument: null,
      postingDocumentType: null,
      postingLoading: false,
      postingLineForms: [],
      postingNotes: "",
    }),
}));
