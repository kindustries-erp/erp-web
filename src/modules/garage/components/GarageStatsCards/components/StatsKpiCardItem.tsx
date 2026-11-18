import React from "react";
import { KpiCard } from "@/shared/components/KpiCard";
import { money, shortMoney } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { PeriodStatsData } from "../types";
import { CollectionDonutChart } from "./CollectionDonutChart";
import { VehicleClassificationDonutChart } from "./VehicleClassificationDonutChart";
import { StageCardItem } from "./StageCardItem";

export interface StatsKpiCardItemProps {
  /** Tiêu đề của thẻ KPI (ví dụ: Xe Tháng này, Xe Tuần này, Xe Hôm nay) */
  label: string;
  /** Icon hiển thị góc trên bên trái thẻ */
  icon?: React.ReactNode;
  /** Dữ liệu số liệu thanh toán & các giai đoạn tiếp nhận theo kỳ */
  data?: PeriodStatsData;
  /** Trạng thái đang tải dữ liệu */
  loading?: boolean;
  /** Sự kiện click vào thẻ để mở drawer toàn bộ vụ việc trong kỳ */
  onCardClick: () => void;
  /** Sự kiện click vào từng giai đoạn tiếp nhận cụ thể để mở drawer lọc theo trạng thái */
  onStageClick?: (stageKey: string, stageLabel: string) => void;
}

/**
 * Component hiển thị 1 thẻ thống kê Xe theo kỳ (Tháng / Tuần / Hôm nay):
 * - Tầng Trên: Icon đặt ngang hàng với nhãn tiêu đề ([Icon] XE THÁNG NÀY) loại bỏ khoảng trống thừa,
 *   bên dưới là Số lượng xe to rõ kèm Số tiền rút gọn (chữ xám dịu mắt, không border trắng, hover App Tooltip full số),
 *   cùng 2 Donut Chart song song (Phân loại xe & Tiến độ thu tiền) nằm góc phải cân xứng.
 * - Tầng Dưới: 4 Card Tiến Độ kiểu cũ riêng biệt (Tiếp nhận, Báo giá, Đang sửa, Hoàn tất),
 *   mỗi card hiển thị số lượng xe kèm số tiền phát sinh trong ngoặc đơn (ví dụ: 11 (124tr)),
 *   chuẩn style /erp-ui-structure, màu sắc dịu nhẹ theo từng giai đoạn, đồng bộ với theme tối và không có viền trắng.
 */
