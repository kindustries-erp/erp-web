import React from "react";
import { ProductionOrderDrawer } from "./ProductionOrderDrawer";
import { useProductionOrderDrawer } from "../hooks/useProductionOrderDrawer";
import type { ErpProductionOrder } from "../api/productionCoreApi";

/**
 * @deprecated ProductionRunDrawer has been unified into ProductionOrderDrawer with top tabs.
 * Please use `<ProductionOrderDrawer initialTab="execution" ... />` instead.
 */
export interface ProductionRunDrawerProps {
  open: boolean;
  loading?: boolean;
  order: ErpProductionOrder | null;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

export function ProductionRunDrawer({
  open,
  loading,
  order,
  onClose,
  onRefresh,
}: ProductionRunDrawerProps) {
  const drawerState = useProductionOrderDrawer({
    open,
    editing: order,
    onClose,
    onSaved: onRefresh,
  });

  return (
    <ProductionOrderDrawer
      open={open}
      loading={loading}
      editing={order}
      viewOnly={true}
      initialTab="execution"
      onClose={onClose}
      onSaved={onRefresh}
      drawerState={drawerState}
    />
  );
}
