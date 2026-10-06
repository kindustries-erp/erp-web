import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  DrawerField,
  DrawerRow,
} from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui/badge";
import {
  FileText,
  History,
  CreditCard,
  Link2,
  BookOpen,
  RefreshCw,
  FileSpreadsheet,
  Paperclip,
  Boxes,
  TrendingUp,
  Info,
  DollarSign,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
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

const meta: Meta<typeof V2StandardDrawer> = {
  title: "V2/Organisms/V2StandardDrawer",
  component: V2StandardDrawer,
  tags: ["autodocs"],
};

export default meta;

export const SingleColumnSimple = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 flex flex-col items-start gap-4">
      <V2Button onClick={() => setOpen(true)}>Mở Single Column Drawer</V2Button>
      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Biểu mẫu tạo danh mục sản phẩm"
        subtitle="Cấu hình nhanh các trường thông tin cơ bản"
        layout="1-column"
        actions={[
          {
            label: "Hủy bỏ",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Lưu thay đổi",
            primary: true,
            onClick: () => setOpen(false),
          },
        ]}
      >
        <div className="space-y-4">
          <DrawerSection title="Thông tin cơ bản">
            <DrawerField label="Mã danh mục" required>
              <input
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                placeholder="VD: CAT-001"
              />
            </DrawerField>
            <DrawerField label="Tên danh mục" required>
              <input
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                placeholder="VD: Linh kiện phụ tùng xe máy điện"
              />
            </DrawerField>
          </DrawerSection>
        </div>
      </V2StandardDrawer>
    </div>
  );
};

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
        leftTabs={
          activeTab === "details"
            ? [
                {
                  key: "detail",
                  label: "1. Chi tiết",
                  icon: <FileText className="w-3.5 h-3.5" />,
                },
                {
                  key: "target",
                  label: "2. Chi tiết theo đối tượng",
                  icon: <FileText className="w-3.5 h-3.5" />,
                  badgeCount: 20,
                },
                {
                  key: "items",
                  label: "3. Chi tiết HHDV",
                  icon: <Boxes className="w-3.5 h-3.5" />,
                },
                {
                  key: "analysis",
                  label: "4. Biến động & Phân tích",
                  icon: <TrendingUp className="w-3.5 h-3.5" />,
                },
              ]
            : undefined
        }
        activeLeftTabKey={activeLeftTab}
        onLeftTabChange={setActiveLeftTab}
        leftTabExtra={
          activeTab === "details" ? (
            <V2TabBar
              variant="button-group"
              tabs={[
                {
                  key: "template",
                  label: "Xem trước HĐ thuần",
                  icon: <FileText className="w-3.5 h-3.5" />,
                },
                {
                  key: "pdf",
                  label: "Tài liệu & PDF",
                  icon: <Paperclip className="w-3.5 h-3.5" />,
                },
              ]}
              activeTabKey={previewMode}
              onTabChange={(key) => setPreviewMode(key as "template" | "pdf")}
            />
          ) : undefined
        }
        actionGroups={[
          {
            groupLabel: "ĐỒNG BỘ",
            items: [
              {
                key: "sync-gdt",
                label: "Đồng bộ từ GDT",
                icon: <RefreshCw className="w-3.5 h-3.5" />,
                onClick: () => alert("Đang đồng bộ từ Tổng cục thuế (GDT)..."),
              },
            ],
          },
          {
            groupLabel: "XUẤT DỮ LIỆU",
            items: [
              {
                key: "export-excel",
                label: "Xuất Excel hóa đơn",
                icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
                onClick: () => alert("Đang xuất file Excel hóa đơn..."),
              },
            ],
          },
        ]}
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

