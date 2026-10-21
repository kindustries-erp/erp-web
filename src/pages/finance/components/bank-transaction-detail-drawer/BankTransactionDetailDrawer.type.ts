import type { DrawerTopTabItem } from "@/shared/components/StandardFormDrawer";

export interface BankTransactionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSaved?: () => void;
  defaultTabKey?: string;
  initialMode?: "view" | "edit";
  customTabs?: DrawerTopTabItem[];
}

export type BankTransactionDetailSubTabKey =
  | "details"
  | "accounting"
  | "traceability";

export type BankTransactionPartnerSubTabKey = "partner" | "analytics";

export interface BankTransactionDetailTabNavProps {
  subTab: BankTransactionDetailSubTabKey;
  onSubTabChange: (tab: BankTransactionDetailSubTabKey) => void;
  accountingBadgeCount?: number;
  linkedBadgeCount?: number;
}

export interface BankTransactionAccountingSectionProps {
  transaction: any;
  editMode: boolean;
  isPosted: boolean;
  accountingEnabled: boolean;
  onToggleAccounting: () => void;
  postingState: any;
  defaultPostingDate: string;
  baseDescription: string;
  unpostMutation: any;
}

export interface BankTransactionTraceabilitySectionProps {
  transaction: any;
  editMode: boolean;
  onOpenNetoffModal: () => void;
  onUnlinkNode: (node: any) => void;
}

export interface BankTransactionPartnerSectionProps {
  transaction: any;
  defaultSubTab?: BankTransactionPartnerSubTabKey;
  onSelectTransaction?: (id: string) => void;
}
