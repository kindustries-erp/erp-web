import React from "react";
import { useTranslation } from "react-i18next";
import { Eye, Car, FileClock } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { CopyButton } from "@/shared/components/CopyButton";
import type { GarageCaseCodeCellProps } from "./GarageCaseCodeCell.type";

export function GarageCaseCodeCell({
  item,
  onOpenDetail,
}: GarageCaseCodeCellProps) {
  const { t } = useTranslation(["garage", "common"]);
  const s = (item.tenTinhTrangDichVu || "").toLowerCase();
  const isDraft =
    s.includes("nháp") || s.includes("báo giá") || s.includes("chờ");

  const licensePlate = item.bienSoXe?.trim();
  const targetId = item.soChungTu || item.id;

  return (
    <div className="flex items-center gap-1.5 w-full min-w-0">
      {/* Nút Xem chi tiết (Con mắt) căn giữa theo chiều dọc của cả 2 dòng */}
      <Tooltip content={t("cases.actions.viewDetail", "Xem chi tiết")}>
        <button
          type="button"
          onClick={() => onOpenDetail(targetId)}
          className="h-6 w-6 p-0 flex-shrink-0 flex items-center justify-center opacity-60 hover:opacity-100 hover:text-primary transition-all cursor-pointer text-slate-400 focus:outline-hidden"
          aria-label={t("cases.actions.viewDetail", "Xem chi tiết")}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </Tooltip>

      {/* Khối 2 dòng: Số chứng từ & Biển số xe compact */}
      <div className="flex flex-col justify-center min-w-0 flex-1 py-0 gap-0">
        {/* Dòng 1: Số chứng từ + Copy + Status Icons */}
        <div className="flex items-center gap-1 w-full min-w-0 group/code">
          <Tooltip content={item.soChungTu || ""}>
            <button
              type="button"
              onClick={() => onOpenDetail(targetId)}
              className="font-medium text-primary text-left cursor-pointer hover:underline text-xs truncate max-w-[130px] focus:outline-hidden"
            >
              {item.soChungTu || "-"}
            </button>
          </Tooltip>
          {item.soChungTu && (
            <CopyButton
              value={item.soChungTu}
              variant="hover-only"
              tooltip={t("cases.actions.copyCode", "Copy mã")}
              copiedTooltip={t("cases.actions.copied", "Đã copy")}
              toastMessage={t(
                "cases.actions.copiedCode",
                "Đã copy số chứng từ",
              )}
              iconClassName="w-3 h-3"
              className="h-3.5 w-3.5 p-0"
            />
          )}

          {isDraft && (
            <Tooltip content={item.tenTinhTrangDichVu || ""}>
              <FileClock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            </Tooltip>
          )}
        </div>

        {/* Dòng 2: Biển số xe subtext */}
        {licensePlate && (
          <div className="flex items-center gap-1 min-w-0 group/plate">
            <Tooltip content={`Biển số xe: ${licensePlate}`}>
              <span className="truncate text-[10.5px] font-mono text-muted-foreground leading-tight select-text inline-flex items-center gap-1">
                <Car className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                <span>{licensePlate}</span>
              </span>
            </Tooltip>
            <CopyButton
              value={licensePlate}
              variant="hover-only"
              tooltip={t("cases.actions.copyLicensePlate", "Copy biển số")}
              copiedTooltip={t("cases.actions.copied", "Đã copy")}
              toastMessage={t(
                "cases.actions.copiedLicensePlate",
                "Đã copy biển số xe",
              )}
              iconClassName="w-2.5 h-2.5"
              className="h-3 w-3 p-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GarageCaseCodeCell;
