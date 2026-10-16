import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  ExportHistoryLabels,
  ExportModeSelectorProps,
  ExportPeriodPickerLabels,
} from "@/shared/export-jobs";

/** Nhãn đã dịch (namespace `garage`, nhóm `exportJobs`) cho các thành phần xuất nền. */
export function useGarageExportLabels() {
  const { t } = useTranslation("garage");

  return useMemo(() => {
    const history: ExportHistoryLabels = {
      createdAt: t("exportJobs.table.createdAt", "Tạo lúc"),
      period: t("exportJobs.table.period", "Kỳ / Khoảng ngày"),
      allRange: t("exportJobs.allRange", "Tất cả"),
      fileName: t("exportJobs.table.fileName", "Tên file"),
      status: t("exportJobs.table.status", "Trạng thái"),
      ready: t("exportJobs.status.ready", "Sẵn sàng tải"),
      failed: t("exportJobs.status.failed", "Thất bại"),
      running: t("exportJobs.status.running", "Đang tạo"),
      expiresAt: t("exportJobs.table.expiresAt", "Hết hạn"),
      downloadAgain: t("exportJobs.downloadAgain", "Tải lại file"),
      downloading: t("exportJobs.downloading", "Đang tải..."),
      empty: t("exportJobs.emptyHistory", "Chưa có file xuất nào"),
    };

    const mode: ExportModeSelectorProps["labels"] = {
      title: t("exportJobs.modeLabel", "Chế độ xuất dữ liệu"),
      period: t("exportJobs.modePeriod", "Theo kỳ"),
      periodDesc: t(
        "exportJobs.modePeriodDesc",
        "Chọn khoảng thời gian theo kỳ hoặc ngày tùy chỉnh",
      ),
      currentFilter: t("exportJobs.modeCurrentFilter", "Theo filter hiện tại"),
      currentFilterDesc: t(
        "exportJobs.modeCurrentFilterDesc",
        "Giữ nguyên bộ lọc, tìm kiếm, sắp xếp và khoảng ngày đang xem trên bảng",
      ),
    };

    const periodLabels: ExportPeriodPickerLabels = {
      week: t("exportJobs.period.week", "Tuần"),
      month: t("exportJobs.period.month", "Tháng"),
      quarter: t("exportJobs.period.quarter", "Quý"),
      custom: t("exportJobs.period.custom", "Tùy chỉnh"),
      selectPlaceholder: t("exportJobs.period.select", "Chọn kỳ..."),
      dateFrom: t("exportJobs.period.dateFrom", "Từ ngày"),
      dateTo: t("exportJobs.period.dateTo", "Đến ngày"),
    };

    const messages = {
      downloading: t("exportJobs.downloadToast", "Đang tải file XLSX."),
      downloadFailed: t(
        "exportJobs.downloadFailed",
        "Không thể tải file XLSX, vui lòng thử lại.",
      ),
      startFailed: t(
        "exportJobs.startFailed",
        "Xuất Excel thất bại, vui lòng thử lại.",
      ),
    };

    return { t, history, mode, period: periodLabels, messages };
  }, [t]);
}
