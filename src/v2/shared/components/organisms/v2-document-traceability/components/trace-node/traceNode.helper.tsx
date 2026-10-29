import React from "react";
import {
  BookOpen,
  CreditCard,
  Factory,
  Layers,
  Package,
  PackageCheck,
  PackageMinus,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import type { TraceabilityNodeType } from "../../types/traceability.type";

/** Trả về icon phân hệ tương ứng cho từng loại chứng từ */
export function getDocTypeIcon(
  docType?: TraceabilityNodeType,
): React.ReactNode {
  switch (docType) {
    case "INVOICE":
      return <Receipt className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "BANK_TXN":
      return <CreditCard className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "PURCHASE_ORDER":
      return <ShoppingCart className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "SALES_ORDER":
      return <ShoppingBag className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "GOODS_RECEIPT":
      return <PackageCheck className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "GOODS_ISSUE":
      return <PackageMinus className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "GARAGE_CASE":
      return <Wrench className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "INVENTORY_ITEM":
      return <Package className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "PRODUCTION_ORDER":
      return <Factory className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "BOM":
      return <Layers className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    case "JOURNAL_ENTRY":
      return <BookOpen className="h-2.5 w-2.5 shrink-0 opacity-90" />;
    default:
      return null;
  }
}

