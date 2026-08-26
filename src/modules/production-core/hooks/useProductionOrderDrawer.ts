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
import {
  type ProductionIdentifier,
  type TrackingPolicy,
  emptyIdentifier,
  makeIdentifierRows,
  identifiersAllValid,
  findVehicleDuplicate,
  parseVehicleBulkInput,
} from "../components/drawer/ProductionOrderExecutionTab";

const COLOR_NAMES: Record<string, string> = {
  DEN: "ĐEN",
  TRANG: "TRẮNG",
  DO: "ĐỎ",
  XANH: "XANH",
  XAM: "XÁM",
  BAC: "BẠC",
};

export interface BomLikeLine {
  id?: string;
  path?: string;
  itemId?: string;
  itemName?: string | null;
  itemCode?: string | null;
  itemTypeCode?: string | null;
  qtyRequired?: string | null;
  qtyIssued?: string | null;
  uom?: string | null;
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
  itemTypeCode?: string | null;
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

  const [activeTab, setActiveTab] = useState<string>("details");
  const [form, setForm] = useState(emptyForm());
  const [notes, setNotes] = useState("");
  const [localOrder, setLocalOrder] = useState<ErpProductionOrder | null>(
    editing,
  );

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

  // BOM selection
  const [availableBoms, setAvailableBoms] = useState<ErpBom[]>([]);
  const [completeQty, setCompleteQty] = useState("1");
  const [completeUnitCost, setCompleteUnitCost] = useState("0");
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showLackingOnly, setShowLackingOnly] = useState(false);

  // Execution states
  const [batchCompleteQty, setBatchCompleteQty] = useState("1");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [vehicleBulkInput, setVehicleBulkInput] = useState("");
  const [identifiers, setIdentifiers] = useState<ProductionIdentifier[]>([
    emptyIdentifier(),
  ]);
  const prevBatchQtyRef = useRef<string>("");

  // Alternative item overrides
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

  const cachedAltItems = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!altItemsData) return;
    altItemsData.pages.forEach((p) => {
      (p.items.inventoryItems || []).forEach((i) => {
        cachedAltItems.current[i.id] = `${i.sku} — ${i.itemName}`;
      });
    });
  }, [altItemsData]);

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

  const trackingPolicy: TrackingPolicy =
    (
      localOrder?.finishedGoodItem as
        | { trackingPolicy?: TrackingPolicy }
        | undefined
    )?.trackingPolicy ?? "NONE";
  const needsIdentifiers = ["SERIAL", "LOT", "VEHICLE"].includes(
    trackingPolicy,
  );

  // Sync localOrder and form when editing changes
  useEffect(() => {
    setLocalOrder(editing);
    if (editing) {
      setNotes(
        editing.notes || (editing.outputMetadata?.notes as string) || "",
      );
    }
  }, [editing]);

  // Resize identifier rows when batchCompleteQty changes
  useEffect(() => {
    if (!needsIdentifiers) return;
    const qty = Math.max(1, Math.floor(Number(batchCompleteQty) || 1));
    if (String(qty) === prevBatchQtyRef.current) return;
    prevBatchQtyRef.current = String(qty);
    setIdentifiers((prev) => {
      if (prev.length === qty) return prev;
      if (prev.length < qty) {
        return [
          ...prev,
          ...Array.from({ length: qty - prev.length }, emptyIdentifier),
        ];
      }
      return prev.slice(0, qty);
    });
  }, [batchCompleteQty, needsIdentifiers]);

  const handleIdentifierChange = useCallback(
    (index: number, val: ProductionIdentifier) => {
      setIdentifiers((prev) => prev.map((row, i) => (i === index ? val : row)));
    },
    [],
  );

  const resetVehicleEntry = useCallback(() => {
    setIdentifiers(makeIdentifierRows(1));
    prevBatchQtyRef.current = "1";
    setBatchCompleteQty("1");
    setVehicleBulkInput("");
  }, []);

  const refreshLocalOrder = useCallback(async () => {
    if (!editing?.id) return;
    try {
      const updated = await productionCoreApi.get(editing.id);
      setLocalOrder(updated);
      await onSaved();
    } catch {
      // ignore
    }
  }, [editing, onSaved]);

  const applyVehicleBulkInput = useCallback(() => {
    try {
      const rows = parseVehicleBulkInput(vehicleBulkInput);
      const qty = Math.max(1, Math.floor(Number(batchCompleteQty) || 1));
      if (rows.length !== qty) {
        showToast({
          title: `Số dòng bulk (${rows.length}) phải bằng số lượng hoàn thành (${qty})`,
          variant: "destructive",
        });
        return;
      }
      const duplicateMessage = findVehicleDuplicate(rows);
      if (duplicateMessage) {
        showToast({ title: duplicateMessage, variant: "destructive" });
        return;
      }
      setIdentifiers(rows);
      showToast({
        title: "Đã trích xuất danh sách VIN / số máy thành công",
        variant: "success",
      });
    } catch (e: any) {
      showToast({ title: e.message, variant: "destructive" });
    }
  }, [batchCompleteQty, showToast, vehicleBulkInput]);

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

  // Explode BOM effect
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
                sourceLines.map((line) => [line.itemId, line]),
              );

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
                    id: matched?.id,
                    path: n.path,
                    itemId: n.itemId,
                    originalItemId: n.itemId,
                    itemCode: n.itemCode ?? matched?.originalItemCode ?? null,
                    itemName: n.itemName ?? matched?.originalItemName ?? null,
                    itemTypeCode:
                      n.itemTypeCode ?? matched?.itemTypeCode ?? null,
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
                lines = flattenTree(
                  editing.outputMetadata
                    .explosionTree as unknown as ExplosionNode[],
                );
              } else {
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

  // Auto-fill referenceNo for create
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
        .catch(() => {});
    }
  }, [open, editing]);

  // Available BOMs effect
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

  // Alternative items balance reload
  useEffect(() => {
    const altIds = Object.values(alternativeItems).filter(Boolean);
    if (!altIds.length) return;
    const baseIds = bomLines.map((l) => l.itemId).filter(Boolean) as string[];
    const allIds = Array.from(new Set([...baseIds, ...altIds]));
    inventoryCoreApi.getBalances(allIds).then(setBalances);
  }, [alternativeItems, bomLines]);

  // Modal open reset/populate
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
        setNotes(
          editing.notes || (editing.outputMetadata?.notes as string) || "",
        );
        const existingNotes =
          (editing.outputMetadata?.lineNotes as Record<string, string>) || {};
        setLineNotes(existingNotes);
      } else {
        setForm(emptyForm());
        setNotes("");
        setBomLines([]);
        setBalances({});
        setLineNotes({});
        setAlternativeItems({});
        setBomLoading(false);
      }
      setLocalSearch("");
      setError(null);
      resetVehicleEntry();
    } else {
      setForm(emptyForm());
      setNotes("");
      setBomLines([]);
      setBalances({});
      setLineNotes({});
      setAlternativeItems({});
      setLocalSearch("");
      setError(null);
      setBomLoading(false);
    }
  }, [open, editing, loadItems, resetVehicleEntry]);

  const getPayload = (status: string) => {
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

    return {
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
      notes: notes.trim() || undefined,
      status,
      ...(materialOverrides.length > 0 ? { materialOverrides } : {}),
      outputMetadata: {
        ...(editing?.outputMetadata || {}),
        lineNotes,
        notes: notes.trim() || undefined,
      },
    };
  };

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
      const payload = getPayload(status);

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
      const payload = getPayload("DRAFT");
      await productionCoreApi.update(editing.id, payload);

      await productionCoreApi.confirm(editing.id);
      showToast({
        title: "Xác nhận lệnh sản xuất thành công",
        variant: "success",
      });
      await onSaved();
      await refreshLocalOrder();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể xác nhận lệnh sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  // Execution actions
  const handleStartAll = useCallback(async () => {
    const orderId = localOrder?.id || editing?.id;
    if (!orderId) return;
    setSaving(true);
    try {
      await productionCoreApi.start(orderId, {
        qtyToManufacture: Number(
          localOrder?.qtyToProduce ?? form.qtyToProduce ?? 1,
        ),
      });
      showToast({
        title: "Bắt đầu sản xuất và xuất kho NVL thành công",
        variant: "success",
      });
      await refreshLocalOrder();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, "Không thể bắt đầu sản xuất"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [localOrder, editing, form.qtyToProduce, refreshLocalOrder, showToast]);

  const handleCompleteOne = useCallback(async () => {
    const orderId = localOrder?.id || editing?.id;
    if (!orderId) return;
    if (
      needsIdentifiers &&
      !identifiersAllValid(identifiers.slice(0, 1), trackingPolicy)
    ) {
      showToast({
        title: "Vui lòng nhập đầy đủ thông tin định danh trước khi hoàn thành",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const identifiersPayload = identifiers.slice(0, 1).map((id) => {
        const mergedAttrs = {
          ...id.attributes.reduce(
            (acc, curr) => {
              if (curr.key.trim()) acc[curr.key.trim()] = curr.value.trim();
              return acc;
            },
            {} as Record<string, string>,
          ),
        };
        if (id.colorCode) {
          mergedAttrs["color"] = COLOR_NAMES[id.colorCode] || id.colorCode;
        }

        return {
          vinNo: id.vinNo,
          engineNo: id.engineNo,
          serialNo: id.serialNo,
          lotNo: id.lotNo,
          notes: id.notes,
          attributes:
            Object.keys(mergedAttrs).length > 0 ? mergedAttrs : undefined,
        };
      });
      await productionCoreApi.complete(orderId, {
        qtyFinished: 1,
        ...(needsIdentifiers ? { identifiers: identifiersPayload } : {}),
      });
      showToast({
        title: "Đã hoàn thành 1 đơn vị thành phẩm",
        variant: "success",
      });
      resetVehicleEntry();
      await refreshLocalOrder();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, "Không thể hoàn thành đơn vị sản xuất"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    localOrder,
    editing,
    identifiers,
    needsIdentifiers,
    trackingPolicy,
    refreshLocalOrder,
    resetVehicleEntry,
    showToast,
  ]);

  const handleBatchComplete = useCallback(async () => {
    const orderId = localOrder?.id || editing?.id;
    if (!orderId) return;
    const qty = Number(batchCompleteQty);
    if (!qty || qty <= 0) {
      showToast({ title: "Số lượng không hợp lệ", variant: "destructive" });
      return;
    }
    const remainingQty =
      Number(localOrder?.qtyToProduce || 0) -
      Number(localOrder?.qtyProduced || 0);
    if (qty > remainingQty) {
      showToast({
        title: `Số lượng hoàn thành không được vượt quá số lượng còn lại (${remainingQty})`,
        variant: "destructive",
      });
      return;
    }
    if (needsIdentifiers && !identifiersAllValid(identifiers, trackingPolicy)) {
      showToast({
        title: "Vui lòng nhập đầy đủ thông tin định danh cho tất cả đơn vị",
        variant: "destructive",
      });
      return;
    }
    if (trackingPolicy === "VEHICLE") {
      const duplicateMessage = findVehicleDuplicate(identifiers);
      if (duplicateMessage) {
        showToast({ title: duplicateMessage, variant: "destructive" });
        return;
      }
    }
    setSaving(true);
    try {
      const identifiersPayload = identifiers.map((id) => {
        const mergedAttrs = {
          ...id.attributes.reduce(
            (acc, curr) => {
              if (curr.key.trim()) acc[curr.key.trim()] = curr.value.trim();
              return acc;
            },
            {} as Record<string, string>,
          ),
        };
        if (id.colorCode) {
          mergedAttrs["color"] = COLOR_NAMES[id.colorCode] || id.colorCode;
        }

        return {
          vinNo: id.vinNo,
          engineNo: id.engineNo,
          serialNo: id.serialNo,
          lotNo: id.lotNo,
          notes: id.notes,
          attributes:
            Object.keys(mergedAttrs).length > 0 ? mergedAttrs : undefined,
        };
      });
      await productionCoreApi.complete(orderId, {
        qtyFinished: qty,
        unitCost: 0,
        ...(needsIdentifiers ? { identifiers: identifiersPayload } : {}),
      });
      showToast({
        title: `Đã hoàn thành ${qty} đơn vị sản xuất`,
        variant: "success",
      });
      setShowBatchDialog(false);
      resetVehicleEntry();
      await refreshLocalOrder();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, "Không thể hoàn thành sản xuất hàng loạt"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    localOrder,
    editing,
    batchCompleteQty,
    identifiers,
    needsIdentifiers,
    trackingPolicy,
    refreshLocalOrder,
    resetVehicleEntry,
    showToast,
  ]);

  const handleExportXlsx = useCallback(async () => {
    if (!editing?.id) return;
    try {
      setSaving(true);
      const blob = await productionCoreApi.exportXlsx(editing.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lenh_San_Xuat_${editing.referenceNo || editing.id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast({ title: "Xuất file Excel thành công", variant: "success" });
    } catch (e) {
      showToast({
        title: getErrorMessage(e, "Không thể xuất file Excel"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [editing, showToast]);

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
    window.sessionStorage.setItem("gr_prefill_mo", editing.id);
    navigate("erp-inventory-stock");
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
    activeTab,
    setActiveTab,
    form,
    setForm,
    notes,
    setNotes,
    localOrder: localOrder || editing,
    refreshLocalOrder,
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
    // Execution
    batchCompleteQty,
    setBatchCompleteQty,
    showBatchDialog,
    setShowBatchDialog,
    vehicleBulkInput,
    setVehicleBulkInput,
    applyVehicleBulkInput,
    identifiers,
    setIdentifiers,
    handleIdentifierChange,
    trackingPolicy,
    needsIdentifiers,
    handleStartAll,
    handleCompleteOne,
    handleBatchComplete,
    handleExportXlsx,
    resetVehicleEntry,
  };
}

export type UseProductionOrderDrawerReturn = ReturnType<
  typeof useProductionOrderDrawer
>;
