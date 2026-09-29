import React from "react";
import {
  Landmark,
  Factory,
  ShoppingCart,
  Boxes,
  Wrench,
  PackagePlus,
  PackageMinus,
  Network,
  Receipt,
  ClipboardCheck,
  ShieldCheck,
  AlignLeft,
  Hash,
  ListFilter,
  Calendar,
  ToggleLeft,
} from "lucide-react";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { ModuleAttributeFieldType } from "@/core/api/moduleConfigApi";
import type {
  ErpModuleDomain,
  ErpDomainDefinition,
  ErpModuleDefinition,
} from "./types";
export type { ErpModuleDomain };

export const ERP_DOMAIN_REGISTRY: Record<ErpModuleDomain, ErpDomainDefinition> =
  {
    FINANCE: {
      domain: "FINANCE",
      titleKey: "moduleConfig.domains.finance",
      defaultTitle: "Kế toán & Tài chính",
      icon: <Landmark className="w-3.5 h-3.5" />,
    },
    PRODUCTION: {
      domain: "PRODUCTION",
      titleKey: "moduleConfig.domains.production",
      defaultTitle: "Sản xuất & Kỹ thuật",
      icon: <Factory className="w-3.5 h-3.5" />,
    },
    COMMERCE: {
      domain: "COMMERCE",
      titleKey: "moduleConfig.domains.commerce",
      defaultTitle: "Mua hàng & Bán hàng",
      icon: <ShoppingCart className="w-3.5 h-3.5" />,
    },
    INVENTORY: {
      domain: "INVENTORY",
      titleKey: "moduleConfig.domains.inventory",
      defaultTitle: "Kho vận & Tồn kho",
      icon: <Boxes className="w-3.5 h-3.5" />,
    },
    GARAGE: {
      domain: "GARAGE",
      titleKey: "moduleConfig.domains.garage",
      defaultTitle: "Garage & Dịch vụ",
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
  };

export const ERP_MODULE_REGISTRY: ErpModuleDefinition[] = [
  // Kế toán & Tài chính
  {
    key: "INVOICE_IN",
    nameKey: "moduleConfig.modules.invoiceIn.name",
    defaultName: "Hóa đơn mua vào",
    domain: "FINANCE",
    icon: <PackagePlus className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.invoiceIn.desc",
    defaultDesc:
      "Quản lý trường tùy chỉnh cho hóa đơn mua vào & chi phí nhà cung cấp",
  },
  {
    key: "INVOICE_OUT",
    nameKey: "moduleConfig.modules.invoiceOut.name",
    defaultName: "Hóa đơn bán ra",
    domain: "FINANCE",
    icon: <PackageMinus className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.invoiceOut.desc",
    defaultDesc:
      "Quản lý trường tùy chỉnh cho hóa đơn bán ra & doanh thu bán hàng",
  },
  {
    key: "BANK_TXN",
    nameKey: "moduleConfig.modules.bankTxn.name",
    defaultName: "Giao dịch ngân hàng",
    domain: "FINANCE",
    icon: <Landmark className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.bankTxn.desc",
    defaultDesc: "Sao kê tài khoản ngân hàng & giao dịch sổ quỹ tiền mặt",
  },

  // Sản xuất & Kỹ thuật
  {
    key: "BOM",
    nameKey: "moduleConfig.modules.bom.name",
    defaultName: "Định mức (BOM)",
    domain: "PRODUCTION",
    icon: <Network className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.bom.desc",
    defaultDesc: "Định mức vật tư linh kiện, phụ tùng và cụm chi tiết lắp ráp",
  },
  {
    key: "PRODUCTION",
    nameKey: "moduleConfig.modules.production.name",
    defaultName: "Lệnh sản xuất",
    domain: "PRODUCTION",
    icon: <Factory className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.production.desc",
    defaultDesc: "Tiến độ lắp ráp xe, cấp phát linh kiện & bàn giao thành phẩm",
  },

  // Mua hàng & Bán hàng
  {
    key: "PURCHASE_ORDER",
    nameKey: "moduleConfig.modules.po.name",
    defaultName: "Mua hàng (PO)",
    domain: "COMMERCE",
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.po.desc",
    defaultDesc:
      "Đơn mua hàng, theo dõi tiến độ nhập và đối chiếu nhà cung cấp",
  },
  {
    key: "SALES_ORDER",
    nameKey: "moduleConfig.modules.so.name",
    defaultName: "Bán hàng (SO)",
    domain: "COMMERCE",
    icon: <Receipt className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.so.desc",
    defaultDesc: "Đơn đặt hàng khách lẻ, đại lý phân phối & giao hàng",
  },

  // Kho vận & Tồn kho
  {
    key: "GOODS_RECEIPT",
    nameKey: "moduleConfig.modules.receipt.name",
    defaultName: "Phiếu nhập kho",
    domain: "INVENTORY",
    icon: <PackagePlus className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.receipt.desc",
    defaultDesc: "Phiếu nhập mua hàng, nhập sản xuất & nhập trả hàng",
  },
  {
    key: "GOODS_ISSUE",
    nameKey: "moduleConfig.modules.issue.name",
    defaultName: "Phiếu xuất kho",
    domain: "INVENTORY",
    icon: <PackageMinus className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.issue.desc",
    defaultDesc:
      "Phiếu xuất bán hàng, xuất NVL sản xuất & xuất nội bộ / trưng bày",
  },
  {
    key: "INVENTORY_ADJUSTMENT",
    nameKey: "moduleConfig.modules.adjustment.name",
    defaultName: "Phiếu điều chỉnh",
    domain: "INVENTORY",
    icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.adjustment.desc",
    defaultDesc: "Biên bản kiểm kê kho, xử lý chênh lệch thừa/thiếu tồn kho",
  },
  {
    key: "INVENTORY_ITEM",
    nameKey: "moduleConfig.modules.item.name",
    defaultName: "Mặt hàng & SKU",
    domain: "INVENTORY",
    icon: <Boxes className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.item.desc",
    defaultDesc: "Danh mục master data mặt hàng, quy cách và đơn vị tính",
  },

  // Garage & Dịch vụ
  {
    key: "GARAGE_CASE",
    nameKey: "moduleConfig.modules.garageCase.name",
    defaultName: "Vụ việc Garage",
    domain: "GARAGE",
    icon: <Wrench className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.garageCase.desc",
    defaultDesc: "Hồ sơ tiếp nhận xe, lệnh dịch vụ sửa chữa & báo giá",
  },
  {
    key: "AFTER_SALES",
    nameKey: "moduleConfig.modules.afterSales.name",
    defaultName: "Bảo hành & Bàn giao",
    domain: "GARAGE",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.afterSales.desc",
    defaultDesc:
      "Vòng đời serial xe/pin, bàn giao xe và kích hoạt bảo hành điện tử",
  },
];

export const FIELD_TYPE_ICONS: Record<
  ModuleAttributeFieldType,
  React.ReactNode
> = {
  TEXT: <AlignLeft className="w-3.5 h-3.5" />,
  NUMBER: <Hash className="w-3.5 h-3.5" />,
  SELECT: <ListFilter className="w-3.5 h-3.5" />,
  DATE: <Calendar className="w-3.5 h-3.5" />,
  CHECKBOX: <ToggleLeft className="w-3.5 h-3.5" />,
};

export function getFieldTypeOptions(
  t: (key: string, fallback: string) => string,
): ComboboxOption[] {
  return [
    {
      value: "TEXT",
      label: t("moduleConfig.fieldTypes.text", "Văn bản ngắn (Text)"),
    },
    {
      value: "NUMBER",
      label: t("moduleConfig.fieldTypes.number", "Số (Number)"),
    },
    {
      value: "SELECT",
      label: t("moduleConfig.fieldTypes.select", "Lựa chọn (Dropdown Select)"),
    },
    {
      value: "DATE",
      label: t("moduleConfig.fieldTypes.date", "Ngày tháng (Date)"),
    },
    {
      value: "CHECKBOX",
      label: t("moduleConfig.fieldTypes.checkbox", "Hộp kiểm (Checkbox)"),
    },
  ];
}

export function getFieldTypeShortLabel(
  type: ModuleAttributeFieldType,
  t: (key: string, fallback: string) => string,
): string {
  switch (type) {
    case "TEXT":
      return t("moduleConfig.fieldTypes.shortText", "Văn bản");
    case "NUMBER":
      return t("moduleConfig.fieldTypes.shortNumber", "Số");
    case "SELECT":
      return t("moduleConfig.fieldTypes.shortSelect", "Lựa chọn");
    case "DATE":
      return t("moduleConfig.fieldTypes.shortDate", "Ngày");
    case "CHECKBOX":
      return t("moduleConfig.fieldTypes.shortCheckbox", "Hộp kiểm");
    default:
      return type;
  }
}
