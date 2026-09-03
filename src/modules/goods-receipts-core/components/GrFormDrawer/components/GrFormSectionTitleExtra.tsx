import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import type { GrTableMode } from "../types";

interface GrFormSectionTitleExtraProps {
  drawer: UseGrDrawerReturn;
  tableMode: GrTableMode;
  activeFilterCount: number;
  onResetFilters: () => void;
  onOpenImport: () => void;
  t: (key: string, ...args: any[]) => string;
}

export function GrFormSectionTitleExtra({
  drawer,
  tableMode,
  activeFilterCount,
  onResetFilters,
  onOpenImport,
  t,
}: GrFormSectionTitleExtraProps) {
  const { form, setForm, viewOnly, editing, poDetail } = drawer;

  const clearFilterBtn =
    activeFilterCount > 0 ? (
      <FilterButton
        activeCount={activeFilterCount}
        onClick={() => {}}
        onClear={onResetFilters}
      />
    ) : null;

  return (
    <div className="flex items-center gap-2">
      {clearFilterBtn}
      {tableMode === "other-edit" && form.receiptType === "OTHER" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => {
              setForm((f) => ({
                ...f,
                lines: [
                  ...f.lines,
                  {
                    purchaseOrderLineId: "",
                    productionOrderMaterialId: "",
                    itemId: "",
                    itemCode: "",
                    itemName: "",
                    qtyReceived: "",
                    unitCost: "",
                  },
                ],
              }));
            }}
          >
            + {t("Thêm dòng")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={onOpenImport}
          >
            {t("Nhập từ Excel")}
          </Button>
        </>
      )}
      {!viewOnly && poDetail && editing?.status !== "POSTED" && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] px-2 leading-none text-muted-foreground hover:text-foreground"
            onClick={() =>
              setForm((f) => ({
                ...f,
                lines: f.lines.map((l) => ({ ...l, qtyReceived: "" })),
              }))
            }
          >
            {t("Đặt lại")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[11px] px-2 leading-none"
            onClick={() => {
              setForm((f) => {
                const newLines =
                  poDetail?.lines?.map((poLine) => {
                    const ordered = Number(poLine.qtyOrdered ?? 0);
                    const received = Number(poLine.qtyReceived ?? 0);
                    const remaining = Math.max(0, ordered - received);
                    return {
                      purchaseOrderLineId: poLine.id ?? "",
                      productionOrderMaterialId: "",
                      itemId: poLine.itemId ?? "",
                      itemCode: "",
                      itemName: poLine.itemName ?? "",
                      qtyReceived: remaining > 0 ? remaining.toString() : "",
                      unitCost: poLine.unitPrice ?? "",
                    };
                  }) ?? [];
                return { ...f, lines: newLines };
              });
            }}
          >
            {t("Nhập hết")}
          </Button>
        </>
      )}
    </div>
  );
}
