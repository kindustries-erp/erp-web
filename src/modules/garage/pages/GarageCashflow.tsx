import React, { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { formatNumber } from "@/modules/garage/components/organisms/garage-case-preview/GarageCasePreview.helper";
import {
  useDeleteGarageCashflow,
  GARAGE_CASHFLOW_QUERY_KEY,
} from "@/modules/garage/hooks/useGarageCashflowQuery";
import type { GarageCashflowItem } from "@/modules/garage/api/garageCashflowApi";
import { GarageCashflowTable } from "../components/organisms/garage-cashflow-table";
import { GarageCashflowFormDrawer } from "../components/organisms/garage-cashflow-form-drawer";

export function GarageCashflow() {
  const t = useT();
  const navigate = useAppStore((s) => s.navigate);
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedItem, setSelectedItem] = useState<GarageCashflowItem | null>(
    null,
  );

  const deleteMutation = useDeleteGarageCashflow();

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((item: GarageCashflowItem) => {
    setSelectedItem(item);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item: GarageCashflowItem) => {
      const confirmMsg = t(
        "cases.cashflow.deleteConfirm",
        `Bạn có chắc muốn xóa giao dịch #${item.receiptNumber || item.id.substring(0, 8)} (${item.settlementType === "RECEIPT" ? "Thu" : "Chi"} ${formatNumber(item.amount)} ₫)?`,
      );
      if (window.confirm(confirmMsg)) {
        await deleteMutation.mutateAsync(item.id);
      }
    },
    [t, deleteMutation],
  );

  const handleOpenCase = useCallback(
    (_caseId: string, caseCode: string) => {
      window.history.pushState(
        null,
        "",
        `/garage-cases?tab=cases&q=${encodeURIComponent(caseCode)}`,
      );
      navigate("garage-cases");
    },
    [navigate],
  );

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 bg-background overflow-hidden">
      <GarageCashflowTable
        onOpenCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenCase={handleOpenCase}
      />

      <GarageCashflowFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        initialData={selectedItem}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: [GARAGE_CASHFLOW_QUERY_KEY],
          });
        }}
      />
    </div>
  );
}
