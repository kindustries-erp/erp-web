import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useTranslation } from "react-i18next";
import { getPastMonthPresets } from "@/shared/utils/datePresets";
import {
  useGarageBulkSyncStatus,
  useStartGarageBulkSync,
} from "../../../hooks/useGarageBulkSync";
import { GarageCaseSyncDrawerProps } from "./GarageCaseSyncDrawer.type";

/** Preset mặc định: 6 tháng gần nhất tính từ hôm nay (backend tách theo tháng). */
export const RECENT_MONTHS_PRESET = "recent-6m";
const RECENT_MONTHS = 6;

/** Từ đúng ngày này 6 tháng trước (cuối tháng thì kẹp) đến hôm nay, `yyyy-MM-dd`. */
export function getRecentMonthsRange(today: Date = new Date()): {
  from: string;
  to: string;
} {
  return {
    from: format(subMonths(today, RECENT_MONTHS), "yyyy-MM-dd"),
    to: format(today, "yyyy-MM-dd"),
  };
}

export function useGarageCaseSyncDrawerLogic(props: GarageCaseSyncDrawerProps) {
  const { open, onSuccess, mode = "all", title, description } = props;
  const { t } = useTranslation("garage");

  const { mutateAsync: startBulkSync, isPending: isStarting } =
    useStartGarageBulkSync();
  const { data: bulkStatus } = useGarageBulkSyncStatus(open, onSuccess);
  const isRunning = bulkStatus?.status === "running";

  const initialRange = useMemo(() => getRecentMonthsRange(), []);
  const [selectedPreset, setSelectedPreset] =
    useState<string>(RECENT_MONTHS_PRESET);
  const [dateFrom, setDateFrom] = useState<string>(initialRange.from);
  const [dateTo, setDateTo] = useState<string>(initialRange.to);
  const [force, setForce] = useState<boolean>(false);
  const [includeDetails, setIncludeDetails] = useState<boolean>(true);

  const isSyncing = isStarting || isRunning;
  const canSync = !isSyncing && (!!dateFrom || !!dateTo);

  const modalTitle =
    title ||
    (mode === "all"
      ? t("cases.syncDrawer.titleAll", "Đồng bộ dữ liệu Garage")
      : mode === "gross-profit"
        ? t("cases.syncDrawer.titleGrossProfit", "Đồng bộ Lợi nhuận gộp Garage")
        : mode === "case-details"
          ? t(
              "cases.syncDrawer.titleCaseDetails",
              "Đồng bộ Chi tiết vật tư & Nhân công",
            )
          : t("cases.syncDrawer.titleCases", "Đồng bộ Cases từ Garage"));

  const modalDesc =
    description ||
    (mode === "all"
      ? t(
          "cases.syncDrawer.descAll",
          "Đồng bộ toàn bộ danh sách phiếu dịch vụ, chi phí - doanh thu, lợi nhuận gộp và chi tiết vật tư phụ tùng từ phần mềm Garage về ERP.",
        )
      : mode === "gross-profit"
        ? t(
            "cases.syncDrawer.descGrossProfit",
            "Chọn khoảng thời gian để cập nhật lại dữ liệu Doanh thu - Chi phí - Lợi nhuận gộp từ hệ thống Garage.",
          )
        : mode === "case-details"
          ? t(
              "cases.syncDrawer.descCaseDetails",
              "Tải chi tiết từng dòng vật tư, phụ tùng và công thợ của các phiếu dịch vụ từ hệ thống Garage về ERP.",
            )
          : t(
              "cases.syncDrawer.descCases",
              "Chọn khoảng thời gian để đồng bộ phiếu dịch vụ (Cases) và doanh thu chi phí từ hệ thống Garage về ERP.",
            ));

  const presetOptions = useMemo(
    () => [
      {
        value: RECENT_MONTHS_PRESET,
        label: t("cases.syncDrawer.recent6Months", "6 tháng gần nhất"),
      },
      ...getPastMonthPresets(2),
    ],
    [t],
  );

  const handlePresetChange = (val: string) => {
    setSelectedPreset(val);
    if (!val) return;
    if (val === RECENT_MONTHS_PRESET) {
      const range = getRecentMonthsRange();
      setDateFrom(range.from);
      setDateTo(range.to);
    } else if (val.startsWith("month-")) {
      const parts = val.split("-");
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const d = new Date(y, m, 1);
      setDateFrom(format(startOfMonth(d), "yyyy-MM-dd"));
      setDateTo(format(endOfMonth(d), "yyyy-MM-dd"));
    }
  };

  useEffect(() => {
    if (open) {
      const range = getRecentMonthsRange();
      setSelectedPreset(RECENT_MONTHS_PRESET);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  }, [open]);

  /** Bấm một lần: backend chạy nền trên mọi chi nhánh; drawer giữ mở để theo dõi tiến độ. */
  const handleSync = async () => {
    if (!canSync) return;
    try {
      await startBulkSync({
        scope: mode,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        includeDetails: mode === "all" ? includeDetails : undefined,
        forceDetails: force,
      });
    } catch {
      // Lỗi đã được báo trong mutation
    }
  };

  return {
    t,
    bulkStatus,
    isSyncing,
    selectedPreset,
    dateFrom,
    dateTo,
    force,
    includeDetails,
    canSync,
    modalTitle,
    modalDesc,
    presetOptions,
    setSelectedPreset,
    setDateFrom,
    setDateTo,
    setForce,
    setIncludeDetails,
    handlePresetChange,
    handleSync,
  };
}
