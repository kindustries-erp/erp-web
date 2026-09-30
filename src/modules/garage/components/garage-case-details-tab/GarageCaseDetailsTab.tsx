import React from "react";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, Users } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { GarageCasePreview } from "../GarageCasePreview";
import { GarageCasePartnerTab } from "../GarageCasePartnerTab";
import { useGarageCaseDetailsTab } from "./GarageCaseDetailsTab.hook";
import type {
  GarageCaseDetailsTabProps,
  GarageCaseDetailViewMode,
} from "./GarageCaseDetailsTab.type";

export const GarageCaseDetailsTab = React.memo(function GarageCaseDetailsTab(
  props: GarageCaseDetailsTabProps,
) {
  const { t } = useTranslation(["garage", "common"]);
  const { selectedCase, grossProfit, onSelectCase } = props;

  const { activeViewMode, handleViewModeChange, partnerCasesCount, branchId } =
    useGarageCaseDetailsTab(props);

  if (!selectedCase) {
    return null;
  }

  return (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS (CHI TIẾT & CHI TIẾT THEO ĐỐI TƯỢNG) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 w-full">
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
          <PillTabs<GarageCaseDetailViewMode>
            size="sm"
            value={activeViewMode}
            onValueChange={handleViewModeChange}
            items={[
              {
                value: "details",
                label: t("cases.drawer.subTabDetails", "Chi tiết"),
                icon: FileSpreadsheet,
              },
              {
                value: "partner",
                label: t(
                  "cases.drawer.subTabObjectDetails",
                  "Chi tiết theo đối tượng",
                ),
                icon: Users,
                badgeCount:
                  partnerCasesCount > 0 ? partnerCasesCount : undefined,
              },
            ]}
          />
        </div>
      </div>

      {/* ─── 2. SUB-TAB 1: XEM TRƯỚC SỔ BÁO GIÁ & LỢI NHUẬN DỰ KIẾN ─── */}
      {activeViewMode === "details" && (
        <div className="space-y-4">
          <GarageCasePreview
            caseData={selectedCase}
            grossProfit={grossProfit}
          />
        </div>
      )}

      {/* ─── 3. SUB-TAB 2: BẢNG KÊ CHI TIẾT & LỊCH SỬ ĐỐI TƯỢNG ─── */}
      {activeViewMode === "partner" && (
        <GarageCasePartnerTab
          customerCode={selectedCase.khachHangCode}
          customerName={selectedCase.khachHangName}
          currentCaseCode={selectedCase.soChungTu}
          branchId={branchId}
          onSelectCase={onSelectCase}
        />
      )}
    </div>
  );
});
