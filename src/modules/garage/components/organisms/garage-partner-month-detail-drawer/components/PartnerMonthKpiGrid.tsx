import React from "react";
import { User, ShieldCheck, Truck, Receipt } from "lucide-react";
import { PartnerMonthPayerCard } from "./PartnerMonthPayerCard";
import type { PartnerMonthMetrics } from "../GaragePartnerMonthDetailDrawer.type";

interface PartnerMonthKpiGridProps {
  metrics: PartnerMonthMetrics;
  debtType: "receivables" | "payables";
}

export const PartnerMonthKpiGrid: React.FC<PartnerMonthKpiGridProps> = ({
  metrics,
  debtType,
}) => {
  const isPayable = debtType === "payables";

  if (isPayable) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <PartnerMonthPayerCard
          title="Chi phí NCC / Xưởng ngoài"
          subTitle="Theo dõi chi phí dịch vụ & gia công ngoài trong tháng"
          icon={Truck}
          iconClass="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          payer={metrics.customer}
        />
        <PartnerMonthPayerCard
          title="Tất toán & Hóa đơn chi phí"
          subTitle="Cấn trừ dòng tiền và hóa đơn chi phí đầu vào"
          icon={Receipt}
          iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          payer={{
            ...metrics.customer,
            caseCount: metrics.caseCount,
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      <PartnerMonthPayerCard
        title="1. Phần Khách Hàng Thanh Toán"
        subTitle="Theo dõi phát sinh, thực thu và dư nợ phải thu trực tiếp từ khách hàng"
        icon={User}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        payer={metrics.customer}
      />
      <PartnerMonthPayerCard
        title="2. Phần Bảo Hiểm Chi Trả"
        subTitle="Theo dõi duyệt hồ sơ, tiền bảo hiểm chi trả và hóa đơn bảo hiểm"
        icon={ShieldCheck}
        iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        payer={metrics.insurance}
        hasVatWarning={metrics.vatWarning.hasWarning}
      />
    </div>
  );
};
