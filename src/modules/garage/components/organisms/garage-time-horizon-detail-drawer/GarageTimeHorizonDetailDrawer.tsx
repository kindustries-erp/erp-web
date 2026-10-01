import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { useGarageTimeHorizonDetailDrawer } from "./GarageTimeHorizonDetailDrawer.hook";
import { TimeHorizonHeaderBanner } from "../../molecules/time-horizon-header-banner";
import { TimeHorizonCasesTab } from "./components/TimeHorizonCasesTab";
import { TimeHorizonTopPartnersTab } from "./components/TimeHorizonTopPartnersTab";
import { TimeHorizonAnalyticsTab } from "./components/TimeHorizonAnalyticsTab";
import { TimeHorizonRightPanel } from "./components/TimeHorizonRightPanel";
import type { GarageTimeHorizonDetailDrawerProps } from "./GarageTimeHorizonDetailDrawer.type";

export const GarageTimeHorizonDetailDrawer: React.FC<
  GarageTimeHorizonDetailDrawerProps
> = (props) => {
  const { open, horizon, onClose, onOpenCustomerDetail } = props;
  const logic = useGarageTimeHorizonDetailDrawer(props);

  const {
    t,
    activeSubTab,
    setActiveSubTab,
    page,
    setPage,
    pageSize,
    setPageSize,
    summary,
    items,
    total,
    totalPages,
    topPartners,
    isLoading,
  } = logic;

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={`${summary?.horizonLabel || "Chi tiết Mốc thời gian công nợ"}`}
      subtitle={t(
        "garage:debts.horizonDrawerSubtitle",
        "Theo dõi chi tiết các phiếu dịch vụ, tiến độ thu tiền và cơ cấu công nợ",
      )}
      titleExtra={
        <Badge variant="outline" className="text-xs">
          {summary?.horizonLabel || horizon || ""}
        </Badge>
      }
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      leftPanel={
        <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
          <TimeHorizonHeaderBanner
            activeSubTab={activeSubTab}
            onSubTabChange={setActiveSubTab}
            totalCases={total}
            topPartnersCount={topPartners.length}
          />

          {activeSubTab === "cases" && (
            <TimeHorizonCasesTab
              items={items}
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              onOpenCustomerDetail={onOpenCustomerDetail}
            />
          )}

          {activeSubTab === "top_partners" && (
            <TimeHorizonTopPartnersTab
              topPartners={topPartners}
              isLoading={isLoading}
              onOpenCustomerDetail={onOpenCustomerDetail}
            />
          )}

          {activeSubTab === "analytics" && (
            <TimeHorizonAnalyticsTab
              receivableTotalAmount={summary?.receivableTotalAmount}
              receivedAmount={summary?.receivedAmount}
              receivableAmount={summary?.receivableAmount}
              receivableCount={summary?.receivableCount}
              horizon={summary?.horizonLabel}
            />
          )}
        </div>
      }
      rightPanel={<TimeHorizonRightPanel summary={summary} />}
    />
  );
};
