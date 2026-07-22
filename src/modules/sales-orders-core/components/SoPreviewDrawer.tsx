import { useState, useEffect } from "react";
import { salesOrdersCoreApi } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import type { ErpSalesOrder } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { SoFormDrawer, buildForm, emptyForm } from "./SoFormDrawer";

export interface SoPreviewDrawerProps {
  open: boolean;
  soNo: string | null;
  onClose: () => void;
}

export function SoPreviewDrawer({ open, soNo, onClose }: SoPreviewDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [so, setSo] = useState<ErpSalesOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (open && soNo) {
      setLoading(true);
      setError(null);
      salesOrdersCoreApi
        .list({ search: soNo })
        .then((res) => {
          if (res.items.length > 0 && active) {
            const listItem = res.items[0];
            return salesOrdersCoreApi.get(listItem.id).then((detail) => {
              return {
                ...detail,
                customerName: detail.customerName || listItem.customerName,
              };
            });
          }
          if (active) throw new Error("Không tìm thấy đơn hàng");
          return null;
        })
        .then((detail) => {
          if (active && detail) {
            setSo(detail);
          }
        })
        .catch((e: any) => {
          if (active) setError(e.response?.data?.message || e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      setSo(null);
    }

    return () => {
      active = false;
    };
  }, [open, soNo]);

  const form = so ? buildForm(so) : emptyForm();

  return (
    <SoFormDrawer
      open={open}
      onClose={onClose}
      mode="view"
      editing={so}
      form={form}
      setForm={() => {}}
      drawerLoading={loading}
      saving={false}
      saveError={error}
      handleSave={() => {}}
      customerOptions={[]}
      setCustomerSearch={() => {}}
      fetchNextCustomers={() => {}}
      loadingCustomers={false}
      itemOptions={[]}
      setItemSearch={() => {}}
      fetchNextItems={() => {}}
      loadingItems={false}
      addLine={() => {}}
      removeLine={() => {}}
      updateLine={() => {}}
    />
  );
}
