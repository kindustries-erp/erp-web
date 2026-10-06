import React from "react";
import {
  DrawerSection,
  DrawerRow,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { formatGMT7 } from "@/shared/utils/format";
import { useTranslation } from "react-i18next";

export interface GarageCaseGeneralInfoSectionProps {
  caseData: any;
  editMode?: boolean;
  erpNotes?: string;
  onErpNotesChange?: (val: string) => void;
}

export function GarageCaseGeneralInfoSection({
  caseData,
  editMode = false,
  erpNotes = "",
  onErpNotesChange,
}: GarageCaseGeneralInfoSectionProps) {
  const { t } = useTranslation("garage");

  if (!caseData) return null;

  const kgaraSource =
    caseData.kgaraClassification || caseData.rawData?.NguonGocKhachHangName;

  return (
    <DrawerSection
      title={t("cases.drawer.generalInfo", "Thông tin chung")}
      collapsible
      defaultCollapsed={false}
    >
      <DrawerRow
        label={t("cases.drawer.caseCode", "Số chứng từ")}
        value={caseData.soChungTu || "—"}
      />
      <DrawerRow
        label={t("cases.drawer.plate", "Biển số xe")}
        value={caseData.bienSoXe || "—"}
      />
      <DrawerRow
        label={t("cases.drawer.customer", "Khách hàng")}
        value={caseData.khachHangName || "—"}
      />
      <DrawerRow
        label={t("cases.drawer.serviceStatus", "Trạng thái")}
        value={caseData.tenTinhTrangDichVu || "—"}
      />
      <DrawerRow
        label={t("cases.drawer.creationDate", "Ngày phát sinh")}
        value={formatGMT7(caseData.ngayPhatSinh, "date")}
      />

      {/* Nguồn gốc xe (KGara) - Read-only in both View & Edit */}
      {kgaraSource && (
        <DrawerRow
          label={t("cases.drawer.kgaraClassification", "Nguồn gốc xe (KGara)")}
          value={
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {kgaraSource}
              </span>
              {caseData.kgaraClassificationCode && (
                <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                  {caseData.kgaraClassificationCode}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/70 italic">
                (
                {t(
                  "cases.drawer.kgaraClassificationHint",
                  "Đồng bộ từ KGara - Bất biến",
                )}
                )
              </span>
            </div>
          }
        />
      )}

      {/* Ghi chú ERP */}
      {!editMode ? (
        <DrawerRow
          label={t("cases.drawer.erpNotes", "Ghi chú ERP")}
          value={caseData.erpNotes || "—"}
        />
      ) : (
        <DrawerField
          label={t("cases.configDrawer.erpNotesLabel", "Ghi chú ERP")}
        >
          <textarea
            className={inputCls}
            rows={3}
            value={erpNotes}
            onChange={(e) => onErpNotesChange?.(e.target.value)}
            placeholder={t(
              "cases.configDrawer.erpNotesPlaceholder",
              "Nhập ghi chú nghiệp vụ nội bộ trên ERP...",
            )}
          />
        </DrawerField>
      )}
    </DrawerSection>
  );
}
