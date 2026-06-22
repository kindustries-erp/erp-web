import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { format } from "date-fns";
import { useUIStore } from "@/core/config/uiStore";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useAppStore } from "@/core/config/appStore";
import { bomCoreApi, type ErpBom } from "@/modules/bom-core/api/bomCoreApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import {
  useGiDrawer,
  type GiLineForm,
} from "@/modules/goods-issues-core/hooks/useGiDrawer";

type ProductionDrawerForm = ReturnType<typeof emptyForm>;

export interface BomLikeLine {
  id?: string;
  path?: string;
  /** Effective item id (may be alternativeItemId when override is set) */
  itemId?: string;
  itemName?: string | null;
  itemCode?: string | null;
  qtyRequired?: string | null;
  qtyIssued?: string | null;
  uom?: string | null;
  /** Original BOM component item id (before any override) */
  originalItemId?: string | null;
  alternativeItemId?: string | null;
  alternativeItemName?: string | null;
  alternativeItemCode?: string | null;
  level?: number;
  isLeaf?: boolean;
}

interface BomLikeItem {
  id?: string;
  status?: string | null;
  finishedGoodItemId?: string | null;
  finishedGoodItemName?: string | null;
  lines?: BomLikeLine[];
}

export interface ExplosionNode {
  path?: string;
  itemId: string;
  itemName?: string;
  itemCode?: string;
  qtyRequired: number | string;
  uom?: string;
  isLeaf?: boolean;
  children?: ExplosionNode[];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybe = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };
    return maybe.response?.data?.message || maybe.message || fallback;
  }
  return fallback;
}

export interface UseProductionOrderDrawerProps {
  open: boolean;
  editing: ErpProductionOrder | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const emptyForm = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  return {
    finishedGoodItemId: "",
    qtyToProduce: "1",
    warehouseCode: "",
    referenceNo: "",
    plannedStartDate: today,
    plannedEndDate: today,
    bomId: "",
  };
};

