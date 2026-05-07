import { useState } from "react";
import {
  initPeriod,
  initDateFrom,
  initDateTo,
  periodFirstDay,
  periodLastDay,
  monthFirstDay,
} from "@/modules/finance/utils/financeHelpers";

/**
 * usePeriodFilter — quản lý state bộ lọc kỳ, ngày từ–đến và một loại filter phụ
 * (quỹ tiền mặt cho TienMat, ngân hàng cho TienGui).
 */
export function usePeriodFilter() {
  const [period, setPeriod] = useState(initPeriod);
  const [dateFrom, setDateFrom] = useState(initDateFrom);
  const [dateTo, setDateTo] = useState(initDateTo);
  const [channelFilter, setChannelFilter] = useState("");

  function handlePeriodChange(p: string) {
    setPeriod(p);
    if (p) {
      setDateFrom(periodFirstDay(p));
      setDateTo(periodLastDay(p));
    }
  }

  function handleDateFrom(v: string) {
    setDateFrom(v && dateTo && dateTo < v ? monthFirstDay(dateTo) : v);
    setPeriod("");
  }

  function handleDateTo(v: string) {
    setDateTo(v);
    if (v && dateFrom && v < dateFrom) setDateFrom(monthFirstDay(v));
    setPeriod("");
  }

  function handleChannelFilter(id: string) {
    setChannelFilter(id);
  }

  function resetPeriod() {
    const p = initPeriod();
    setPeriod(p);
    setDateFrom(periodFirstDay(p));
    setDateTo(periodLastDay(p));
    setChannelFilter("");
  }

  const hasActiveFilter =
    period !== initPeriod() ||
    dateFrom !== initDateFrom() ||
    dateTo !== initDateTo() ||
    !!channelFilter;

  return {
    period,
    dateFrom,
    dateTo,
    channelFilter,
    hasActiveFilter,
    handlePeriodChange,
    handleDateFrom,
    handleDateTo,
    handleChannelFilter,
    resetPeriod,
  };
}
