import React from "react";
import { useTranslation } from "react-i18next";
import { Link2 } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DrawerDocumentTraceability } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import type { BankTransactionTraceabilitySectionProps } from "./BankTransactionDetailDrawer.type";

export const BankTransactionTraceabilitySection = React.memo(
  function BankTransactionTraceabilitySection({
    transaction,
    editMode,
    onOpenNetoffModal,
    onUnlinkNode,
  }: BankTransactionTraceabilitySectionProps) {
    const { t } = useTranslation();
    const netOffCount = transaction?.invoiceNetOffs?.length || 0;

    return (
      <div className="space-y-4">
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-primary" />
              <span>
                {t("bankStatement.linkedDocsTraceability", {
                  defaultValue: "Mạng lưới chứng từ liên kết & Cấn trừ",
                })}
              </span>
              {netOffCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                >
                  {netOffCount}
                </Badge>
              )}
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
        >
          <div className="w-full rounded-xl border border-border/70 overflow-hidden bg-background">
            <DrawerDocumentTraceability
              rootId={transaction?.id}
              rootType="BANK_TXN"
              fetchGraph={(id) => bankStatementApi.getTraceabilityGraph(id)}
              editMode={editMode}
              onAddLink={onOpenNetoffModal}
              onUnlinkNode={onUnlinkNode}
            />
          </div>
        </DrawerSection>
      </div>
    );
  },
);
