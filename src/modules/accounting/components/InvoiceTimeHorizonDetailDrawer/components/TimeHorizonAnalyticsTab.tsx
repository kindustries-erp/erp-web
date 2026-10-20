import React from "react";
import {
  TimeHorizonForecastSection,
  type TimeHorizonForecastSectionProps,
} from "./TimeHorizonForecastSection";
import {
  TimeHorizonIfrs9Section,
  type TimeHorizonIfrs9SectionProps,
} from "./TimeHorizonIfrs9Section";
import {
  TimeHorizonAgingSection,
  type TimeHorizonAgingSectionProps,
} from "./TimeHorizonAgingSection";

export interface TimeHorizonAnalyticsTabProps {
  isForecastHorizon: boolean;
  isIfrs9Horizon: boolean;
  forecastProps: TimeHorizonForecastSectionProps;
  ifrs9Props: TimeHorizonIfrs9SectionProps;
  agingProps: TimeHorizonAgingSectionProps;
}

export function TimeHorizonAnalyticsTab({
  isForecastHorizon,
  isIfrs9Horizon,
  forecastProps,
  ifrs9Props,
  agingProps,
}: TimeHorizonAnalyticsTabProps) {
  return (
    <div className="flex-1 min-w-0 w-full flex flex-col pt-1">
      {isForecastHorizon ? (
        <TimeHorizonForecastSection {...forecastProps} />
      ) : isIfrs9Horizon ? (
        <TimeHorizonIfrs9Section {...ifrs9Props} />
      ) : (
        <TimeHorizonAgingSection {...agingProps} />
      )}
    </div>
  );
}
