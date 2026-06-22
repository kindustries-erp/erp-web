import React from "react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { SearchInput } from "@/shared/components/SearchInput";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import type { ErpBom } from "@/modules/bom-core/api/bomCoreApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";

export interface BomLineForm {
  componentItemId: string;
  qtyRequired: string;
  uom: string;
  scrapRate: string;
  notes: string;
}

export interface BomForm {
  bomCode: string;
  bomName: string;
  finishedGoodItemId: string;
  version: string;
  status: string;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
  lines: BomLineForm[];
}

export const emptyLine = (): BomLineForm => ({
  componentItemId: "",
  qtyRequired: "1",
  uom: "PCS",
  scrapRate: "0",
  notes: "",
});

export const emptyForm = (): BomForm => ({
  bomCode: "",
  bomName: "",
  finishedGoodItemId: "",
  version: "v1",
  status: "ACTIVE",
  effectiveFrom: "",
  effectiveTo: "",
  notes: "",
  lines: [emptyLine()],
});

export function buildForm(bom: ErpBom): BomForm {
  return {
    bomCode: bom.bomCode ?? "",
    bomName: bom.bomName ?? "",
    finishedGoodItemId: bom.finishedGoodItemId ?? "",
    version: bom.version ?? "v1",
    status: bom.status ?? "ACTIVE",
    effectiveFrom: bom.effectiveFrom ? bom.effectiveFrom.slice(0, 10) : "",
    effectiveTo: bom.effectiveTo ? bom.effectiveTo.slice(0, 10) : "",
    notes: bom.notes ?? "",
    lines: bom.lines?.length
      ? bom.lines.map((line) => ({
          componentItemId: line.componentItemId ?? "",
          qtyRequired: line.qtyRequired ?? "1",
          uom: line.uom ?? "PCS",
          scrapRate: line.scrapRate ?? "0",
          notes: line.notes ?? "",
        }))
      : [emptyLine()],
  };
}

export function toPayload(form: BomForm) {
  return {
    bomCode: form.bomCode.trim(),
    bomName: form.bomName.trim(),
    finishedGoodItemId: form.finishedGoodItemId || undefined,
    version: form.version.trim() || "v1",
    status: form.status || "ACTIVE",
    effectiveFrom: form.effectiveFrom || undefined,
    effectiveTo: form.effectiveTo || undefined,
    notes: form.notes.trim() || undefined,
    lines: form.lines.map((line) => ({
      componentItemId: line.componentItemId || undefined,
      qtyRequired: line.qtyRequired,
      uom: line.uom.trim() || "PCS",
      scrapRate: line.scrapRate || undefined,
      notes: line.notes.trim() || undefined,
    })),
  };
}

export interface BomFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onToggleEdit?: () => void;
  mode: DrawerMode;
  editing: ErpBom | null;
  form: BomForm;
  setForm: React.Dispatch<React.SetStateAction<BomForm>>;
  drawerLoading: boolean;
  saving: boolean;
  saveError: string | null;
  handleSave: (statusTarget?: string) => void;
  itemOptions: Array<{ value: string; label: string }>;
  setItemSearch: (search: string) => void;
  fetchNextItems: () => void;
  loadingItems: boolean;
  addLine: () => void;
  removeLine: (index: number) => void;
  updateLine: (index: number, patch: Partial<BomLineForm>) => void;
}

