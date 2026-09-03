import type { TabItem } from "@/shared/components/PageLayout";

export interface ErpInvoiceItemsSectionProps {
  direction: "IN" | "OUT";
  instanceIndex?: 1 | 2;
  isDrawer?: boolean;
  canEditInvoice?: boolean;
  partnerTaxCode?: string;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  handleOpenInternal: (inv: any, mode?: "view" | "edit", tab?: string) => void;
  handleDownload?: (id: string, type: "pdf" | "xml") => Promise<void>;
  onOpenSync?: () => void;
  onOpenPortalAuth?: () => void;
  isPending?: boolean;
}
