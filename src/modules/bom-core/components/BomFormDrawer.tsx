import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DataTable } from "@/shared/components/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { CellInput } from "@/shared/components/CellInput";
import { bomCoreApi, type ErpBom } from "@/modules/bom-core/api/bomCoreApi";
import {
  bomConfigApi,
  type BomCategory,
  type BomAttributeDef,
} from "@/modules/bom-core/api/bomConfigApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import toast from "react-hot-toast";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  Upload,
  Download,
  Loader2,
  Trash2,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  AlertCircle,
} from "lucide-react";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { FilterButton } from "@/shared/components/FilterPanel";

export interface BomLineForm {
  componentItemId: string;
  qtyRequired: string;
  uomId: string;
  scrapRate: string;
  notes: string;
}

export interface BomForm {
  bomCode: string;
  bomName: string;
  finishedGoodItemId: string;
  categoryId: string;
  attributes: Record<string, string>;
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
  uomId: "",
  scrapRate: "0",
  notes: "",
});

export const emptyForm = (): BomForm => ({
  bomCode: "",
  bomName: "",
  finishedGoodItemId: "",
  categoryId: "",
  attributes: {},
  version: "1.0",
  status: "ACTIVE",
  effectiveFrom: "",
  effectiveTo: "",
  notes: "",
  lines: [emptyLine()],
});

const formatNum = (
  val: string | number | undefined | null,
  decimals: number,
  defaultStr: string,
) => {
  if (val === undefined || val === null || val === "") return defaultStr;
  const num = parseFloat(String(val));
  if (!isNaN(num)) return num.toFixed(decimals);
  return String(val);
};

