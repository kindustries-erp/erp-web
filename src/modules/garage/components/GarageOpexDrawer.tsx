import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import {
  garageOpexApi,
  type GarageOpexItem,
} from "@/modules/garage/api/garageOpexApi";
import toast from "react-hot-toast";

const CATEGORY_PRESETS: Array<{
  key: string;
  labelKey: string;
  defaultName: string;
}> = [
  { key: "NHAN_SU", labelKey: "categories.NHAN_SU", defaultName: "Nhân sự" },
  {
    key: "THUE_MAT_BANG",
    labelKey: "categories.THUE_MAT_BANG",
    defaultName: "Thuê mặt bằng & điện nước",
  },
  {
    key: "DIEN_NUOC",
    labelKey: "categories.DIEN_NUOC",
    defaultName: "Điện nước",
  },
  {
    key: "VAT_TU_TIEU_HAO",
    labelKey: "categories.VAT_TU_TIEU_HAO",
    defaultName: "Vật tư tiêu hao",
  },
  { key: "BAO_TRI", labelKey: "categories.BAO_TRI", defaultName: "Bảo trì" },
  {
    key: "KHAU_HAO",
    labelKey: "categories.KHAU_HAO",
    defaultName: "Khấu hao máy móc & thiết bị",
  },
  {
    key: "HOA_HONG_SALE",
    labelKey: "categories.HOA_HONG_SALE",
    defaultName: "Hoa hồng cho Sale",
  },
  {
    key: "HOA_HONG_DV",
    labelKey: "categories.HOA_HONG_DV",
    defaultName: "Hoa hồng cho DV",
  },
  { key: "KHAC", labelKey: "categories.KHAC", defaultName: "Khác" },
];

interface GarageOpexDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  setMode: (mode: "view" | "edit") => void;
  isCreate?: boolean;
  id?: string | null;
  initialData?: GarageOpexItem | null;
  onSuccess?: () => void;
}

