import * as React from "react";
import { useV2OverlayState } from "@/v2/shared/hooks/useV2OverlayState";
import { resetV2TableUrl } from "@/v2/shared/utils/v2TableUrl";
import {
  readV2ViewState,
  type V2ViewPresetState,
} from "@/v2/shared/components";
import type { InvoiceView } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-table/invoiceShape.columns";
import type { TaxTab } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { useInvoiceDetailQuery } from "@/v2/modules/finance-invoice/api/queries/useInvoiceDetailQuery";
import { DETAIL_PREFIX } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-overlays/InvoiceShapeOverlays";
import {
  TAX_TABS,
  VIEW_MODES,
  invoiceTableId,
} from "./InvoiceShapePage.constants";

/** Filter đã lưu, nếu không hợp lệ thì về "tất cả" */
const toTaxTab = (key?: string): TaxTab =>
  TAX_TABS.some((tab) => tab.key === key) ? (key as TaxTab) : "all";

/** View đã lưu (kể cả tùy chỉnh) quy về view hệ thống nền; không hợp lệ thì về "tổng quan" */
const toInvoiceView = (saved: V2ViewPresetState): InvoiceView => {
  const custom = saved.customViews.find((v) => v.key === saved.activeKey);
  const base = custom ? custom.baseKey : saved.activeKey;
  return VIEW_MODES.some((mode) => mode.key === base)
    ? (base as InvoiceView)
    : "overview";
};

/** State của trang hóa đơn: tab thuế, chế độ xem, lựa chọn, overlay và hóa đơn đang mở */
export const useInvoiceShapePage = () => {
  // Khôi phục từ bảng hóa đơn mua vào (IN); mỗi bảng vẫn lưu view riêng
  const [saved] = React.useState(() => readV2ViewState(invoiceTableId("IN")));
  const [taxTab, setTaxTab] = React.useState<TaxTab>(() =>
    toTaxTab(saved.filterKey),
  );
  const [view, setView] = React.useState<InvoiceView>(() =>
    toInvoiceView(saved),
  );
  const [selected, setSelected] = React.useState<string[]>([]);
  const [resetCount, setResetCount] = React.useState(0);
  const overlay = useV2OverlayState();
  const { open: openOverlay } = overlay;

  const bumpResetCount = () => setResetCount((count) => count + 1);

  const changeTaxTab = (key: string) => {
    setTaxTab(toTaxTab(key));
    setSelected([]);
    resetV2TableUrl("in");
    resetV2TableUrl("out");
    bumpResetCount();
  };

  const detailId = overlay.stack
    .find((id) => id.startsWith(DETAIL_PREFIX))
    ?.slice(DETAIL_PREFIX.length);
  const detail = useInvoiceDetailQuery(detailId);

  return {
    taxTab,
    view,
    setView,
    selected,
    setSelected,
    resetCount,
    bumpResetCount,
    overlay,
    openOverlay,
    changeTaxTab,
    invoice: detail.data,
  };
};

export type InvoiceShapePageState = ReturnType<typeof useInvoiceShapePage>;