export function buildForm(bom: ErpBom): BomForm {
  return {
    bomCode: bom.bomCode ?? "",
    bomName: bom.bomName ?? "",
    finishedGoodItemId: bom.finishedGoodItemId ?? "",
    categoryId: bom.categoryId ?? "",
    attributes: bom.attributes ?? {},
    version: bom.version ?? "1.0",
    status: bom.status ?? "ACTIVE",
    effectiveFrom: bom.effectiveFrom ? bom.effectiveFrom.slice(0, 10) : "",
    effectiveTo: bom.effectiveTo ? bom.effectiveTo.slice(0, 10) : "",
    notes: bom.notes ?? "",
    lines: bom.lines?.length
      ? bom.lines.map((line) => ({
          componentItemId: line.componentItemId ?? "",
          qtyRequired: formatNum(line.qtyRequired, 1, "1"),
          uomId: line.uomId ?? "",
          scrapRate: formatNum(line.scrapRate, 2, "0"),
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
    categoryId: form.categoryId || undefined,
    attributes:
      form.attributes && Object.keys(form.attributes).length > 0
        ? form.attributes
        : undefined,
    version: form.version.trim() || "1.0",
    status: form.status || "ACTIVE",
    effectiveFrom: form.effectiveFrom || undefined,
    effectiveTo: form.effectiveTo || undefined,
    notes: form.notes.trim() || undefined,
    lines: form.lines.map((line) => ({
      componentItemId: line.componentItemId || undefined,
      qtyRequired: line.qtyRequired,
      uomId: line.uomId || undefined,
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
  fgItemOptions: Array<{ value: string; label: string }>;
  setItemSearch: (search: string) => void;
  setFgItemSearch: (search: string) => void;
  fetchNextItems: () => void;
  fetchNextFgItems: () => void;
  loadingItems: boolean;
  loadingFgItems: boolean;
  addLine: () => void;
  removeLine: (index: number) => void;
  updateLine: (index: number, patch: Partial<BomLineForm>) => void;
  itemUomMap?: Map<string, string>;
  uomOptions?: Array<{ value: string; label: string }>;
  onExport?: (format: "xlsx" | "csv") => void;
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
  fgItemOptions,
  setItemSearch,
  setFgItemSearch,
  fetchNextItems,
  fetchNextFgItems,
  loadingItems,
  loadingFgItems,
  addLine,
  removeLine,
  updateLine,
  itemUomMap,
  uomOptions,
  onExport,
}: BomFormDrawerProps) {
  const t = useT();
  const viewOnly = mode === "view";
  const isEditing = mode === "edit";
  const isLockedByProduction = Boolean(editing?.hasProduction);

  // Query BOM Categories
  const { data: allCategories = [] } = useQuery({
    queryKey: ["bom-config-categories"],
    queryFn: () => bomConfigApi.getCategories(),
    enabled: open,
  });

  const activeCategories = useMemo(() => {
    return allCategories.filter((c) => c.isActive !== false);
  }, [allCategories]);

  const categoryOptions = useMemo(() => {
    return activeCategories.map((c) => ({
      value: c.id,
      label: `${c.name} [${c.code}]`,
    }));
  }, [activeCategories]);

  const selectedCategory = useMemo(() => {
    return allCategories.find((c) => c.id === form.categoryId);
  }, [allCategories, form.categoryId]);

  const activeAttributeDefs = useMemo(() => {
    if (!selectedCategory?.attributeDefs) return [];
    return selectedCategory.attributeDefs
      .filter((d) => d.isActive !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [selectedCategory]);

  const handleCategoryChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      categoryId: val,
      attributes: {},
    }));
  };

  const handleAttributeChange = (attrDefId: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      attributes: {
        ...(prev.attributes || {}),
        [attrDefId]: val,
      },
    }));
  };

  const [submittingStatus, setSubmittingStatus] = React.useState<string | null>(
    null,
  );
  const [importing, setImporting] = React.useState(false);
  const [extraItemOptions, setExtraItemOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [colSortConfig, setColSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [colFilters, setColFilters] = React.useState<Record<string, string>>(
    {},
  );
  const [colSelectedFilters, setColSelectedFilters] = React.useState<
    Record<string, string[]>
  >({});

  const handleDownloadTemplate = async () => {
    try {
      const blob = await bomCoreApi.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BOM_Import_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error(t("Lỗi khi tải template"));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const parsedLines = await bomCoreApi.parseBomLines(file);
      const newLines = parsedLines.map((pl) => ({
        componentItemId: pl.componentItemId || "",
        qtyRequired: formatNum(pl.qtyRequired, 1, "1"),
        uomId: pl.uomId || "",
        scrapRate: formatNum(pl.scrapRate, 2, "0"),
        notes: pl.notes || "",
      }));

      const newExtraOptions = parsedLines.map((pl) => ({
        value: pl.componentItemId || "",
        label:
          pl.componentItemName ||
          pl.componentItemCode ||
          pl.componentItemId ||
          "",
      }));
      setExtraItemOptions((prev) => {
        const merged = [...prev, ...newExtraOptions];
        return merged.filter(
          (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
        );
      });

      setForm((prev) => ({
        ...prev,
        lines: newLines.length > 0 ? newLines : [emptyLine()],
      }));
      toast.success(t("Tải lên danh sách thành công"));
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || t("Lỗi khi tải lên file");
      toast.error(msg);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const mergedItemOptions = React.useMemo(() => {
    const combined = [...extraItemOptions, ...itemOptions];
    return combined.filter(
      (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
    );
  }, [itemOptions, extraItemOptions]);

  const mergedFgItemOptions = React.useMemo(() => {
    const combined = [...extraItemOptions, ...fgItemOptions];
    return combined.filter(
      (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
    );
  }, [fgItemOptions, extraItemOptions]);

  const getFilteredLinesForCol = React.useCallback(
    (excludeCol: string) => {
      return form.lines.filter((line) => {
        if (excludeCol !== "component") {
          if (
            colFilters.component &&
            !line.componentItemId
              .toLowerCase()
              .includes(colFilters.component.toLowerCase())
          )
            return false;
          if (
            colSelectedFilters.component?.length &&
            !colSelectedFilters.component.includes(line.componentItemId)
          )
            return false;
        }

        if (excludeCol !== "componentName") {
          if (
            colFilters.componentName ||
            colSelectedFilters.componentName?.length
          ) {
            const opt = mergedItemOptions.find(
              (o: any) => o.value === line.componentItemId,
            );
            const name = opt?.label?.split(" — ")[1] || opt?.label || "";
            if (
              colFilters.componentName &&
              !name
                .toLowerCase()
                .includes(colFilters.componentName.toLowerCase())
            )
              return false;
            if (
              colSelectedFilters.componentName?.length &&
              !colSelectedFilters.componentName.includes(name)
            )
              return false;
          }
        }

        if (excludeCol !== "qty") {
          if (colFilters.qty && !line.qtyRequired.includes(colFilters.qty))
            return false;
          if (
            colSelectedFilters.qty?.length &&
            !colSelectedFilters.qty.includes(line.qtyRequired)
          )
            return false;
        }

        if (excludeCol !== "uom") {
          if (
            colFilters.uom &&
            !line.uomId.toLowerCase().includes(colFilters.uom.toLowerCase())
          )
            return false;
          if (
            colSelectedFilters.uom?.length &&
            !colSelectedFilters.uom.includes(line.uomId)
          )
            return false;
        }

        if (excludeCol !== "scrap") {
          if (colFilters.scrap && !line.scrapRate.includes(colFilters.scrap))
            return false;
          if (
            colSelectedFilters.scrap?.length &&
            !colSelectedFilters.scrap.includes(line.scrapRate)
          )
            return false;
        }

        if (excludeCol !== "notes") {
          if (
            colFilters.notes &&
            !line.notes?.toLowerCase().includes(colFilters.notes.toLowerCase())
          )
            return false;
          if (
            colSelectedFilters.notes?.length &&
            !colSelectedFilters.notes.includes(line.notes || "")
          )
            return false;
        }

        return true;
      });
    },
    [form.lines, colFilters, colSelectedFilters, mergedItemOptions],
  );

  const sortedAndFilteredLines = React.useMemo(() => {
    let arr = getFilteredLinesForCol("none");

    if (colSortConfig) {
      const { key, direction } = colSortConfig;
      arr = [...arr].sort((a, b) => {
        let aVal: any = "";
        let bVal: any = "";

        if (key === "component") {
          aVal = a.componentItemId;
          bVal = b.componentItemId;
        } else if (key === "componentName") {
          const aOpt = mergedItemOptions.find(
            (o: any) => o.value === a.componentItemId,
          );
          aVal = aOpt?.label?.split(" — ")[1] || aOpt?.label || "";
          const bOpt = mergedItemOptions.find(
            (o: any) => o.value === b.componentItemId,
          );
          bVal = bOpt?.label?.split(" — ")[1] || bOpt?.label || "";
        } else if (key === "qty") {
          aVal = parseFloat(a.qtyRequired) || 0;
          bVal = parseFloat(b.qtyRequired) || 0;
        } else if (key === "uom") {
          aVal = a.uomId;
          bVal = b.uomId;
        } else if (key === "scrap") {
          aVal = parseFloat(a.scrapRate) || 0;
          bVal = parseFloat(b.scrapRate) || 0;
        } else if (key === "notes") {
          aVal = a.notes || "";
          bVal = b.notes || "";
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [colSortConfig, getFilteredLinesForCol]);

  React.useEffect(() => {
    setPage(1);
  }, [sortedAndFilteredLines.length]);

  const total = sortedAndFilteredLines.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const exportActions =
    editing && onExport
      ? [
          {
            label: t("common.exportExcel"),
            onClick: () => onExport("xlsx"),
            variant: "outline" as const,
            disabled: drawerLoading || saving,
          },
          {
            label: t("common.exportCsv"),
            onClick: () => onExport("csv"),
            variant: "outline" as const,
            disabled: drawerLoading || saving,
          },
        ]
      : [];

  const drawerActions =
    viewOnly || drawerLoading
      ? [
          ...exportActions,
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
            ...exportActions,
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

  const handleColSort = (key: string, state: "asc" | "desc" | "none") => {
    if (state === "none") setColSortConfig(null);
    else setColSortConfig({ key, direction: state });
  };

  const handleColSearch = (key: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleColFilterChange = (key: string, vals: string[]) => {
    setColSelectedFilters((prev) => ({ ...prev, [key]: vals }));
  };

  const componentOptions = React.useMemo(() => {
    const lines = getFilteredLinesForCol("component");
    const vals = new Set(lines.map((l) => l.componentItemId));
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => {
        const opt = mergedItemOptions.find((o: any) => o.value === v);
        const code = opt?.label?.split(" — ")[0] || v;
        return { label: code, value: v };
      });
  }, [getFilteredLinesForCol, mergedItemOptions]);

  const componentNameOptions = React.useMemo(() => {
    const lines = getFilteredLinesForCol("componentName");
    const vals = new Set(
      lines.map((l) => {
        const opt = mergedItemOptions.find(
          (o: any) => o.value === l.componentItemId,
        );
        return opt?.label?.split(" — ")[1] || opt?.label || "";
      }),
    );
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol, mergedItemOptions]);

  const qtyOptions = React.useMemo(() => {
    const lines = getFilteredLinesForCol("qty");
    const vals = new Set(lines.map((l) => l.qtyRequired));
    return Array.from(vals)
      .filter((v) => v !== "0")
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol]);

  const uomOptionsForFilter = React.useMemo(() => {
    const lines = getFilteredLinesForCol("uom");
    const vals = new Set(lines.map((l) => l.uomId));
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => {
        const opt = uomOptions?.find((o: any) => o.value === v);
        return { label: opt?.label || v, value: v };
      });
  }, [getFilteredLinesForCol, uomOptions]);

  const scrapOptions = React.useMemo(() => {
    const lines = getFilteredLinesForCol("scrap");
    const vals = new Set(lines.map((l) => l.scrapRate));
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol]);

  const notesOptions = React.useMemo(() => {
    const lines = getFilteredLinesForCol("notes");
    const vals = new Set(lines.map((l) => l.notes || ""));
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(colFilters).forEach((v) => {
      if (v) count++;
    });
    Object.values(colSelectedFilters).forEach((v) => {
      count += v?.length || 0;
    });
    return count;
  }, [colFilters, colSelectedFilters]);

  const clearAllFilters = () => {
    setColFilters({});
    setColSelectedFilters({});
  };

  const tableColumns = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="text-muted-foreground">{idx}</span>
        ),
      },
      {
        key: "component",
        header: (
          <TableColumnHeaderFilter
            title={t("Mã linh kiện")}
            sortState={
              colSortConfig?.key === "component"
                ? colSortConfig.direction
                : "none"
            }
            onSortChange={(state) => handleColSort("component", state)}
            searchValue={colFilters.component || ""}
            onSearchChange={(val) => handleColSearch("component", val)}
            selectedFilters={colSelectedFilters.component || []}
            onFilterChange={(vals) => handleColFilterChange("component", vals)}
            filterOptions={componentOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-middle",
        cell: (line: BomLineForm, _: number, meta: any) => {
          const {
            viewOnly,
            isLockedByProduction,
            form,
            updateLine,
            mergedItemOptions,
            itemUomMap,
            setItemSearch,
            fetchNextItems,
            loadingItems,
          } = meta;
          const trueIdx = form.lines.indexOf(line);
          return (
            <Combobox
              variant="spreadsheet"
              value={line.componentItemId}
              readOnly={viewOnly || isLockedByProduction}
              onChange={(value) => {
                const patch: Partial<BomLineForm> = {
                  componentItemId: value || "",
                };
                if (value && itemUomMap && itemUomMap.has(value)) {
                  patch.uomId = itemUomMap.get(value)!;
                }
                updateLine(trueIdx, patch);
              }}
              options={mergedItemOptions.map((opt: any) => ({
                ...opt,
                label: opt.label.split(" — ")[0],
                searchText: opt.label,
              }))}
              placeholder={t("Chọn linh kiện")}
              searchPlaceholder={t("Tìm SKU / tên linh kiện")}
              onSearch={setItemSearch}
              onScrollBottom={fetchNextItems}
              loading={loadingItems}
            />
          );
        },
      },
      {
        key: "componentName",
        header: (
          <TableColumnHeaderFilter
            title={t("Tên linh kiện")}
            sortState={
              colSortConfig?.key === "componentName"
                ? colSortConfig.direction
                : "none"
            }
            onSortChange={(state) => handleColSort("componentName", state)}
            searchValue={colFilters.componentName || ""}
            onSearchChange={(val) => handleColSearch("componentName", val)}
            selectedFilters={colSelectedFilters.componentName || []}
            onFilterChange={(vals) =>
              handleColFilterChange("componentName", vals)
            }
            filterOptions={componentNameOptions}
            align="center"
          />
        ),
        minSize: 250,
        enableResizing: true,
        headerClassName: "min-w-[250px]",
        className: "min-w-[250px] p-0 align-middle",
        cell: (line: BomLineForm, _: number, meta: any) => {
          const { mergedItemOptions } = meta;
          const opt = mergedItemOptions.find(
            (o: any) => o.value === line.componentItemId,
          );
          return (
            <div className="px-3 truncate text-sm">
              {opt?.label?.split(" — ")[1] || opt?.label || "—"}
            </div>
          );
        },
      },
      {
        key: "qty",
        header: (
          <TableColumnHeaderFilter
            title={t("Số lượng")}
            sortState={
              colSortConfig?.key === "qty" ? colSortConfig.direction : "none"
            }
            onSortChange={(state) => handleColSort("qty", state)}
            searchValue={colFilters.qty || ""}
            onSearchChange={(val) => handleColSearch("qty", val)}
            selectedFilters={colSelectedFilters.qty || []}
            onFilterChange={(vals) => handleColFilterChange("qty", vals)}
            filterOptions={qtyOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-middle",
        cell: (line: BomLineForm, _: number, meta: any) => {
          const { viewOnly, isLockedByProduction, form, updateLine } = meta;
          const trueIdx = form.lines.indexOf(line);
          return (
            <CellInput
              type="number"
              step="0.1"
              value={line.qtyRequired}
              disabled={viewOnly || isLockedByProduction}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  updateLine(trueIdx, { qtyRequired: val.toFixed(1) });
                }
              }}
              onValueChange={(val) => updateLine(trueIdx, { qtyRequired: val })}
              className="text-right tabular-nums font-semibold text-primary"
            />
          );
        },
      },
      {
        key: "uom",
        header: (
          <TableColumnHeaderFilter
            title={t("ĐVT")}
            sortState={
              colSortConfig?.key === "uom" ? colSortConfig.direction : "none"
            }
            onSortChange={(state) => handleColSort("uom", state)}
            searchValue={colFilters.uom || ""}
            onSearchChange={(val) => handleColSearch("uom", val)}
            selectedFilters={colSelectedFilters.uom || []}
            onFilterChange={(vals) => handleColFilterChange("uom", vals)}
            filterOptions={uomOptionsForFilter}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-middle",
        cell: (line: BomLineForm, _: number, meta: any) => {
          const {
            viewOnly,
            isLockedByProduction,
            form,
            updateLine,
            uomOptions,
          } = meta;
          const trueIdx = form.lines.indexOf(line);
          return (
            <Combobox
              variant="spreadsheet"
              value={line.uomId}
              readOnly={viewOnly || isLockedByProduction}
              onChange={(value) => updateLine(trueIdx, { uomId: value || "" })}
              options={uomOptions || []}
              placeholder={t("Chọn ĐVT")}
              allowClear={false}
            />
          );
        },
      },
      {
        key: "scrap",
        header: (
          <TableColumnHeaderFilter
            title={t("Tỷ lệ hao hụt (%)")}
            sortState={
              colSortConfig?.key === "scrap" ? colSortConfig.direction : "none"
            }
            onSortChange={(state) => handleColSort("scrap", state)}
            searchValue={colFilters.scrap || ""}
            onSearchChange={(val) => handleColSearch("scrap", val)}
            selectedFilters={colSelectedFilters.scrap || []}
            onFilterChange={(vals) => handleColFilterChange("scrap", vals)}
            filterOptions={scrapOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-middle",
        cell: (line: BomLineForm, _: number, meta: any) => {
          const { viewOnly, isLockedByProduction, form, updateLine } = meta;
          const trueIdx = form.lines.indexOf(line);
          return (
            <CellInput
              type="number"
              step="0.01"
              value={line.scrapRate}
              disabled={viewOnly || isLockedByProduction}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  updateLine(trueIdx, { scrapRate: val.toFixed(2) });
                }
              }}
              onValueChange={(val) => updateLine(trueIdx, { scrapRate: val })}
              className="text-right tabular-nums text-amber-700"
            />
          );
        },
      },
      {
        key: "notes",
        header: (
          <TableColumnHeaderFilter
            title={t("Ghi chú dòng")}
            sortState={
              colSortConfig?.key === "notes" ? colSortConfig.direction : "none"
            }
            onSortChange={(state) => handleColSort("notes", state)}
            searchValue={colFilters.notes || ""}
            onSearchChange={(val) => handleColSearch("notes", val)}
            selectedFilters={colSelectedFilters.notes || []}
            onFilterChange={(vals) => handleColFilterChange("notes", vals)}
            filterOptions={notesOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-middle",
        cell: (line: BomLineForm, _: number, meta: any) => {
          const { viewOnly, isLockedByProduction, form, updateLine } = meta;
          const trueIdx = form.lines.indexOf(line);
          return (
            <CellInput
              value={line.notes}
              disabled={viewOnly || isLockedByProduction}
              onValueChange={(val) => updateLine(trueIdx, { notes: val })}
            />
          );
        },
      },
    ],
    [t, colSortConfig, colFilters, mergedItemOptions],
  );

  const actionColumnDef = useMemo(() => {
    if (viewOnly || isLockedByProduction) return undefined;
    return {
      header: (
        <div className="text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          {t("XÓA")}
        </div>
      ),
      cell: (line: BomLineForm, _: number, meta: any) => {
        const { form, removeLine } = meta;
        const trueIdx = form.lines.indexOf(line);
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => removeLine(trueIdx)}
              title={t("common.deleteRow", "Xóa dòng")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    };
  }, [viewOnly, isLockedByProduction, t]);

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      collapsibleRightPanel={true}
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
      size="xl"
      error={saveError}
      loading={drawerLoading}
      leftPanel={
        <div className="h-full flex flex-col flex-1 min-h-0">
          {/* Hidden File Input for Excel Import */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
          />

          {/* Section: Định mức nguyên vật liệu */}
          <DrawerSection
            className="h-full flex flex-col flex-1 min-h-0 mb-0"
            title={
              <span className="shrink-0">
                {t("Định mức nguyên vật liệu")} (
                {sortedAndFilteredLines.length < form.lines.length
                  ? `${sortedAndFilteredLines.length}/${form.lines.length}`
                  : form.lines.length}
                )
              </span>
            }
            titleExtra={
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {!viewOnly && !isLockedByProduction && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-semibold gap-1"
                    onClick={addLine}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("common.addRow", "Thêm dòng")}
                  </Button>
                )}

                {!viewOnly && !isLockedByProduction && (
                  <ActionDropdown
                    align="end"
                    customTrigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold gap-1"
                      >
                        <span>{t("common.actions", "Thao tác")}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </Button>
                    }
                    items={[
                      {
                        groupLabel: t("EXCEL"),
                        items: [
                          {
                            label: t("Tải file mẫu Excel"),
                            icon: (
                              <Download className="w-4 h-4 text-emerald-600" />
                            ),
                            onClick: handleDownloadTemplate,
                          },
                          {
                            label: t("Nhập từ file Excel"),
                            icon: (
                              <FileSpreadsheet className="w-4 h-4 text-primary" />
                            ),
                            onClick: () => fileInputRef.current?.click(),
                          },
                        ],
                      },
                      ...(!editing || form.status === "DRAFT"
                        ? [
                            {
                              groupLabel: t("KHÁC"),
                              items: [
                                {
                                  label: t("Xóa tất cả"),
                                  icon: (
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  ),
                                  variant: "danger" as const,
                                  onClick: () => {
                                    if (
                                      window.confirm(
                                        t(
                                          "Bạn có chắc chắn muốn xóa tất cả linh kiện?",
                                        ),
                                      )
                                    ) {
                                      setForm((prev) => ({
                                        ...prev,
                                        lines: [emptyLine()],
                                      }));
                                    }
                                  },
                                },
                              ],
                            },
                          ]
                        : []),
                    ]}
                  />
                )}

                {activeFilterCount > 0 && (
                  <FilterButton
                    onClick={() => {}}
                    activeCount={activeFilterCount}
                    onClear={clearAllFilters}
                  />
                )}
              </div>
            }
          >
            <div className="flex-1 min-h-0 flex flex-col mt-1">
              <DataTable
                variant="spreadsheet"
                containerClassName="flex-1 min-h-[420px] max-h-[calc(100vh-270px)] overflow-auto"
                enableColumnResizing={true}
                items={sortedAndFilteredLines}
                getRowKey={(item) => String(form.lines.indexOf(item))}
                emptyLabel={t("Không có dữ liệu")}
                columns={tableColumns}
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPage={setPage}
                onPageSize={(val) => {
                  setPageSize(val);
                  setPage(1);
                }}
                tableMeta={{
                  viewOnly,
                  editing,
                  isEditing,
                  isLockedByProduction,
                  form,
                  updateLine,
                  removeLine,
                  mergedItemOptions,
                  itemUomMap,
                  uomOptions,
                  setItemSearch,
                  fetchNextItems,
                  loadingItems,
                }}
                actionsColumn={actionColumnDef}
              />
            </div>
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-4">
          {/* Cảnh báo khi BOM đã có sản xuất */}
          {isLockedByProduction && (
            <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {t(
                  "bom.lockedByProductionNotice",
                  "BOM đã phát sinh sản xuất: Chỉ có thể chỉnh sửa Hiệu lực đến và Ghi chú.",
                )}
              </span>
            </div>
          )}

          {/* Section: Thông tin chung */}
          <DrawerSection title={t("Thông tin chung")}>
            <div className="flex flex-col gap-3">
              <DrawerField label={t("Mã BOM")} required>
                <input
                  value={form.bomCode}
                  readOnly={viewOnly || !!editing || isLockedByProduction}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bomCode: e.target.value }))
                  }
                  className={inputCls}
                />
              </DrawerField>
              <DrawerField label={t("Version")} required>
                <input
                  value={form.version}
                  readOnly={viewOnly || !!editing || isLockedByProduction}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, version: e.target.value }))
                  }
                  className={inputCls}
                />
              </DrawerField>
              <DrawerField label={t("Tên BOM")} required>
                <input
                  value={form.bomName}
                  readOnly={viewOnly || !!editing || isLockedByProduction}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bomName: e.target.value }))
                  }
                  className={inputCls}
                />
              </DrawerField>
              <DrawerField label={t("Thành phẩm")}>
                <Combobox
                  value={form.finishedGoodItemId}
                  readOnly={viewOnly || !!editing || isLockedByProduction}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, finishedGoodItemId: value }))
                  }
                  options={mergedFgItemOptions}
                  placeholder={t("Chọn thành phẩm")}
                  searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
                  onSearch={setFgItemSearch}
                  onScrollBottom={fetchNextFgItems}
                  loading={loadingFgItems}
                  allowClear
                />
              </DrawerField>
              <DrawerField label={t("Hiệu lực từ")}>
                <DatePicker
                  value={form.effectiveFrom}
                  disabled={viewOnly || isLockedByProduction}
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
            </div>
          </DrawerSection>

          {/* Section: Danh mục & Thuộc tính */}
          <DrawerSection
            title={t(
              "bomConfig.categoryAndAttributes",
              "Danh mục & Thuộc tính",
            )}
          >
            <div className="flex flex-col gap-3">
              <DrawerField label={t("bomConfig.category", "Danh mục BOM")}>
                <Combobox
                  value={form.categoryId}
                  readOnly={viewOnly || isLockedByProduction}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  placeholder={t(
                    "bomConfig.selectCategory",
                    "— Chọn danh mục BOM —",
                  )}
                  searchPlaceholder={t("common.search", "Tìm kiếm danh mục...")}
                  allowClear
                />
              </DrawerField>

              {/* Dynamic Attributes Grid */}
              {selectedCategory && (
                <div className="pt-2 border-t border-border mt-1 flex flex-col gap-3">
                  {activeAttributeDefs.length > 0 ? (
                    activeAttributeDefs.map((attr: BomAttributeDef) => {
                      const val = form.attributes?.[attr.id] || "";
                      return (
                        <div key={attr.id}>
                          {attr.fieldType === "CHECKBOX" ? (
                            <div className="flex items-center gap-2 pt-1">
                              <Checkbox
                                id={`attr-${attr.id}`}
                                checked={val === "true"}
                                disabled={viewOnly || isLockedByProduction}
                                onCheckedChange={(c) =>
                                  handleAttributeChange(
                                    attr.id,
                                    c ? "true" : "false",
                                  )
                                }
                              />
                              <label
                                htmlFor={`attr-${attr.id}`}
                                className="text-xs font-medium cursor-pointer select-none text-foreground"
                              >
                                {attr.name}
                                {attr.isRequired && (
                                  <span className="text-destructive ml-1">
                                    *
                                  </span>
                                )}
                              </label>
                            </div>
                          ) : attr.fieldType === "SELECT" ? (
                            <DrawerField
                              label={attr.name}
                              required={attr.isRequired}
                            >
                              <Combobox
                                value={val}
                                readOnly={viewOnly || isLockedByProduction}
                                onChange={(v) =>
                                  handleAttributeChange(attr.id, v)
                                }
                                options={(attr.options || []).map((opt) => ({
                                  value: opt.value,
                                  label: `${opt.label} [${opt.value}]`,
                                }))}
                                placeholder={`— Chọn ${attr.name} —`}
                                allowClear
                              />
                            </DrawerField>
                          ) : attr.fieldType === "DATE" ? (
                            <DrawerField
                              label={attr.name}
                              required={attr.isRequired}
                            >
                              <DatePicker
                                value={val}
                                disabled={viewOnly || isLockedByProduction}
                                onChange={(v) =>
                                  handleAttributeChange(attr.id, v)
                                }
                                className="w-full"
                                placeholder="DD/MM/YYYY"
                              />
                            </DrawerField>
                          ) : attr.fieldType === "NUMBER" ? (
                            <DrawerField
                              label={attr.name}
                              required={attr.isRequired}
                            >
                              <input
                                type="number"
                                value={val}
                                readOnly={viewOnly || isLockedByProduction}
                                onChange={(e) =>
                                  handleAttributeChange(attr.id, e.target.value)
                                }
                                className={inputCls}
                                placeholder={`Nhập ${attr.name.toLowerCase()}...`}
                              />
                            </DrawerField>
                          ) : (
                            <DrawerField
                              label={attr.name}
                              required={attr.isRequired}
                            >
                              <input
                                type="text"
                                value={val}
                                readOnly={viewOnly || isLockedByProduction}
                                onChange={(e) =>
                                  handleAttributeChange(attr.id, e.target.value)
                                }
                                className={inputCls}
                                placeholder={`Nhập ${attr.name.toLowerCase()}...`}
                              />
                            </DrawerField>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-1">
                      {t(
                        "bomConfig.noAttrsForCategory",
                        "Danh mục này chưa cấu hình thuộc tính động nào.",
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DrawerSection>

          {/* Section: Ghi chú */}
          <DrawerSection title={t("Ghi chú")}>
            <div className="flex flex-col gap-3">
              <textarea
                value={form.notes}
                readOnly={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className={`${inputCls} min-h-[88px] resize-y`}
              />
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