export function GarageOpexDrawer({
  open,
  onClose,
  mode,
  setMode,
  isCreate = false,
  id,
  initialData,
  onSuccess,
}: GarageOpexDrawerProps) {
  const { t } = useTranslation("garage");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [categoryKey, setCategoryKey] = useState<string>("NHAN_SU");
  const [categoryName, setCategoryName] = useState<string>("Nhân sự");
  const [amount, setAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDetail = async (recordId: string) => {
    setLoading(true);
    try {
      const data = await garageOpexApi.getById(recordId);
      setPeriodYear(data.periodYear);
      setPeriodMonth(data.periodMonth);
      setCategoryKey(data.categoryKey);
      setCategoryName(data.categoryName);
      setAmount(String(data.amount || 0));
      setNote(data.note || "");
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải chi tiết chi phí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (isCreate) {
        setPeriodYear(currentYear);
        setPeriodMonth(currentMonth);
        setCategoryKey("NHAN_SU");
        setCategoryName(t("opex.categories.NHAN_SU", "Nhân sự"));
        setAmount("0");
        setNote("");
      } else if (initialData) {
        setPeriodYear(initialData.periodYear);
        setPeriodMonth(initialData.periodMonth);
        setCategoryKey(initialData.categoryKey);
        setCategoryName(initialData.categoryName);
        setAmount(String(initialData.amount || 0));
        setNote(initialData.note || "");
      } else if (id) {
        void fetchDetail(id);
      }
    }
  }, [open, isCreate, initialData, id, currentYear, currentMonth, t]);

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    const preset = CATEGORY_PRESETS.find((p) => p.key === key);
    if (preset) {
      setCategoryName(t(`opex.${preset.labelKey}`, preset.defaultName));
    }
  };

  const handleSave = async () => {
    const numAmount = Number(amount.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error(
        t(
          "opex.invalidAmount",
          "Số tiền phải là số hợp lệ và lớn hơn hoặc bằng 0",
        ),
      );
      return;
    }

    if (!categoryName.trim()) {
      toast.error(
        t(
          "opex.missingCategoryName",
          "Vui lòng nhập nội dung / diễn giải chi phí",
        ),
      );
      return;
    }

    setLoading(true);
    try {
      if (isCreate) {
        await garageOpexApi.create({
          periodYear: Number(periodYear),
          periodMonth: Number(periodMonth),
          categoryKey,
          categoryName: categoryName.trim(),
          amount: numAmount,
          note: note.trim() || undefined,
        });
        toast.success(t("opex.createSuccess", "Đã thêm chi phí vận hành mới"));
      } else if (id || initialData?.id) {
        const targetId = id || initialData!.id;
        await garageOpexApi.update(targetId, {
          periodYear: Number(periodYear),
          periodMonth: Number(periodMonth),
          categoryKey,
          categoryName: categoryName.trim(),
          amount: numAmount,
          note: note.trim() || undefined,
        });
        toast.success(t("opex.updateSuccess", "Đã cập nhật chi phí vận hành"));
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu chi phí vận hành");
    } finally {
      setLoading(false);
    }
  };

  const isView = mode === "view" && !isCreate;
  const isEditing = mode === "edit" || isCreate;

  const drawerTitle = isCreate
    ? t("opex.drawer.createTitle", "Thêm chi phí vận hành")
    : isView
      ? t("opex.drawer.viewTitle", "Chi tiết chi phí vận hành")
      : t("opex.drawer.editTitle", "Chỉnh sửa chi phí vận hành");

  const monthOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `${t("pnl.monthLabel", "Tháng")} ${i + 1}`,
      })),
    [t],
  );

  const yearOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear - 2 + i),
        label: `${t("pnl.yearLabel", "Năm")} ${currentYear - 2 + i}`,
      })),
    [currentYear, t],
  );

  const categoryOptions: ComboboxOption[] = useMemo(
    () =>
      CATEGORY_PRESETS.map((p) => ({
        value: p.key,
        label: t(`opex.${p.labelKey}`, p.defaultName),
      })),
    [t],
  );

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={!isCreate && isView ? () => setMode("edit") : undefined}
      title={drawerTitle}
      layout="1-column"
      size="md"
      confirmOnClose={isEditing}
      actions={
        isEditing
          ? [
              {
                label: t("opex.drawer.cancel", "Hủy"),
                onClick: onClose,
                disabled: loading,
              },
              {
                label: loading
                  ? t("common.saving", "Đang lưu...")
                  : isCreate
                    ? t("opex.drawer.create", "Tạo chi phí")
                    : t("opex.drawer.save", "Lưu thay đổi"),
                primary: true,
                onClick: handleSave,
                loading,
                disabled: loading,
              },
            ]
          : [
              {
                label: t("common.close", "Đóng"),
                onClick: onClose,
              },
            ]
      }
      leftPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection
            title={t("opex.drawer.sectionInfo", "Thông tin chi phí")}
            collapsible
            defaultCollapsed={false}
          >
            {/* Kỳ báo cáo: Năm + Tháng */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <DrawerField label={t("opex.drawer.periodMonth", "Tháng")}>
                <Combobox
                  options={monthOptions}
                  value={String(periodMonth)}
                  onChange={(val) => val && setPeriodMonth(Number(val))}
                  disabled={isView || loading}
                  allowClear={false}
                  placeholder={t("pnl.monthLabel", "Chọn tháng")}
                />
              </DrawerField>

              <DrawerField label={t("opex.drawer.periodYear", "Năm")}>
                <Combobox
                  options={yearOptions}
                  value={String(periodYear)}
                  onChange={(val) => val && setPeriodYear(Number(val))}
                  disabled={isView || loading}
                  allowClear={false}
                  placeholder={t("pnl.yearLabel", "Chọn năm")}
                />
              </DrawerField>
            </div>

            {/* Loại chi phí (Preset Category Combobox) */}
            <DrawerField
              label={t("opex.drawer.categoryKeyLabel", "Loại chi phí (*)")}
            >
              <Combobox
                options={categoryOptions}
                value={categoryKey}
                onChange={(val) => val && handleCategoryChange(val)}
                disabled={isView || loading}
                allowClear={false}
                placeholder={t(
                  "opex.drawer.selectCategory",
                  "— Chọn loại chi phí —",
                )}
              />
            </DrawerField>

            {/* Tên / Diễn giải chi tiết */}
            <DrawerField
              label={t(
                "opex.drawer.categoryNameLabel",
                "Nội dung / Diễn giải (*)",
              )}
            >
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={t(
                  "opex.drawer.categoryNamePlaceholder",
                  "Nhập mô tả chi tiết...",
                )}
                disabled={isView || loading}
                className={inputCls}
              />
            </DrawerField>

            {/* Số tiền (VND) */}
            <DrawerField
              label={t("opex.drawer.amountLabel", "Số tiền (VND) (*)")}
            >
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isView || loading}
                className={`${inputCls} tabular-nums text-right font-semibold`}
                placeholder="0"
                min="0"
                step="1000"
              />
            </DrawerField>

            {/* Ghi chú */}
            <DrawerField label={t("opex.drawer.noteLabel", "Ghi chú")}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t(
                  "opex.drawer.notePlaceholder",
                  "Ghi chú bổ sung nếu có...",
                )}
                disabled={isView || loading}
                className={`${inputCls} min-h-[80px] resize-y`}
                rows={3}
              />
            </DrawerField>
          </DrawerSection>
        </div>
      }
    />
  );
}