export function BomFormDrawer({
  open,
  onClose,
  onToggleEdit,
  mode,
  editing,
  form,
  setForm,
  drawerLoading,
  saving,
  saveError,
  handleSave,
  itemOptions,
  setItemSearch,
  fetchNextItems,
  loadingItems,
  addLine,
  removeLine,
  updateLine,
}: BomFormDrawerProps) {
  const t = useT();
  const viewOnly = mode === "view";
  const isEditing = mode === "edit";
  const [lineSearch, setLineSearch] = React.useState("");
  const [submittingStatus, setSubmittingStatus] = React.useState<string | null>(
    null,
  );

  const filteredLines = form.lines.filter((line) => {
    if (!lineSearch) return true;
    const term = lineSearch.toLowerCase();
    const componentStr = line.componentItemId.toLowerCase();
    const notesStr = (line.notes || "").toLowerCase();
    return componentStr.includes(term) || notesStr.includes(term);
  });

  const drawerActions =
    viewOnly || drawerLoading
      ? [
          {
            label: t("Đóng"),
            onClick: onClose,
            variant: "outline" as const,
            disabled: drawerLoading,
          },
        ]
      : form.status === "DRAFT" || !editing
        ? [
            {
              label: t("Hủy"),
              onClick: onClose,
              variant: "outline" as const,
              disabled: saving,
            },
            {
              label: editing ? t("Lưu Nháp") : t("Tạo Nháp"),
              variant: "outline" as const,
              loading: saving && submittingStatus === "DRAFT",
              disabled: saving,
              onClick: () => {
                setSubmittingStatus("DRAFT");
                handleSave("DRAFT");
              },
            },
            {
              label: editing ? t("Lưu và Áp dụng") : t("Tạo Mới"),
              primary: true,
              loading: saving && submittingStatus === "ACTIVE",
              disabled: saving,
              onClick: () => {
                setSubmittingStatus("ACTIVE");
                handleSave("ACTIVE");
              },
            },
          ]
        : [
            {
              label: t("Hủy"),
              onClick: onClose,
              variant: "outline" as const,
              disabled: saving,
            },
            {
              label: t("Lưu thay đổi"),
              primary: true,
              loading: saving && submittingStatus === "ACTIVE",
              disabled: saving,
              onClick: () => {
                setSubmittingStatus("ACTIVE");
                handleSave("ACTIVE");
              },
            },
          ];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={onToggleEdit}
      title={
        viewOnly
          ? t("Xem BOM")
          : isEditing
            ? t("Cập nhật BOM")
            : t("Tạo BOM mới")
      }
      titleExtra={
        form.status === "DRAFT" && (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
            {t("Nháp")}
          </span>
        )
      }
      subtitle={editing ? editing.bomCode : t("Định mức nguyên vật liệu")}
      actions={drawerActions}
      panelClassName="min-[1024px]:min-w-[1100px] min-[1280px]:min-w-[1280px]"
      rightPanelTitle={t("Thông tin chung")}
      error={saveError}
      loading={drawerLoading}
      leftPanel={
        <DrawerSection
          title={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:justify-between pr-4 mt-2 sm:mt-0">
              <span className="shrink-0 mb-2 sm:mb-0">
                {t("Định mức nguyên vật liệu")} (
                {lineSearch
                  ? `${filteredLines.length}/${form.lines.length}`
                  : form.lines.length}
                )
              </span>
              <div className="w-full sm:w-64 relative font-normal text-sm">
                <SearchInput
                  className="w-full"
                  placeholder={t("Tìm kiếm...")}
                  value={lineSearch}
                  onChange={setLineSearch}
                />
              </div>
            </div>
          }
        >
          <DocumentLineTable
            data={filteredLines}
            getRowKey={(_, idx) => String(idx)}
            viewOnly={viewOnly}
            onAddLine={isEditing ? undefined : addLine}
            onRemoveLine={isEditing ? undefined : removeLine}
            columns={[
              {
                key: "component",
                header: t("Linh kiện"),
                minWidth: 240,
                cell: (line, idx) => (
                  <Combobox
                    value={line.componentItemId}
                    readOnly={viewOnly || !!editing}
                    onChange={(value) =>
                      updateLine(idx, { componentItemId: value })
                    }
                    options={itemOptions}
                    placeholder={t("Chọn linh kiện")}
                    searchPlaceholder={t("Tìm SKU / tên linh kiện")}
                    onSearch={setItemSearch}
                    onScrollBottom={fetchNextItems}
                    loading={loadingItems}
                  />
                ),
              },
              {
                key: "qty",
                header: t("Số lượng"),
                minWidth: 90,
                cell: (line, idx) => (
                  <input
                    value={line.qtyRequired}
                    readOnly={viewOnly || !!editing}
                    onChange={(e) =>
                      updateLine(idx, { qtyRequired: e.target.value })
                    }
                    className={inputCls}
                  />
                ),
              },
              {
                key: "uom",
                header: t("ĐVT"),
                minWidth: 80,
                cell: (line, idx) => (
                  <input
                    value={line.uom}
                    readOnly={viewOnly || !!editing}
                    onChange={(e) => updateLine(idx, { uom: e.target.value })}
                    className={inputCls}
                  />
                ),
              },
              {
                key: "scrap",
                header: t("Tỷ lệ hao hụt (%)"),
                minWidth: 95,
                cell: (line, idx) => (
                  <input
                    value={line.scrapRate}
                    readOnly={viewOnly || !!editing}
                    onChange={(e) =>
                      updateLine(idx, { scrapRate: e.target.value })
                    }
                    className={inputCls}
                  />
                ),
              },
              {
                key: "notes",
                header: t("Ghi chú dòng"),
                minWidth: 150,
                cell: (line, idx) => (
                  <input
                    value={line.notes}
                    readOnly={viewOnly}
                    onChange={(e) => updateLine(idx, { notes: e.target.value })}
                    className={inputCls}
                  />
                ),
              },
            ]}
          />
        </DrawerSection>
      }
      rightPanel={
        <div className="flex flex-col gap-3">
          <DrawerField label={t("Mã BOM")} required>
            <input
              value={form.bomCode}
              readOnly={viewOnly || !!editing}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bomCode: e.target.value }))
              }
              className={inputCls}
            />
          </DrawerField>
          <DrawerField label={t("Version")} required>
            <input
              value={form.version}
              readOnly={viewOnly || !!editing}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, version: e.target.value }))
              }
              className={inputCls}
            />
          </DrawerField>
          <DrawerField label={t("Tên BOM")} required>
            <input
              value={form.bomName}
              readOnly={viewOnly || !!editing}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bomName: e.target.value }))
              }
              className={inputCls}
            />
          </DrawerField>
          <DrawerField label={t("Thành phẩm")}>
            <Combobox
              value={form.finishedGoodItemId}
              readOnly={viewOnly || !!editing}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, finishedGoodItemId: value }))
              }
              options={itemOptions}
              placeholder={t("Chọn thành phẩm")}
              searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
              onSearch={setItemSearch}
              onScrollBottom={fetchNextItems}
              loading={loadingItems}
              allowClear
            />
          </DrawerField>
          <DrawerField label={t("Hiệu lực từ")}>
            <DatePicker
              value={form.effectiveFrom}
              disabled={viewOnly}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, effectiveFrom: value }))
              }
              className="w-full"
              placeholder="DD/MM/YYYY"
            />
          </DrawerField>
          <DrawerField label={t("Hiệu lực đến")}>
            <DatePicker
              value={form.effectiveTo}
              disabled={viewOnly}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, effectiveTo: value }))
              }
              className="w-full"
              placeholder="DD/MM/YYYY"
            />
          </DrawerField>
          <DrawerField label={t("Ghi chú")}>
            <textarea
              value={form.notes}
              readOnly={viewOnly}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className={`${inputCls} min-h-[88px] resize-y`}
            />
          </DrawerField>
        </div>
      }
    />
  );
}
