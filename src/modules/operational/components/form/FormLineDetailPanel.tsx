import { useMemo } from "react";
import { DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { SearchInput } from "@/shared/components/SearchInput";
import { Combobox } from "@/shared/components/Combobox";
import { lineTypeOptions } from "@/modules/operational/utils/operationalHelpers";
import {
  getFilteredLines,
  useOperationalFormStore,
} from "@/modules/operational/hooks/useOperationalFormStore";
import { useT } from "@/core/i18n";
import type {
  FormVariant,
  LineDraft,
} from "@/modules/operational/utils/operationalHelpers";

interface FormLineDetailPanelProps {
  variant: FormVariant;
  isPurchaseLocked: boolean;
  purchaseFieldLocked: (
    field: "description" | "qty" | "expectedDate" | "status" | "poNo",
  ) => boolean;
  viewOnly?: boolean;
  purchaseInventoryOptions: Array<{
    value: string;
    label: string;
    sku: string;
    itemName: string;
    itemType?: string;
    note?: string;
    searchText?: string;
  }>;
}

/**
 * Cột trái của OperationalFormDrawer — bảng chi tiết dòng chứng từ.
 * Extracted từ OperationalFormDrawer.tsx (dòng 776–1004).
 */
export function FormLineDetailPanel({
  variant,
  isPurchaseLocked,
  purchaseFieldLocked,
  viewOnly,
  purchaseInventoryOptions,
}: FormLineDetailPanelProps) {
  const t = useT();
  const {
    lines,
    detailSearch,
    detailSortConfig,
    setDetailSearch,
    setDetailSortConfig,
    setLine,
    setLines,
    addLine,
    removeLine,
  } = useOperationalFormStore();

  const filteredLines = useMemo(
    () => getFilteredLines(lines, variant, detailSearch, detailSortConfig),
    [lines, variant, detailSearch, detailSortConfig],
  );

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [lines],
  );

  const filteredTotalAmount = useMemo(
    () =>
      filteredLines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [filteredLines],
  );

  const handleDetailSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (detailSortConfig?.key === key) {
      if (detailSortConfig.direction === "asc") direction = "desc";
      else direction = null;
    }
    setDetailSortConfig(direction ? { key, direction } : null);
  };

  return (
    <DrawerSection
      title={
        variant === "purchase" ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:justify-between pr-4 mt-2 sm:mt-0">
            <span className="shrink-0 mb-2 sm:mb-0">
              {t("Chi tiết")} (
              {detailSearch
                ? `${filteredLines.length}/${lines.length}`
                : lines.length}
              )
            </span>
            <div className="w-full sm:w-64 relative font-normal text-sm">
              <SearchInput
                className="w-full"
                placeholder={t("Tìm mã/tên, SL...")}
                value={detailSearch}
                onChange={setDetailSearch}
              />
            </div>
          </div>
        ) : (
          `${t("Chi tiết")} (${lines.length})`
        )
      }
      titleExtra={
        <span className="text-foreground font-semibold shrink-0">
          {t("Tổng")}:{" "}
          {Number(
            variant === "purchase" ? filteredTotalAmount : totalAmount,
          ).toLocaleString("vi-VN")}{" "}
          VND
        </span>
      }
    >
      <DocumentLineTable
        columns={[
          {
            key: "index",
            header: "#",
            width: 40,
            align: "center",
            cell: (_, idx) => (
              <span className="text-muted-foreground">{idx + 1}</span>
            ),
          },
          ...(variant === "purchase"
            ? [
                {
                  key: "item_code",
                  header: t("Mã linh kiện"),
                  minWidth: 140,
                  sortable: true,
                  cell: (line: LineDraft) => line.item_code || "—",
                },
              ]
            : []),
          {
            key: "item_name",
            header: t("Linh kiện / Tên hàng"),
            minWidth: 160,
            width: 180,
            sortable: true,
            cell: (line: LineDraft) => {
              return variant === "purchase" ? (
                <Combobox
                  options={purchaseInventoryOptions}
                  value={line.inventory_item_id}
                  readOnly={isPurchaseLocked}
                  onChange={(v) => {
                    const selected = purchaseInventoryOptions.find(
                      (item) => item.value === (v || ""),
                    );
                    setLines(
                      lines.map((draft) =>
                        draft.tempId !== line.tempId
                          ? draft
                          : {
                              ...draft,
                              inventory_item_id: v || "",
                              item_code: selected?.sku || "",
                              item_name: selected?.itemName || "",
                              description: selected
                                ? selected.note || ""
                                : draft.description,
                              line_type: selected
                                ? selected.itemType === "GOODS"
                                  ? "PRODUCT"
                                  : "PART"
                                : draft.line_type,
                            },
                      ),
                    );
                  }}
                  placeholder={t("Chọn linh kiện từ danh mục")}
                  searchPlaceholder={t("Tìm SKU / tên linh kiện...")}
                  emptyLabel={t("Không có linh kiện phù hợp")}
                  allowClear={false}
                />
              ) : (
                <div className="space-y-2">
                  <Combobox
                    options={lineTypeOptions}
                    value={line.line_type}
                    disabled={isPurchaseLocked}
                    onChange={(v) =>
                      setLine(line.tempId, "line_type", v || "SERVICE")
                    }
                    allowClear={false}
                  />
                  <input
                    className={inputCls}
                    placeholder={t("Mã hàng/SKU")}
                    value={line.item_code}
                    disabled={isPurchaseLocked}
                    onChange={(e) =>
                      setLine(line.tempId, "item_code", e.target.value)
                    }
                  />
                  <input
                    className={inputCls}
                    placeholder={t("Tên hàng/dịch vụ")}
                    value={line.item_name}
                    disabled={isPurchaseLocked}
                    onChange={(e) =>
                      setLine(line.tempId, "item_name", e.target.value)
                    }
                  />
                </div>
              );
            },
          },
          {
            key: "qty",
            header: t("Số lượng"),
            minWidth: 140,
            sortable: true,
            cell: (line: LineDraft) => (
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={line.qty}
                disabled={purchaseFieldLocked("qty")}
                onChange={(e) => setLine(line.tempId, "qty", e.target.value)}
              />
            ),
          },
          {
            key: "unit_price",
            header: t("Đơn giá"),
            minWidth: 180,
            sortable: true,
            cell: (line: LineDraft) => (
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={line.unit_price}
                disabled={isPurchaseLocked}
                onChange={(e) =>
                  setLine(line.tempId, "unit_price", e.target.value)
                }
              />
            ),
          },
          {
            key: "amount",
            header: t("Thành tiền"),
            minWidth: 180,
            sortable: true,
            cell: (line: LineDraft) => (
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={line.amount}
                disabled={isPurchaseLocked}
                onChange={(e) => setLine(line.tempId, "amount", e.target.value)}
              />
            ),
          },
          {
            key: "description",
            header: t("Mô tả"),
            minWidth: 240,
            sortable: false,
            cell: (line: LineDraft) => (
              <input
                className={inputCls}
                value={line.description}
                disabled={purchaseFieldLocked("description")}
                onChange={(e) =>
                  setLine(line.tempId, "description", e.target.value)
                }
                placeholder={t("Nhập mô tả")}
              />
            ),
          },
        ]}
        data={variant === "purchase" ? filteredLines : lines}
        getRowKey={(line) => line.tempId}
        sortConfig={variant === "purchase" ? detailSortConfig : undefined}
        onSort={variant === "purchase" ? handleDetailSort : undefined}
        onAddLine={() => addLine(variant)}
        onRemoveLine={
          lines.length > 1 && !isPurchaseLocked
            ? (idx) => {
                const targetId =
                  variant === "purchase"
                    ? filteredLines[idx].tempId
                    : lines[idx].tempId;
                removeLine(targetId, variant);
              }
            : undefined
        }
        disabled={isPurchaseLocked}
        viewOnly={viewOnly}
      />
    </DrawerSection>
  );
}
