import React from "react";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, Landmark, Link2, Users } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  V2TabBar,
  V2TabBarVariant,
  type V2TabItemData,
} from "@/v2/shared/components";
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
  const {
    selectedCase,
    grossProfit,
    onSelectCase,
    financialsBadgeCount,
    linkedDocsBadgeCount,
    financialsSlot,
    linkedDocsSlot,
  } = props;

  const { activeViewMode, handleViewModeChange, partnerCasesCount, branchId } =
    useGarageCaseDetailsTab(props);

  const subTabs: V2TabItemData[] = React.useMemo(() => {
    const tabs: V2TabItemData[] = [
      {
        key: "details",
        label: t("cases.drawer.subTabQuoteDetails", "Chi tiết báo giá"),
        icon: FileSpreadsheet,
        alwaysShowIcon: true,
      },
      {
        key: "financials",
        label: t("cases.drawer.subTabFinancials", "Tài chính"),
        icon: Landmark,
        badgeCount:
          financialsBadgeCount && financialsBadgeCount > 0
            ? financialsBadgeCount
            : undefined,
        alwaysShowIcon: true,
      },
      {
        key: "linked_docs",
        label: t("cases.drawer.subTabLinkedDocs", "Chứng từ liên kết"),
        icon: Link2,
        badgeCount:
          linkedDocsBadgeCount && linkedDocsBadgeCount > 0
            ? linkedDocsBadgeCount
            : undefined,
        alwaysShowIcon: true,
      },
    ];

    if (activeViewMode === "partner") {
      tabs.push({
        key: "partner",
        label: t("cases.drawer.subTabObjectDetails", "Chi tiết theo đối tượng"),
        icon: Users,
        badgeCount: partnerCasesCount > 0 ? partnerCasesCount : undefined,
        alwaysShowIcon: true,
      });
    }

    return tabs;
  }, [
    t,
    financialsBadgeCount,
    linkedDocsBadgeCount,
    partnerCasesCount,
    activeViewMode,
  ]);

  if (!selectedCase) {
    return null;
  }

  return (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      {/* ─── 1. THANH ĐIỀU HƯỚNG SUB-TABS: CHI TIẾT BÁO GIÁ | TÀI CHÍNH | CHỨNG TỪ LIÊN KẾT ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 w-full">
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
          <V2TabBar
            variant={V2TabBarVariant.SUB}
            activeTabKey={activeViewMode}
            onTabChange={(key) =>
              handleViewModeChange(key as GarageCaseDetailViewMode)
            }
            tabs={subTabs}
            className="w-auto pb-0"
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

      {/* ─── 3. SUB-TAB 2: TÀI CHÍNH & QUYẾT TOÁN ─── */}
      {activeViewMode === "financials" && (
        <div className="space-y-4">
          {financialsSlot || (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {t(
                "cases.drawer.noFinancialsContent",
                "Chưa có dữ liệu tài chính.",
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── 4. SUB-TAB 3: CHỨNG TỪ LIÊN KẾT ─── */}
      {activeViewMode === "linked_docs" && (
        <div className="space-y-4">
          {linkedDocsSlot ? (
            <DrawerSection
              title={
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  {t("cases.drawer.subTabLinkedDocs", "Chứng từ liên kết")}
                  {linkedDocsBadgeCount && linkedDocsBadgeCount > 0 ? (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({linkedDocsBadgeCount})
                    </span>
                  ) : null}
                </span>
              }
              collapsible
              defaultCollapsed={false}
            >
              {linkedDocsSlot}
            </DrawerSection>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {t(
                "cases.drawer.noLinkedDocsContent",
                "Chưa có chứng từ liên kết.",
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. LEGACY FALLBACK: SUB-TAB CHI TIẾT THEO ĐỐI TƯỢNG ─── */}
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
