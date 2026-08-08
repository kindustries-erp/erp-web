import React, { useEffect, useState } from "react";
import { PurchaseOrderDrawer } from "./PurchaseOrderDrawer";
import {
  operationalApi,
  type OperationalDocument,
} from "@/modules/operational/api/operationalApi";
import {
  purchaseOrdersCoreApi,
  type ErpPoReceipt,
} from "../api/purchaseOrdersCoreApi";

interface Props {
  isOpen: boolean;
  poId: string | null;
  onClose: () => void;
}

export function PurchaseOrderStandaloneDrawer({
  isOpen,
  poId,
  onClose,
}: Props) {
  const [doc, setDoc] = useState<OperationalDocument | null>(null);
  const [poReceipts, setPoReceipts] = useState<ErpPoReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && poId) {
      setLoading(true);
      Promise.all([
        operationalApi.getDocument("purchase_orders", poId),
        purchaseOrdersCoreApi.get(poId).catch(() => ({ receipts: [] })),
      ])
        .then(([fetchedDoc, poDetails]) => {
          setDoc(fetchedDoc);
          setPoReceipts((poDetails as any).receipts || []);
        })
        .catch((err) => {
          console.error("Failed to fetch PO details", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDoc(null);
      setPoReceipts([]);
    }
  }, [isOpen, poId]);

  return (
    <PurchaseOrderDrawer
      open={isOpen}
      loading={loading}
      editing={doc}
      viewOnly={true}
      poReceipts={poReceipts}
      onClose={onClose}
      onSaved={() => {}}
    />
  );
}
