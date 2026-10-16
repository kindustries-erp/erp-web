import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";

export interface InvoiceExportDrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  /** Tiêu đề section bên trái (lịch sử / tóm tắt) khi dùng leftContent đơn giản. */
  leftTitle?: string;
  leftContent?: React.ReactNode;
  /** Khối nội dung / danh sách DrawerSection bên trái (vd: Cột xuất + Lịch sử xuất). */
  leftSections?: React.ReactNode;
  /** Cột phải: thường là InvoiceExportConditionSection. */
  rightContent: React.ReactNode;
}

/** Khung drawer 2 cột dùng chung cho Xuất Excel / Xuất PDF-ZIP hóa đơn. */
export function InvoiceExportDrawerShell({
  open,
  onClose,
  title,
  subtitle,
  icon,
  leftTitle,
  leftContent,
  leftSections,
  rightContent,
}: InvoiceExportDrawerShellProps) {
  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          {leftSections ? (
            leftSections
          ) : (
            <DrawerSection
              title={leftTitle || ""}
              collapsible
              defaultCollapsed={false}
            >
              {leftContent}
            </DrawerSection>
          )}
        </div>
      }
      rightPanel={<div className="space-y-4">{rightContent}</div>}
    />
  );
}
