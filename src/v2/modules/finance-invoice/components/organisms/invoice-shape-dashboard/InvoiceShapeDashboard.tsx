import * as React from "react";
import {
  V2BarChart,
  V2DonutChart,
  V2LineChart,
  V2Panel,
  V2Text,
} from "@/v2/shared/components";
import { useInvoiceDashboardQuery } from "@/v2/modules/finance-invoice/api/queries/useInvoiceDashboardQuery";
import { toMillion } from "@/v2/modules/finance-invoice/domain/rules/invoiceDashboard.logic";
import { InvoiceDashboardKpis } from "./InvoiceDashboardKpis";

const million = (value: number) =>
  `${toMillion(value).toLocaleString("vi-VN")} tr`;

/** Tab Tổng quan: KPI, xu hướng dòng tiền, cơ cấu đối tác, VAT theo tháng; toàn bộ số liệu từ API */
export const InvoiceShapeDashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useInvoiceDashboardQuery();

  if (isLoading) {
    return (
      <V2Text
        as="p"
        variant="body-sm"
        color="muted"
        className="py-10 text-center"
      >
        Đang tải tổng quan...
      </V2Text>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-2 py-10">
        <V2Text as="p" variant="body-sm" color="muted">
          Không tải được tổng quan hóa đơn.
        </V2Text>
        <button
          type="button"
          className="text-sm text-primary underline-offset-2 hover:underline"
          onClick={() => void refetch()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <InvoiceDashboardKpis kpis={data.kpis} />
      <div className="grid gap-4 lg:grid-cols-3">
        <V2Panel title="Xu hướng dòng tiền" className="lg:col-span-2">
          <V2LineChart
            area
            labels={data.labels}
            series={data.cashSeries}
            formatValue={million}
            ariaLabel="Xu hướng dòng tiền theo tháng"
          />
        </V2Panel>
        <V2Panel title="Cơ cấu đối tác (bán ra)">
          {data.partnerLabels.length === 0 ? (
            <V2Text as="p" variant="body-sm" color="muted">
              Chưa có dữ liệu đối tác.
            </V2Text>
          ) : (
            <V2DonutChart
              labels={data.partnerLabels}
              values={data.partnerShare}
              formatValue={(v) => `${v}%`}
              ariaLabel="Cơ cấu doanh số theo đối tác"
            />
          )}
        </V2Panel>
      </div>
      <V2Panel title="VAT theo tháng">
        <V2BarChart
          labels={data.labels}
          series={data.vatSeries}
          formatValue={million}
          ariaLabel="VAT đầu vào và đầu ra theo tháng"
          height={200}
        />
      </V2Panel>
    </div>
  );
};
