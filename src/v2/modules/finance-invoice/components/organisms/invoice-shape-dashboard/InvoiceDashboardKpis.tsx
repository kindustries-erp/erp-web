import * as React from "react";
import { V2StatCard } from "@/v2/shared/components";
import {
  toMillion,
  type InvoiceDashboardKpis as Kpis,
} from "@/v2/modules/finance-invoice/domain/rules/invoiceDashboard.logic";

interface Props {
  kpis: Kpis;
}

const formatMillion = (value: number) =>
  toMillion(value).toLocaleString("vi-VN");

/** Bốn thẻ KPI tháng này; số liệu lấy từ API thống kê, không có tỷ lệ so kỳ trước nên không hiển thị trend */
export const InvoiceDashboardKpis: React.FC<Props> = ({ kpis }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <V2StatCard
      label="Doanh số bán ra"
      value={formatMillion(kpis.sales)}
      unit="triệu ₫"
    />
    <V2StatCard
      label="Chi phí mua vào"
      value={formatMillion(kpis.purchases)}
      unit="triệu ₫"
    />
    <V2StatCard
      label="VAT đầu ra"
      value={formatMillion(kpis.vatOut)}
      unit="triệu ₫"
    />
    <V2StatCard
      label="VAT phải nộp ròng"
      value={formatMillion(kpis.vatNet)}
      unit="triệu ₫"
    />
  </div>
);