export function useProductionOrderDrawer({
  open,
  editing,
  onClose,
  onSaved,
}: UseProductionOrderDrawerProps) {
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useAppStore((s) => s.navigate);

  const [form, setForm] = useState<ProductionDrawerForm>(emptyForm());
  const [itemOptions, setItemOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [bomLines, setBomLines] = useState<BomLikeLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGeneralInfo, setShowGeneralInfo] = useState(true);
  const [balances, setBalances] = useState<
    Record<
      string,
      { qtyOnHand: number; qtyReserved: number; availableQty: number }
    >
  >({});
  const [localSearch, setLocalSearch] = useState("");
  const [bomLoading, setBomLoading] = useState(false);
  const bomLoadRequestRef = useRef(0);
  const issueDrawer = useGiDrawer({ invalidateWarehouseQuery: true });
  const [startQty, setStartQty] = useState("1");

  // BOM selection: list of BOMs available for the selected finished good
  const [availableBoms, setAvailableBoms] = useState<ErpBom[]>([]);
  const [completeQty, setCompleteQty] = useState("1");
  const [completeUnitCost, setCompleteUnitCost] = useState("0");
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showLackingOnly, setShowLackingOnly] = useState(false);

  // ── Alternative item overrides: bomLineId (or componentItemId) → alternativeItemId
  const [alternativeItems, setAlternativeItems] = useState<
    Record<string, string>
  >({});
  const [lineNotes, setLineNotes] = useState<Record<string, string>>({});
  const [altItemSearch, setAltItemSearch] = useState("");

  const {
    data: altItemsData,
    fetchNextPage: fetchNextAltItems,
    isFetchingNextPage: loadingAltItems,
  } = useBasicMasterInfinite({
    search: altItemSearch,
    limit: 50,
    entities: "inventoryItems",
  });

  // Persistent cache: id -> label, survives search-term changes so selected
  // items never lose their labels when the API page no longer includes them.
  const cachedAltItems = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!altItemsData) return;
    altItemsData.pages.forEach((p) => {
      (p.items.inventoryItems || []).forEach((i) => {
        cachedAltItems.current[i.id] = `${i.sku} — ${i.itemName}`;
      });
    });
  }, [altItemsData]);

  // Populate cache from editing BOM when it loads (edit/view mode)
  useEffect(() => {
    if (!editing) return;
    const sourceLines = editing.lines || editing.materials || [];
    sourceLines.forEach((line) => {
      if (line.alternativeItemId && line.alternativeItemName) {
        cachedAltItems.current[line.alternativeItemId] =
          line.alternativeItemName;
      }
    });
  }, [editing]);

  const altItemOptions = useMemo(() => {
    const map = new Map<string, string>(
      altItemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map(
          (i) => [i.id, `${i.sku} — ${i.itemName}`] as [string, string],
        ),
      ) || [],
    );

    // Ensure currently selected alternative items are always present
    Object.values(alternativeItems).forEach((altId) => {
      if (altId && !map.has(altId)) {
        map.set(altId, cachedAltItems.current[altId] || "NVL Thay Thế");
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [altItemsData, alternativeItems]);

  const setAlternativeItem = useCallback(
    (lineOriginalItemId: string, altItemId: string) => {
      setAlternativeItems((prev) => ({
        ...prev,
        [lineOriginalItemId]: altItemId,
      }));
    },
    [],
  );

  const clearAlternativeItem = useCallback((lineOriginalItemId: string) => {
    setAlternativeItems((prev) => {
      const next = { ...prev };
      delete next[lineOriginalItemId];
      return next;
    });
  }, []);

  const setLineNote = useCallback(
    (lineOriginalItemId: string, note: string) => {
      setLineNotes((prev) => ({
        ...prev,
        [lineOriginalItemId]: note,
      }));
    },
    [],
  );

  const loadItems = useCallback(async () => {
    try {
      const res = await bomCoreApi.list({ pageSize: 500 });
      const uniqueFgs = new Map<string, { value: string; label: string }>();
      res.items.forEach((bom: BomLikeItem) => {
        if (bom.status === "ACTIVE" && bom.finishedGoodItemId) {
          uniqueFgs.set(bom.finishedGoodItemId, {
            value: bom.finishedGoodItemId,
            label: bom.finishedGoodItemName || bom.finishedGoodItemId,
          });
        }
      });
      setItemOptions(Array.from(uniqueFgs.values()));
    } catch {
      setItemOptions([]);
    }
  }, []);

  useEffect(() => {
    const requestId = ++bomLoadRequestRef.current;

    if (editing?.finishedGoodItemId) {
      const sourceLines = editing.lines || editing.materials || [];
      const overridesFromMetadata = Array.isArray(
        editing.outputMetadata?.materialOverrides,
      )
        ? editing.outputMetadata.materialOverrides
        : [];
      const restoredAlternativeItems = Object.fromEntries(
        overridesFromMetadata
          .filter((ov: { alternativeItemId?: string }) => ov.alternativeItemId)
          .map(
            (ov: {
              path?: string;
              originalItemId?: string;
              alternativeItemId: string;
            }) => [ov.path || ov.originalItemId, ov.alternativeItemId],
          ),
      );
      setAlternativeItems(restoredAlternativeItems);

      setBomLoading(true);
      const resolveAndLoad = form.bomId
        ? Promise.resolve(form.bomId)
        : bomCoreApi
            .list({
              pageSize: 1,
              finishedGoodItemId: editing.finishedGoodItemId,
            })
            .then((res) => {
              const bom = res.items[0] as BomLikeItem | undefined;
              return bom?.id ?? null;
            });

      resolveAndLoad
        .then((bomId) => {
          if (bomLoadRequestRef.current !== requestId) return;
          if (!bomId) {
            setBomLines([]);
            setBalances({});
            return;
          }

          return productionCoreApi
            .explodePreview(bomId, Number(form.qtyToProduce || 1))
            .then((previewRes) => {
              if (bomLoadRequestRef.current !== requestId) return;

              const sourceLineMap = new Map(
                sourceLines.map((line) => [
                  line.itemId, // Map by effective item id to distinguish overridden and non-overridden identical original items
                  line,
                ]),
              );

              // Helper to flatten the tree
              const flattenTree = (
                nodes: ExplosionNode[],
                level = 0,
              ): BomLikeLine[] => {
                let result: BomLikeLine[] = [];
                for (const n of nodes) {
                  const linePath = n.path || n.itemId;
                  const selectedAltItemId =
                    restoredAlternativeItems[linePath] ||
                    restoredAlternativeItems[n.itemId];
                  const effectiveItemId = selectedAltItemId || n.itemId;
                  const matched = sourceLineMap.get(effectiveItemId);
                  result.push({
                    id: matched?.id, // Keep original ID if it exists
                    path: n.path,
                    itemId: n.itemId,
                    originalItemId: n.itemId,
                    itemCode: n.itemCode ?? matched?.originalItemCode ?? null,
                    itemName: n.itemName ?? matched?.originalItemName ?? null,
                    qtyRequired: String(n.qtyRequired),
                    qtyIssued: matched?.qtyIssued ?? "0",
                    uom: n.uom ?? matched?.uom ?? null,
                    alternativeItemId: matched?.alternativeItemId ?? null,
                    alternativeItemName: matched?.alternativeItemName ?? null,
                    level,
                    isLeaf: n.isLeaf,
                  });
                  if (Array.isArray(n.children) && n.children.length > 0) {
                    result = result.concat(flattenTree(n.children, level + 1));
                  }
                }
                return result;
              };

              let lines: BomLikeLine[];
              if (
                editing?.outputMetadata?.explosionTree &&
                editing.outputMetadata.bomId === bomId
              ) {
                // If we are editing an MO and the bomId matches its original bom, use the saved tree
                lines = flattenTree(
                  editing.outputMetadata
                    .explosionTree as unknown as ExplosionNode[],
                );
              } else {
                // Otherwise use the preview tree from API
                lines = flattenTree(
                  previewRes.explosionTree as unknown as ExplosionNode[],
                );
              }

              setBomLines(lines);

              const itemIds = Array.from(
                new Set(
                  lines
                    .flatMap((line) => [
                      line.itemId,
                      line.originalItemId,
                      line.alternativeItemId,
                    ])
                    .filter(Boolean),
                ),
              ) as string[];
              if (itemIds.length) {
                inventoryCoreApi.getBalances(itemIds).then((nextBalances) => {
                  if (bomLoadRequestRef.current !== requestId) return;
                  setBalances(nextBalances);
                });
              } else {
                setBalances({});
              }
            });
        })
        .catch(() => {
          if (bomLoadRequestRef.current !== requestId) return;
          setBomLines([]);
          setBalances({});
        })
        .finally(() => {
          if (bomLoadRequestRef.current === requestId) setBomLoading(false);
        });
      return;
    }

    if (!form.finishedGoodItemId) {
      setBomLines([]);
      setBalances({});
      setBomLoading(false);
      return;
    }

    setBomLoading(true);
    // Use the user-selected bomId if available; otherwise fall back to first
    const resolveAndLoad = form.bomId
      ? Promise.resolve(form.bomId)
      : bomCoreApi
          .list({
            pageSize: 1,
            finishedGoodItemId: form.finishedGoodItemId,
          })
          .then((res) => {
            const bom = res.items[0] as BomLikeItem | undefined;
            return bom?.id ?? null;
          });

    resolveAndLoad
      .then((bomId) => {
        if (!bomId) {
          setBomLines([]);
          setBalances({});
          return;
        }
        return productionCoreApi
          .explodePreview(bomId, Number(form.qtyToProduce || 1))
          .then((previewRes) => {
            if (bomLoadRequestRef.current !== requestId) return;

            const flattenTree = (
              nodes: ExplosionNode[],
              level = 0,
            ): BomLikeLine[] => {
              let result: BomLikeLine[] = [];
              for (const n of nodes) {
                result.push({
                  path: n.path,
                  itemId: n.itemId,
                  originalItemId: n.itemId,
                  itemCode: n.itemCode ?? null,
                  itemName: n.itemName ?? null,
                  qtyRequired: String(n.qtyRequired),
                  qtyIssued: "0",
                  uom: n.uom ?? null,
                  level,
                  isLeaf: n.isLeaf,
                });
                if (Array.isArray(n.children) && n.children.length > 0) {
                  result = result.concat(flattenTree(n.children, level + 1));
                }
              }
              return result;
            };

            const lines = flattenTree(
              previewRes.explosionTree as unknown as ExplosionNode[],
            );
            setBomLines(lines);

            const itemIds = lines
              .map((l) => l.itemId)
              .filter(Boolean) as string[];
            if (itemIds.length) {
              inventoryCoreApi.getBalances(itemIds).then((nextBalances) => {
                if (bomLoadRequestRef.current !== requestId) return;
                setBalances(nextBalances);
              });
            } else {
              setBalances({});
            }
          });
      })
      .catch(() => {
        if (bomLoadRequestRef.current !== requestId) return;
        setBomLines([]);
        setBalances({});
      })
      .finally(() => {
        if (bomLoadRequestRef.current === requestId) setBomLoading(false);
      });
  }, [form.finishedGoodItemId, form.bomId, editing]);

  // Auto-fill referenceNo when opening create drawer
  useEffect(() => {
    if (open && !editing) {
      productionCoreApi
        .getNextReferenceNo()
        .then((refNo) => {
          if (refNo) {
            setForm((prev) => ({
              ...prev,
              referenceNo: prev.referenceNo || refNo,
            }));
          }
        })
        .catch(() => {
          // Non-blocking: user can still enter referenceNo manually
        });
    }
  }, [open, editing]);

  // Fetch all BOMs for selected finished good; auto-select latest ACTIVE (create only)
  useEffect(() => {
    if (!form.finishedGoodItemId) {
      setAvailableBoms([]);
      setForm((prev) => (prev.bomId ? { ...prev, bomId: "" } : prev));
      return;
    }
    bomCoreApi
      .list({ pageSize: 50, finishedGoodItemId: form.finishedGoodItemId })
      .then((res) => {
        const boms = res.items;
        setAvailableBoms(boms);
        if (!editing && boms.length > 0) {
          // Only auto-select in create mode; edit mode keeps the saved bomId
          const activeBom = boms.find((b) => b.status === "ACTIVE") ?? boms[0];
          setForm((prev) =>
            boms.some((b) => b.id === prev.bomId)
              ? prev
              : { ...prev, bomId: activeBom.id },
          );
        }
      })
      .catch(() => {
        setAvailableBoms([]);
      });
  }, [form.finishedGoodItemId, editing]);

  // When alternativeItems change, reload balances to include alt item qtys
  useEffect(() => {
    const altIds = Object.values(alternativeItems).filter(Boolean);
    if (!altIds.length) return;
    // Merge alt item ids with base item ids
    const baseIds = bomLines.map((l) => l.itemId).filter(Boolean) as string[];
    const allIds = Array.from(new Set([...baseIds, ...altIds]));
    inventoryCoreApi.getBalances(allIds).then(setBalances);
  }, [alternativeItems, bomLines]);

  useEffect(() => {
    if (open) {
      bomLoadRequestRef.current += 1;
      loadItems();
      if (editing) {
        setForm({
          finishedGoodItemId: editing.finishedGoodItemId || "",
          qtyToProduce: editing.qtyToProduce || "1",
          warehouseCode: editing.warehouseCode || "",
          referenceNo: editing.referenceNo || "",
          plannedStartDate: editing.plannedStartDate
            ? editing.plannedStartDate.slice(0, 10)
            : "",
          plannedEndDate: editing.plannedEndDate
            ? editing.plannedEndDate.slice(0, 10)
            : "",
          bomId: (editing.outputMetadata?.bomId as string) || "",
        });
        const existingNotes =
          (editing.outputMetadata?.lineNotes as Record<string, string>) || {};
        setLineNotes(existingNotes);
      } else {
        setForm(emptyForm());
        setBomLines([]);
        setBalances({});
        setLineNotes({});
        setBomLoading(false);
      }
      if (!editing) {
        setAlternativeItems({});
      }
      setLocalSearch("");
      setError(null);
    } else {
      setForm(emptyForm());
      setBomLines([]);
      setBalances({});
      setLineNotes({});
      setAlternativeItems({});
      setLocalSearch("");
      setError(null);
      setBomLoading(false);
    }
  }, [open, editing, loadItems]);

  const handleSubmit = async (status: string = "CONFIRMED") => {
    if (!form.finishedGoodItemId) {
      setError("Vui lòng chọn thành phẩm");
      return;
    }
    if (!form.qtyToProduce.trim() || Number(form.qtyToProduce) <= 0) {
      setError("Số lượng sản xuất phải lớn hơn 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const materialOverrides = Object.entries(alternativeItems)
        .filter(([, altId]) => !!altId)
        .map(([pathOrItemId, alternativeItemId]) => {
          const node = bomLines.find(
            (l) => (l.path || l.itemId) === pathOrItemId,
          );
          return {
            path: node?.path,
            originalItemId: node?.itemId || pathOrItemId,
            alternativeItemId,
            notes: "Thay thế bởi người dùng khi tạo lệnh sản xuất",
          };
        });

      const payload = {
        finishedGoodItemId: form.finishedGoodItemId,
        qtyToProduce: form.qtyToProduce,
        ...(form.warehouseCode.trim()
          ? { warehouseCode: form.warehouseCode.trim() }
          : {}),
        ...(form.referenceNo.trim()
          ? { referenceNo: form.referenceNo.trim() }
          : {}),
        ...(form.plannedStartDate
          ? { plannedStartDate: form.plannedStartDate }
          : {}),
        ...(form.plannedEndDate ? { plannedEndDate: form.plannedEndDate } : {}),
        ...(form.bomId ? { bomId: form.bomId } : {}),
        status,
        ...(materialOverrides.length > 0 ? { materialOverrides } : {}),
        outputMetadata: {
          ...(editing?.outputMetadata || {}),
          lineNotes,
        },
      };

      if (!editing) {
        await productionCoreApi.execute(payload);
        showToast({
          title: "Tạo lệnh sản xuất thành công",
          variant: "success",
        });
      } else if (
        ["DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(
          editing.status || "",
        )
      ) {
        await productionCoreApi.update(editing.id, payload);
        showToast({
          title: "Cập nhật lệnh sản xuất thành công",
          variant: "success",
        });
      } else {
        showToast({
          title: "Cập nhật không khả dụng cho MO đã tạo",
          variant: "default",
        });
      }

      await onSaved();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể lưu lệnh sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!editing?.id) return;
    setSaving(true);
    setError(null);
    try {
      await productionCoreApi.confirm(editing.id);
      showToast({
        title: "Xác nhận lệnh sản xuất thành công",
        variant: "success",
      });
      await onSaved();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể xác nhận lệnh sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  const onIssueMaterial = () => {
    if (!editing?.id) return;

    issueDrawer.openCreate(editing.id);

    const exportLines: GiLineForm[] = bomLines.map((line) => {
      const linePath = line.path || line.itemId || "";
      const selectedAltItemId =
        alternativeItems[linePath] || alternativeItems[line.itemId ?? ""] || "";
      const effectiveItemId = selectedAltItemId || line.itemId || "";
      const effectiveItemName =
        selectedAltItemId && line.alternativeItemName
          ? line.alternativeItemName
          : line.itemName || "";

      return {
        salesOrderLineId: "",
        productionOrderMaterialId: line.id ?? "",
        itemId: effectiveItemId,
        itemName: effectiveItemName,
        serialId: "",
        vehicleId: "",
        qtyIssued: line.qtyRequired || "0",
        unitCost: "",
      };
    });

    issueDrawer.setForm((prev) => ({
      ...prev,
      issueType: "PRODUCTION",
      productionOrderId: editing.id,
      remarks: editing.referenceNo
        ? `Xuất NVL cho ${editing.referenceNo}`
        : prev.remarks,
      lines: exportLines.length ? exportLines : prev.lines,
    }));
  };

  const onReceiveFinishedGood = () => {
    if (!editing?.id) return;
    // Set query params or session storage so the GR page knows to prefill for this MO
    window.sessionStorage.setItem("gr_prefill_mo", editing.id);
    navigate("inventory");
  };

  const handleStartProduction = async () => {
    if (!editing?.id) return;
    const qty = Number(startQty);
    if (!qty || qty <= 0) return;
    setSaving(true);
    setError(null);
    try {
      await productionCoreApi.start(editing.id, {
        qtyToManufacture: qty,
        ...(form.warehouseCode?.trim()
          ? { warehouseCode: form.warehouseCode.trim() }
          : {}),
      });
      showToast({
        title: "Bắt đầu sản xuất thành công",
        variant: "success",
      });
      setShowStartDialog(false);
      await onSaved();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể bắt đầu sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteProduction = async () => {
    if (!editing?.id) return;
    const qty = Number(completeQty);
    if (!qty || qty <= 0) return;
    setSaving(true);
    setError(null);
    try {
      await productionCoreApi.complete(editing.id, {
        qtyFinished: qty,
        ...(form.warehouseCode?.trim()
          ? { warehouseCode: form.warehouseCode.trim() }
          : {}),
        ...(Number(completeUnitCost) > 0
          ? { unitCost: Number(completeUnitCost) }
          : {}),
      });
      showToast({
        title: "Hoàn thành sản xuất thành công",
        variant: "success",
      });
      setShowCompleteDialog(false);
      await onSaved();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể ghi nhận hoàn thành sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  const bomOptions = useMemo(
    () =>
      availableBoms.map((b) => ({
        value: b.id,
        label: b.bomName
          ? `${b.bomName} (v${b.version ?? "?"})${b.status !== "ACTIVE" ? " — " + b.status : ""}`
          : `BOM ${b.id.slice(0, 8)}`,
      })),
    [availableBoms],
  );

  return {
    form,
    setForm,
    itemOptions,
    availableBoms,
    bomOptions,
    saving,
    error,
    handleSubmit,
    handleConfirmOrder,
    onIssueMaterial,
    issueDrawer,
    onReceiveFinishedGood,
    handleStartProduction,
    handleCompleteProduction,
    startQty,
    setStartQty,
    completeQty,
    setCompleteQty,
    completeUnitCost,
    setCompleteUnitCost,
    showStartDialog,
    setShowStartDialog,
    showCompleteDialog,
    setShowCompleteDialog,
    showLackingOnly,
    setShowLackingOnly,
    showGeneralInfo,
    setShowGeneralInfo,
    bomLines,
    balances,
    localSearch,
    setLocalSearch,
    alternativeItems,
    setAlternativeItem,
    clearAlternativeItem,
    lineNotes,
    setLineNote,
    altItemOptions,
    altItemSearch,
    setAltItemSearch,
    fetchNextAltItems,
    loadingAltItems,
    bomLoading,
  };
}

export type UseProductionOrderDrawerReturn = ReturnType<
  typeof useProductionOrderDrawer
>;
