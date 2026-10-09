import React, { useState } from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui/badge";
import { FileText, History, CreditCard, Link2, BookOpen } from "lucide-react";
import {
  MockInvoiceTable,
  MockInvoiceRightPanel,
  MockFinancialsTab,
  MockLinkedDocsTab,
  MockAccountingTab,
  MockHistoryTab,
  MockInvoicePdfPreview,
  MockTargetBreakdownTable,
  MockItemsCategoryBreakdown,
  MockAnalysisVarianceTab,
} from "./V2StandardDrawer.mock";
import {
  goldenLeftTabs,
  goldenActionGroups,
  GoldenPreviewToggle,
} from "./V2StandardDrawer.demo-golden-config";

import type { Meta } from "@storybook/react";

const meta: Meta<typeof V2StandardDrawer> = {
  title: "Components/Organisms/Drawer/V2StandardDrawer",
  component: V2StandardDrawer,
  tags: ["autodocs"],
};

export default meta;

export const ErpInvoiceDetailGoldenSimulation = () => {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [activeLeftTab, setActiveLeftTab] = useState("detail");
  const [previewMode, setPreviewMode] = useState<"template" | "pdf">(
    "template",
  );

  return (
    <div className="p-6">
      <V2Button onClick={() => setOpen(true)}>Mở Chi Tiết Hóa Đơn GSM</V2Button>

      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Thông tin nội bộ: 65114302"
        titleExtra={
          <Badge
            variant="outline"
            className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
          >
            Mới
          </Badge>
        }
        subtitle="Người mua: CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM • Kỳ ngày: 03/10/2026"
        size="full"
        enableFullscreen={true}
        collapsibleRightPanel={true}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            key: "details",
            label: "Chi tiết",
            icon: <FileText className="w-3.5 h-3.5" />,
            content: (
              <div
                key={`${activeLeftTab}-${previewMode}`}
                className="animate-in fade-in-50 duration-200"
              >
                {activeLeftTab === "detail" && previewMode === "template" && (
                  <DrawerSection title="DANH SÁCH CHI TIẾT HÀNG HÓA & DỊCH VỤ">
                    <MockInvoiceTable />
                  </DrawerSection>
                )}
                {activeLeftTab === "detail" && previewMode === "pdf" && (
                  <DrawerSection title="XEM TRƯỚC BẢN IN HÓA ĐƠN ĐIỆN TỬ (PDF A4)">
                    <MockInvoicePdfPreview />
                  </DrawerSection>
                )}
                {activeLeftTab === "target" && <MockTargetBreakdownTable />}
                {activeLeftTab === "items" && <MockItemsCategoryBreakdown />}
                {activeLeftTab === "analysis" && <MockAnalysisVarianceTab />}
              </div>
            ),
          },
          {
            key: "financials",
            label: "Tài chính",
            icon: <CreditCard className="w-3.5 h-3.5" />,
            content: <MockFinancialsTab />,
          },
          {
            key: "linked_docs",
            label: "Chứng từ liên kết",
            icon: <Link2 className="w-3.5 h-3.5" />,
            content: <MockLinkedDocsTab />,
          },
          {
            key: "accounting",
            label: "Hạch toán kế toán",
            icon: <BookOpen className="w-3.5 h-3.5" />,
            content: <MockAccountingTab />,
          },
          {
            key: "history",
            label: "Lịch sử & Kiểm duyệt",
            icon: <History className="w-3.5 h-3.5" />,
            badgeCount: 1,
            hideRightPanel: true,
            content: <MockHistoryTab />,
          },
        ]}
        leftTabs={activeTab === "details" ? goldenLeftTabs : undefined}
        activeLeftTabKey={activeLeftTab}
        onLeftTabChange={setActiveLeftTab}
        leftTabExtra={
          activeTab === "details" ? (
            <GoldenPreviewToggle
              value={previewMode}
              onChange={setPreviewMode}
            />
          ) : undefined
        }
        actionGroups={goldenActionGroups}
        actions={[
          {
            label: "Đóng",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Cập nhật ghi chú",
            primary: true,
            onClick: () => setOpen(false),
          },
        ]}
        rightPanel={<MockInvoiceRightPanel />}
      />
    </div>
  );
};