export const InteractiveTabContentSwitching = () => {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6">
      <V2Button onClick={() => setOpen(true)}>
        Mở Demo Chuyển Đổi Tab & Nội Dung
      </V2Button>

      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Mặt hàng: Bộ điều khiển trung tâm VCU-X9"
        subtitle="Mã SKU: VCU-ELEC-2026-X9 • Đang kinh doanh"
        size="lg"
        layout="1-column"
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            key: "overview",
            label: "Thông tin tổng quan",
            icon: <Info className="w-3.5 h-3.5" />,
          },
          {
            key: "pricing",
            label: "Giá bán & Tồn kho",
            icon: <DollarSign className="w-3.5 h-3.5" />,
          },
          {
            key: "history",
            label: "Lịch sử cập nhật",
            icon: <History className="w-3.5 h-3.5" />,
            badgeCount: 3,
          },
        ]}
        actions={[
          {
            label: "Đóng",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
        ]}
      >
        {({ activeTabKey }) => (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-center justify-between">
              <span>
                🎯 Tab đang kích hoạt thông qua Render Props:{" "}
                <strong>{activeTabKey}</strong>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Hiệu ứng chuyển tab mượt mà với animate-in fade-in-50
              </span>
            </div>

            {activeTabKey === "overview" && (
              <DrawerSection title="THÔNG TIN KỸ THUẬT">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <DrawerRow
                    label="Mã vật tư"
                    value="VCU-ELEC-2026-X9"
                    copyable
                  />
                  <DrawerRow
                    label="Nhóm danh mục"
                    value="Linh kiện điện tử cao cấp"
                  />
                  <DrawerRow label="Đơn vị tính" value="Bộ (SET)" />
                  <DrawerRow
                    label="Tiêu chuẩn chống nước"
                    value="IP67 Waterproof"
                  />
                </div>
              </DrawerSection>
            )}

            {activeTabKey === "pricing" && (
              <DrawerSection title="BẢNG GIÁ & ĐỊNH MỨC TỒN">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <DrawerRow label="Giá nhập gần nhất" value="1.850.000 đ" />
                  <DrawerRow label="Giá bán niêm yết" value="2.450.000 đ" />
                  <DrawerRow label="Tồn kho thực tế" value="128 Bộ" />
                  <DrawerRow label="Tồn kho khả dụng" value="95 Bộ" />
                </div>
              </DrawerSection>
            )}

            {activeTabKey === "history" && (
              <DrawerSection title="AUDIT TRAIL">
                <div className="text-xs space-y-2">
                  <div className="p-2.5 rounded border border-border/70 bg-card">
                    <div className="font-semibold text-foreground">
                      Cập nhật giá bán lẻ
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      02/10/2026 bởi Quản lý kho • Tăng 50.000 đ
                    </div>
                  </div>
                  <div className="p-2.5 rounded border border-border/70 bg-card">
                    <div className="font-semibold text-foreground">
                      Nhập kho đợt 2 (50 Bộ)
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      28/09/2026 theo PO-202609-088
                    </div>
                  </div>
                </div>
              </DrawerSection>
            )}
          </div>
        )}
      </V2StandardDrawer>
    </div>
  );
};

export const RightPanelCollapseAnimationDemo = () => {
  const [open, setOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customerName, setCustomerName] = useState("Công ty TNHH Vận Tải Xanh");
  const [internalNote, setInternalNote] = useState(
    "Khách hàng VIP, ưu tiên giao phụ tùng trước 10h sáng.",
  );

  return (
    <div className="p-6">
      <V2Button onClick={() => setOpen(true)}>
        Mở Demo Expand/Collapse Right Column
      </V2Button>

      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Hồ sơ đối tác: KH-VIP-099"
        subtitle="Kiểm tra tương tác thu gọn / mở rộng cột phải và giữ nguyên form state"
        size="xl"
        layout="2-columns"
        collapsibleRightPanel={true}
        isRightPanelCollapsed={isCollapsed}
        onRightPanelCollapseChange={setIsCollapsed}
        actions={[
          {
            label: "Đóng",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Lưu dữ liệu",
            primary: true,
            onClick: () => alert(`Đã lưu: ${customerName}`),
          },
        ]}
        leftPanel={
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Trạng thái cột phải:{" "}
                <strong
                  className={
                    isCollapsed ? "text-amber-600" : "text-emerald-600"
                  }
                >
                  {isCollapsed
                    ? "Đã thu gọn (100% full width)"
                    : "Đang mở rộng (2 cột)"}
                </strong>
              </span>
              <V2Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <>
                    <PanelRightOpen className="w-3.5 h-3.5" />
                    Mở rộng cột phải
                  </>
                ) : (
                  <>
                    <PanelRightClose className="w-3.5 h-3.5" />
                    Thu gọn cột phải
                  </>
                )}
              </V2Button>
            </div>

            <DrawerSection title="THÔNG TIN KHÁCH HÀNG">
              <DrawerField label="Tên khách hàng" required>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                />
              </DrawerField>
              <DrawerField label="Số điện thoại" required>
                <input
                  defaultValue="0988 123 456"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                />
              </DrawerField>
              <DrawerField label="Địa chỉ xuất hóa đơn">
                <input
                  defaultValue="Tầng 12, Tòa nhà Liouni Tower, Quận 7, TP.HCM"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                />
              </DrawerField>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <DrawerSection title="GHI CHÚ NỘI BỘ (CỘT PHẢI)">
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px]">
                Dữ liệu trong cột này được giữ nguyên vẹn kể cả khi bạn thu gọn
                và mở rộng lại nhờ cơ chế CSS transition không unmount DOM.
              </p>
              <textarea
                rows={4}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-foreground resize-none"
              />
              <div className="p-2 rounded bg-muted/50 text-[11px] text-muted-foreground">
                💡 Bạn cũng có thể bấm biểu tượng Chevron ở góc phải Header để
                thu gọn / mở rộng.
              </div>
            </div>
          </DrawerSection>
        }
      />
    </div>
  );
};
