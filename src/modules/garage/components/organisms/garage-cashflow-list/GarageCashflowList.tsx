import React, { useState, useCallback } from "react";
import type { TabItem } from "@/shared/components/PageLayout";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { GarageCashflowDrawer } from "../garage-cashflow-drawer/GarageCashflowDrawer";
import { GarageCashflowTable } from "../garage-cashflow-table/GarageCashflowTable";

export interface GarageCashflowListProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

export const GarageCashflowList: React.FC<GarageCashflowListProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    mode: "view" | "edit" | "create";
    voucher: GarageCashflowVoucher | null;
  }>({
    open: false,
    mode: "view",
    voucher: null,
  });

  const handleCreate = useCallback(() => {
    setDrawerState({ open: true, mode: "create", voucher: null });
  }, []);

  const handleView = useCallback((row: GarageCashflowVoucher) => {
    setDrawerState({ open: true, mode: "view", voucher: row });
  }, []);

  const handleEdit = useCallback((row: GarageCashflowVoucher) => {
    setDrawerState({ open: true, mode: "edit", voucher: row });
  }, []);

  const handleDelete = useCallback((row: GarageCashflowVoucher) => {
    console.log("Delete voucher", row.id);
  }, []);

  return (
    <>
      <GarageCashflowTable
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <GarageCashflowDrawer
        open={drawerState.open}
        onClose={() => setDrawerState((prev) => ({ ...prev, open: false }))}
        initialMode={drawerState.mode}
        voucher={drawerState.voucher}
      />
    </>
  );
};
