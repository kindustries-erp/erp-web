import React from "react";
import { Download, FileArchive } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InvoiceExportConditionSection } from "../invoice-export-drawer/components/InvoiceExportConditionSection";
import { InvoiceExportDrawerShell } from "../invoice-export-drawer/components/InvoiceExportDrawerShell";
import { InvoiceExportFileTypeSelector } from "../invoice-export-drawer/components/InvoiceExportFileTypeSelector";
import { useInvoiceFileExportDrawer } from "./InvoiceFileExportDrawer.hook";
import type { InvoiceFileExportDrawerProps } from "./InvoiceFileExportDrawer.type";

export type { InvoiceFileExportDrawerProps };

/** Drawer "Xuất PDF / Tải ZIP hóa đơn": cùng khung & điều kiện với drawer Xuất Excel. */
export function InvoiceFileExportDrawer(props: InvoiceFileExportDrawerProps) {
  const { open, onClose, currentFilterSummary, selectedIds } = props;
  const { t } = useTranslation("erpInvoices");
  const hook = useInvoiceFileExportDrawer(props);

  return (
    <InvoiceExportDrawerShell
      open={open}
      onClose={onClose}
      title={t("erpInvoices:fileExportDrawer.title", "Xuất PDF hóa đơn")}
      subtitle={t(
        "erpInvoices:fileExportDrawer.subtitle",
        "Tải các file hóa đơn đúng loại đã chọn (PDF và/hoặc XML), theo kỳ, theo filter hoặc đã chọn",
      )}
      icon={<FileArchive className="w-4 h-4" />}
      leftTitle={t("erpInvoices:fileExportDrawer.infoTitle", "Thông tin tải")}
      leftContent={
        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
          <li>
            {t(
              "erpInvoices:fileExportDrawer.info1",
              "Hệ thống gom các file của hóa đơn trong phạm vi chọn thành 1 file .zip để tải về.",
            )}
          </li>
          <li>
            {t(
              "erpInvoices:fileExportDrawer.info2",
              "File được tạo trực tiếp, không lưu lịch sử. Hóa đơn thiếu file sẽ được liệt kê trong báo cáo kèm theo.",
            )}
          </li>
          <li>
            {t(
              "erpInvoices:fileExportDrawer.info3",
              'Chế độ "Theo filter hiện tại" chỉ áp dụng khoảng ngày, trạng thái và từ khóa tìm kiếm.',
            )}
          </li>
        </ul>
      }
      rightContent={
        <InvoiceExportConditionSection
          exportMode={hook.exportMode}
          onExportModeChange={hook.setExportMode}
          period={hook.period}
          onPeriodChange={hook.handlePeriodChange}
          periodOptions={hook.periodOptions}
          dateFrom={hook.dateFrom}
          onDateFromChange={(val) => hook.setDateFrom(val || "")}
          dateTo={hook.dateTo}
          onDateToChange={(val) => hook.setDateTo(val || "")}
          currentFilterSummary={currentFilterSummary}
          starting={hook.starting}
          onStartExport={hook.handleStart}
          modes={hook.modes}
          selectedCount={selectedIds.length}
          startIcon={<Download className="w-4 h-4 mr-1.5" />}
          startLabel={t("erpInvoices:fileExportDrawer.start", "Tải hóa đơn")}
        >
          <InvoiceExportFileTypeSelector
            value={hook.fileTypes}
            onChange={hook.setFileTypes}
            disabled={hook.starting}
          />
        </InvoiceExportConditionSection>
      }
    />
  );
}
