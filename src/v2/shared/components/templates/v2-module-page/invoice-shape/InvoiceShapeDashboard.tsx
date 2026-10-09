import * as React from "react";
import { V2Sparkline } from "@/v2/shared/components/atoms/v2-sparkline";
import { V2Panel } from "@/v2/shared/components/molecules/v2-panel";
import { V2StatCard } from "@/v2/shared/components/molecules/v2-stat-card";
import {
  V2BarChart,
  V2DonutChart,
  V2LineChart,
} from "@/v2/shared/components/organisms/v2-chart";
import {
  CASH_TREND,
  MONTH_LABELS,
  PARTNER_SHARE,
  VAT_BY_MONTH,
} from "./invoiceShape.data";

const million = (value: number) => `${value.toLocaleString("vi-VN")} tr`;

/** Tab Tổng quan: thẻ KPI, xu hướng dòng tiền, cơ cấu đối tác, VAT theo tháng */
export const InvoiceShapeDashboard: React.FC = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <V2StatCard
        label="Doanh số bán ra"
        value="3.390"
        unit="triệu ₫"
        trend={{ direction: "up", label: "+12% so với tháng trước" }}
      />
      <V2StatCard
        label="Chi phí mua vào"
        value="1.820"
        unit="triệu ₫"
        trend={{ direction: "flat", label: "Không đổi" }}
      />
      <V2StatCard label="VAT đầu ra" value="339" unit="triệu ₫" />
      <V2StatCard
        label="VAT phải nộp ròng"
        value="157"
        unit="triệu ₫"
        trend={{ direction: "down", label: "-4% so với tháng trước" }}
      />
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <V2Panel
        title="Xu hướng dòng tiền"
        className="lg:col-span-2"
        extra={
          <V2Sparkline
            values={CASH_TREND[1]!.data}
            ariaLabel="Doanh số bán ra 12 tháng"
            color="#1baf7a"
          />
        }
      >
        <V2LineChart
          area
          labels={MONTH_LABELS}
          series={CASH_TREND}
          formatValue={million}
          ariaLabel="Xu hướng dòng tiền 12 tháng"
        />
      </V2Panel>
      <V2Panel title="Cơ cấu đối tác">
        <V2DonutChart
          labels={PARTNER_SHARE.labels}
          values={PARTNER_SHARE.values}
          formatValue={(v) => `${v}%`}
          ariaLabel="Cơ cấu doanh số theo đối tác"
        />
      </V2Panel>
    </div>
    <V2Panel title="VAT theo tháng">
      <V2BarChart
        labels={MONTH_LABELS}
        series={VAT_BY_MONTH}
        formatValue={million}
        ariaLabel="VAT đầu vào và đầu ra theo tháng"
        height={200}
      />
    </V2Panel>
  </div>
);
