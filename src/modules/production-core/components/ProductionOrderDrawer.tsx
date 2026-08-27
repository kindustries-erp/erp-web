import React, { useMemo, useEffect } from "react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import type { ErpProductionOrder } from "@/modules/production-core/api/productionCoreApi";
import { Skeleton } from "@/shared/components/Skeleton";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import {
  FileText,
  PlayCircle,
  Link2,
  History,
  Download,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";

import type { UseProductionOrderDrawerReturn } from "../hooks/useProductionOrderDrawer";
import { ProductionOrderBomTab } from "./drawer/ProductionOrderBomTab";
import { ProductionOrderExecutionTab } from "./drawer/ProductionOrderExecutionTab";
import { ProductionOrderTraceabilityTab } from "./drawer/ProductionOrderTraceabilityTab";
import { ProductionOrderHistoryTab } from "./drawer/ProductionOrderHistoryTab";
import { ProductionOrderRightPanel } from "./drawer/ProductionOrderRightPanel";

export interface ProductionOrderDrawerProps {
  open: boolean;
  loading?: boolean;
  editing: ErpProductionOrder | null;
  viewOnly?: boolean;
  initialTab?: "details" | "execution" | "traceability" | "history";
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
  drawerState: UseProductionOrderDrawerReturn;
}

function fmtQty(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function ProductionOrderDrawer({
  open,
  loading,
  editing,
  viewOnly,
  initialTab = "details",
  onClose,
  onToggleEdit,
  drawerState,
}: ProductionOrderDrawerProps) {
  const t = useT();

  const {
    activeTab,
    setActiveTab,
    form,
    setForm,
    notes,
    setNotes,
    localOrder,
    itemOptions,
    availableBoms,
    bomOptions,
    saving,
    error,
    handleSubmit,
    handleConfirmOrder,
    handleExportXlsx,
    issueDrawer,
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
    setAltItemSearch,
    fetchNextAltItems,
    loadingAltItems,
    showLackingOnly,
    setShowLackingOnly,
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
  } = drawerState;

  // Set initial tab on open
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || "details");
    }
  }, [open, initialTab, setActiveTab]);

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  const currentOrder = localOrder || editing;
  const isDraft = currentOrder?.status === "DRAFT";
  const isConfirmed =
    currentOrder?.status === "CONFIRMED" ||
    currentOrder?.status === "IN_PROGRESS";
  const isCompleted = currentOrder?.status === "COMPLETED";

  // Title Extra Status Badge
  const titleExtra = useMemo(() => {
    if (!currentOrder?.status) return undefined;
    const status = currentOrder.status;

    let badgeCls = "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "COMPLETED") {
      badgeCls = "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (status === "IN_PROGRESS") {
      badgeCls = "bg-blue-100 text-blue-800 border-blue-200";
    } else if (status === "CANCELLED") {
      badgeCls = "bg-red-100 text-red-800 border-red-200";
    }

    const qtyToProduce = Number(currentOrder.qtyToProduce || 1);
    const qtyProduced = Number(currentOrder.qtyProduced || 0);

    return (
      <div className="flex items-center gap-2">
        <Badge variant="ghost" className={`border font-semibold ${badgeCls}`}>
          {status}
        </Badge>
        {status === "IN_PROGRESS" && (
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            {fmtQty(qtyProduced)} / {fmtQty(qtyToProduce)} (
            {Math.round((qtyProduced / qtyToProduce) * 100)}%)
          </span>
        )}
      </div>
    );
  }, [currentOrder]);

  // Footer Left Actions (Export Excel, Issue NVL...)
  const footerLeft = useMemo(() => {
    if (!editing) return undefined;

    const dropdownItems: ActionDropdownItem[] = [
      {
        groupLabel: t("XUẤT DỮ LIỆU & CHỨNG TỪ"),
        items: [
          {
            label: t("Xuất Biên Bản Lệnh SX (.xlsx)"),
            icon: <Download className="w-4 h-4 text-emerald-600" />,
            onClick: handleExportXlsx,
            disabled: saving,
          },
        ],
      },
    ];

    return (
      <ActionDropdown
        align="start"
        items={dropdownItems}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-white dark:bg-slate-900 hover:bg-muted text-foreground shadow-sm transition-colors"
          >
            <span className="font-semibold">{t("Thao tác")}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        }
      />
    );
  }, [editing, handleExportXlsx, saving, t]);

  // Actions
  const actions = useMemo(() => {
    if (viewOnly) {
      return [
        {
          label: t("Đóng"),
          onClick: onClose,
          variant: "outline" as const,
        },
      ];
    }

    return [
      {
        label: t("Hủy"),
        onClick: onClose,
        variant: "outline" as const,
        disabled: saving,
      },
      ...(!editing || isDraft
        ? [
            {
              label: t("Lưu Nháp"),
              onClick: () => handleSubmit("DRAFT"),
              variant: "secondary" as const,
              disabled: saving,
              loading: saving,
            },
          ]
        : []),
      ...(isDraft
        ? [
            {
              label: t("Xác nhận lệnh"),
              primary: true,
              loading: saving,
              disabled: saving,
              onClick: handleConfirmOrder,
            },
          ]
        : [
            {
              label: editing ? t("Lưu thay đổi") : t("Tạo Lệnh Sản Xuất"),
              primary: true,
              loading: saving,
              disabled: saving,
              onClick: () => handleSubmit(editing?.status || "CONFIRMED"),
            },
          ]),
    ];
  }, [
    viewOnly,
    t,
    onClose,
    saving,
    editing,
    isDraft,
    handleSubmit,
    handleConfirmOrder,
  ]);

  // Top Navigation Tabs
  const drawerTabs: DrawerTopTabItem[] = useMemo(() => {
    const tabs: DrawerTopTabItem[] = [
      // 1. Tab Chi tiết BOM & Định mức
      {
        key: "details",
        label: t("Định mức BOM"),
        icon: <FileText className="w-3.5 h-3.5" />,
        badgeCount: bomLines?.length || 0,
        content: (
          <ProductionOrderBomTab
            bomLines={bomLines}
            bomLoading={bomLoading}
            saving={saving}
            viewOnly={viewOnly}
            isCompleted={isCompleted}
            isConfirmed={isConfirmed}
            balances={balances}
            alternativeItems={alternativeItems}
            setAlternativeItem={setAlternativeItem}
            clearAlternativeItem={clearAlternativeItem}
            altItemOptions={altItemOptions}
            setAltItemSearch={setAltItemSearch}
            fetchNextAltItems={fetchNextAltItems}
            loadingAltItems={loadingAltItems}
            lineNotes={lineNotes}
            setLineNote={setLineNote}
            localSearch={localSearch}
            setLocalSearch={setLocalSearch}
            showLackingOnly={showLackingOnly}
            setShowLackingOnly={setShowLackingOnly}
          />
        ),
      },
    ];

    // Các tab tiến trình chỉ hiển thị khi đã có Lệnh (hoặc đang chỉnh sửa)
    if (currentOrder) {
      tabs.push({
        key: "execution",
        label: t("Tiến trình & Thực thi"),
        icon: <PlayCircle className="w-3.5 h-3.5" />,
        content: (
          <ProductionOrderExecutionTab
            order={currentOrder}
            saving={saving}
            onStartAll={handleStartAll}
            onCompleteOne={handleCompleteOne}
            onBatchComplete={handleBatchComplete}
            batchCompleteQty={batchCompleteQty}
            setBatchCompleteQty={setBatchCompleteQty}
            showBatchDialog={showBatchDialog}
            setShowBatchDialog={setShowBatchDialog}
            vehicleBulkInput={vehicleBulkInput}
            setVehicleBulkInput={setVehicleBulkInput}
            applyVehicleBulkInput={applyVehicleBulkInput}
            identifiers={identifiers}
            setIdentifiers={setIdentifiers}
            handleIdentifierChange={handleIdentifierChange}
            trackingPolicy={trackingPolicy}
            needsIdentifiers={needsIdentifiers}
          />
        ),
      });

      tabs.push({
        key: "traceability",
        label: t("Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        hideRightPanel: true, // Bung 100% full width khi xem Graph Traceability
        content: <ProductionOrderTraceabilityTab order={currentOrder} />,
      });

      tabs.push({
        key: "history",
        label: t("Lịch sử thao tác"),
        icon: <History className="w-3.5 h-3.5" />,
        content: <ProductionOrderHistoryTab order={currentOrder} />,
      });
    }

    return tabs;
  }, [
    t,
    bomLines,
    bomLoading,
    saving,
    viewOnly,
    isCompleted,
    isConfirmed,
    balances,
    alternativeItems,
    setAlternativeItem,
    clearAlternativeItem,
    altItemOptions,
    setAltItemSearch,
    fetchNextAltItems,
    loadingAltItems,
    lineNotes,
    setLineNote,
    localSearch,
    setLocalSearch,
    showLackingOnly,
    setShowLackingOnly,
    currentOrder,
    handleStartAll,
    handleCompleteOne,
    handleBatchComplete,
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
  ]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        onClose={onClose}
        onToggleEdit={onToggleEdit}
        confirmOnClose={mode === "edit"}
        title={
          currentOrder
            ? `${viewOnly ? t("Chi tiết Lệnh Sản Xuất") : t("Cập nhật Lệnh Sản Xuất")}: ${currentOrder.referenceNo || currentOrder.id}`
            : t("Tạo mới Lệnh Sản Xuất")
        }
        titleExtra={titleExtra}
        actions={actions}
        footerLeft={footerLeft}
        loading={loading}
        error={error}
        tabs={drawerTabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        defaultTabKey="details"
        rightPanel={
          loading ? (
            <Skeleton className="h-40" />
          ) : (
            <ProductionOrderRightPanel
              mode={mode}
              editing={currentOrder}
              form={form}
              setForm={setForm}
              itemOptions={itemOptions}
              availableBoms={availableBoms}
              bomOptions={bomOptions}
              saving={saving}
              notes={notes}
              onNotesChange={setNotes}
            />
          )
        }
      />

      <GiFormDrawer drawer={issueDrawer} />
    </>
  );
}
