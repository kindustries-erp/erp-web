import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
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
} from "lucide-react";
import {
  MockInvoiceTable,
  MockInvoiceRightPanel,
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
        tabs={[
          {
            key: "details",
            label: "Chi tiết",
            icon: <FileText className="w-3.5 h-3.5" />,
          },
          {
            key: "financials",
            label: "Tài chính",
            icon: <CreditCard className="w-3.5 h-3.5" />,
          },
          {
            key: "linked_docs",
            label: "Chứng từ liên kết",
            icon: <Link2 className="w-3.5 h-3.5" />,
          },
          {
            key: "accounting",
            label: "Hạch toán kế toán",
            icon: <BookOpen className="w-3.5 h-3.5" />,
          },
          {
            key: "history",
            label: "Lịch sử & Kiểm duyệt",
            icon: <History className="w-3.5 h-3.5" />,
            badgeCount: 1,
          },
        ]}
        leftTabs={[
          {
            key: "detail",
            label: "Chi tiết",
            icon: <FileText className="w-3.5 h-3.5" />,
          },
          { key: "target", label: "Chi tiết theo đối tượng", badgeCount: 20 },
          { key: "items", label: "Chi tiết HHDV" },
          { key: "analysis", label: "Biến động & Phân tích" },
        ]}
        activeLeftTabKey={activeLeftTab}
        onLeftTabChange={setActiveLeftTab}
        leftTabExtra={
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
            onTabChange={(key) => setPreviewMode(key as any)}
          />
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
        leftPanel={
          <DrawerSection title="DANH SÁCH CHI TIẾT HÀNG HÓA & DỊCH VỤ">
            <MockInvoiceTable />
          </DrawerSection>
        }
        rightPanel={<MockInvoiceRightPanel />}
      />
    </div>
  );
};