export function StatsKpiCardItem({
  label,
  icon,
  data,
  loading,
  onCardClick,
  onStageClick,
}: StatsKpiCardItemProps) {
  // 1. Trích xuất thông số thanh toán
  const rev = data?.totalRevenue || 0;
  const billed = data?.totalTienCoThue || rev;
  const paid = data?.totalPaid || 0;
  const receivable = data?.totalReceivable || 0;
  const rate = data?.collectionRate || (billed > 0 ? (paid / billed) * 100 : 0);

  // 2. Trích xuất thông số các giai đoạn tiếp nhận xe
  const stages = data?.stages;
  const totalVehicles =
    stages?.totalIntake && stages.totalIntake > 0
      ? stages.totalIntake
      : data?.totalCount || 0;

  const completedCount =
    stages?.completed && stages.completed > 0
      ? stages.completed
      : data?.totalCount || 0;

  const byStage = stages?.byStage;

  // 3. Trích xuất số tiền phát sinh theo từng giai đoạn
  const intakeAmt = stages?.intakeAmount || 0;
  const quotationAmt = stages?.quotationAmount || 0;
  const inProgressAmt = stages?.inProgressAmount || 0;
  const completedAmt = stages?.completedAmount || 0;

  // 4. Giá trị hiển thị số lượng xe + số tiền rút gọn (dịu mắt, không border trắng) kèm App Tooltip
  const valueNode = (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span>{totalVehicles} xe</span>
      {billed > 0 && (
        <Tooltip content={`Tổng phát sinh: ${money(billed)}`} side="top">
          <span
            className="text-xs font-normal text-muted-foreground/80 hover:text-foreground transition-colors cursor-help"
            data-testid="compact-money-badge"
          >
            ({shortMoney(billed)})
          </span>
        </Tooltip>
      )}
    </div>
  );

  // 5. Cụm 2 Donut chart góc trên bên phải
  const rightNode = (
    <div className="flex items-center gap-2 shrink-0">
      <VehicleClassificationDonutChart
        classifications={stages?.classifications}
        total={totalVehicles}
        size={46}
      />
      <CollectionDonutChart
        paid={paid}
        billed={billed}
        receivable={receivable}
        rate={rate}
        size={46}
      />
    </div>
  );

  // 6. Lưới 4 Card Tiến Độ kiểu cũ kèm Số tiền rút gọn trong ngoặc đơn
  const bottomNode = (
    <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2">
      <StageCardItem
        stageKey="intake"
        stageName="Tiếp nhận"
        count={stages?.intake ?? 0}
        amount={intakeAmt}
        classifications={byStage?.intake}
        testId="card-stage-intake"
        moneyTestId="stage-money-intake"
        colorScheme={{
          container:
            "bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 hover:bg-teal-500/15",
          textTitle: "text-teal-700 dark:text-teal-300",
          textCount: "text-teal-600 dark:text-teal-400",
          textAmount: "text-teal-700/80 dark:text-teal-300/80",
        }}
        onClick={() => onStageClick?.("intake", "Tiếp nhận")}
      />

      <StageCardItem
        stageKey="quotation"
        stageName="Báo giá"
        count={stages?.quotation ?? 0}
        amount={quotationAmt}
        classifications={byStage?.quotation}
        testId="card-stage-quotation"
        moneyTestId="stage-money-quotation"
        colorScheme={{
          container:
            "bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/15",
          textTitle: "text-violet-700 dark:text-violet-300",
          textCount: "text-violet-600 dark:text-violet-400",
          textAmount: "text-violet-700/80 dark:text-violet-300/80",
        }}
        onClick={() => onStageClick?.("quotation", "Báo giá")}
      />

      <StageCardItem
        stageKey="in_progress"
        stageName="Đang sửa"
        count={stages?.inProgress ?? 0}
        amount={inProgressAmt}
        classifications={byStage?.inProgress}
        testId="card-stage-in-progress"
        moneyTestId="stage-money-in-progress"
        colorScheme={{
          container:
            "bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15",
          textTitle: "text-amber-700 dark:text-amber-300",
          textCount: "text-amber-600 dark:text-amber-400",
          textAmount: "text-amber-700/80 dark:text-amber-300/80",
        }}
        onClick={() => onStageClick?.("in_progress", "Đang sửa")}
      />

      <StageCardItem
        stageKey="completed"
        stageName="Hoàn tất"
        count={completedCount}
        amount={completedAmt}
        classifications={byStage?.completed}
        testId="card-stage-completed"
        moneyTestId="stage-money-completed"
        colorScheme={{
          container:
            "bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15",
          textTitle: "text-emerald-700 dark:text-emerald-300",
          textCount: "text-emerald-600 dark:text-emerald-400",
          textAmount: "text-emerald-700/80 dark:text-emerald-300/80",
        }}
        onClick={() => onStageClick?.("completed", "Hoàn tất")}
      />
    </div>
  );

  return (
    <div
      onClick={onCardClick}
      className="cursor-pointer transition-transform hover:-translate-y-0.5 group"
      data-testid="stats-kpi-card-item"
    >
      <KpiCard
        loading={loading}
        inlineIcon={true}
        label={label}
        icon={icon}
        value={valueNode}
        rightNode={rightNode}
        bottomNode={bottomNode}
      />
    </div>
  );
}
