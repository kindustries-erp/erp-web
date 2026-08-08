import React, { useEffect, useState } from "react";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import {
  SoFormDrawer,
  buildForm,
  type SoForm,
} from "@/modules/sales-orders-core/components/SoFormDrawer";

interface Props {
  isOpen: boolean;
  soId: string | null;
  onClose: () => void;
}

export function ErpSalesOrderStandaloneDrawer({
  isOpen,
  soId,
  onClose,
}: Props) {
  const [editing, setEditing] = useState<ErpSalesOrder | null>(null);
  const [form, setForm] = useState<SoForm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && soId) {
      setLoading(true);
      salesOrdersCoreApi
        .get(soId)
        .then((detail) => {
          const customerName = detail.customerName || "";
          const mergedDetail = { ...detail, customerName };
          setEditing(mergedDetail as ErpSalesOrder);
          setForm(buildForm(mergedDetail as ErpSalesOrder));

          if (!customerName && detail.customerId) {
            basicMastersApi
              .list({
                search: detail.customerId || undefined,
                entities: "customers",
              })
              .then((res) => {
                const c = res.items.customers?.find(
                  (x: any) => x.id === detail.customerId,
                );
                if (c) {
                  const name = `${c.code} — ${c.displayName || c.name}`;
                  setEditing((prev) =>
                    prev?.id === detail.id
                      ? { ...prev, customerName: name }
                      : prev,
                  );
                }
              });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch SO details", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEditing(null);
      setForm(null);
    }
  }, [isOpen, soId]);

  if (!form || !editing) return null;

  return (
    <SoFormDrawer
      open={isOpen}
      onClose={onClose}
      mode="edit" // mode edit doesn't matter much if viewOnly is passed inside? Wait, SoFormDrawer uses mode?
      editing={editing}
      form={form}
      setForm={setForm as any} // we just provide view only so it won't be edited
      drawerLoading={loading}
      saving={false}
      saveError={null}
      handleSave={() => {}}
      customerOptions={[]} // not needed for view only
      setCustomerSearch={() => {}}
      fetchNextCustomers={() => {}}
      loadingCustomers={false}
      itemOptions={[]} // not needed for view only
      setItemSearch={() => {}}
      fetchNextItems={() => {}}
      loadingItems={false}
      addLine={() => {}}
      removeLine={() => {}}
      updateLine={() => {}}
    />
  );
}
