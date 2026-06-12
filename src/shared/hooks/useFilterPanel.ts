import { useState, useCallback, useMemo, useRef } from "react";
import {
  initPeriod,
  initDateFrom,
  initDateTo,
  periodFirstDay,
  periodLastDay,
  monthFirstDay,
} from "@/modules/finance/utils/financeHelpers";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterPanelConfig {
  /** Enable period/date range filter */
  period?: boolean;
  /** Enable channel filter (fund, bank, branch, etc.) */
  channel?: {
    label: string;
    placeholder: string;
    options: FilterOption[];
  };
  /** Enable search filter */
  search?: boolean;
  /** Enable amount range filter */
  amountRange?: boolean;
  /** Enable status filter */
  status?: {
    options: FilterOption[];
    placeholder?: string;
  };
  /** Enable counterparty source filter */
  counterpartySource?: {
    options: FilterOption[];
    placeholder?: string;
  };
  /** Custom select filters (generic) */
  custom?: Array<{
    key: string;
    label: string;
    placeholder: string;
    options: FilterOption[];
    type?: "select" | "multi-select";
    initialValue?: string;
  }>;
}

export interface FilterState {
  period: string;
  dateFrom: string;
  dateTo: string;
  channel: string;
  search: string;
  amountMin: string;
  amountMax: string;
  status: string;
  counterpartySource: string;
  custom: Record<string, string>;
}

export interface FilterPanelReturn {
  // State
  state: FilterState;
  /** Input values (before debounce) for controlled inputs */
  inputs: {
    search: string;
    amountMin: string;
    amountMax: string;
  };
  // Panel visibility
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  // Setters (apply realtime with debounce where needed)
  setPeriod: (v: string) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  setChannel: (v: string) => void;
  setSearchInput: (v: string) => void;
  setAmountMinInput: (v: string) => void;
  setAmountMaxInput: (v: string) => void;
  setStatus: (v: string) => void;
  setCounterpartySource: (v: string) => void;
  setCustom: (key: string, v: string) => void;
  // Utilities
  resetAll: () => void;
  hasActiveFilter: boolean;
  activeFilterCount: number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useFilterPanel(
  config: FilterPanelConfig,
  onFilterChange?: () => void,
): FilterPanelReturn {
  // Panel visibility
  const [panelOpen, setPanelOpen] = useState(false);

  // Core filter state
  const [period, setPeriodRaw] = useState(config.period ? initPeriod : "");
  const [dateFrom, setDateFromRaw] = useState(
    config.period ? initDateFrom : "",
  );
  const [dateTo, setDateToRaw] = useState(config.period ? initDateTo : "");
  const [channel, setChannelRaw] = useState("");
  const [search, setSearch] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [status, setStatusRaw] = useState("");
  const [counterpartySource, setCounterpartySourceRaw] = useState("");
  const [custom, setCustomRaw] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    config.custom?.forEach((c) => {
      if (c.initialValue) s[c.key] = c.initialValue;
    });
    return s;
  });

  // Input display values (before debounce)
  const [searchInput, setSearchInputRaw] = useState("");
  const [amountMinInput, setAmountMinInputRaw] = useState("");
  const [amountMaxInput, setAmountMaxInputRaw] = useState("");

  // Debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function debounce(fn: () => void) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 400);
  }

  // Notify parent of filter change (for page reset, etc.)
  const notify = useCallback(() => {
    onFilterChange?.();
  }, [onFilterChange]);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setPeriod = useCallback(
    (p: string) => {
      setPeriodRaw(p);
      if (p) {
        setDateFromRaw(periodFirstDay(p));
        setDateToRaw(periodLastDay(p));
      }
      notify();
    },
    [notify],
  );

  const setDateFrom = useCallback(
    (v: string) => {
      setDateFromRaw((prev) => {
        const newVal = v && dateTo && dateTo < v ? monthFirstDay(dateTo) : v;
        return newVal;
      });
      setPeriodRaw("");
      notify();
    },
    [dateTo, notify],
  );

  const setDateTo = useCallback(
    (v: string) => {
      setDateToRaw(v);
      if (v && dateFrom && v < dateFrom) setDateFromRaw(monthFirstDay(v));
      setPeriodRaw("");
      notify();
    },
    [dateFrom, notify],
  );

  const setChannel = useCallback(
    (v: string) => {
      setChannelRaw(v);
      notify();
    },
    [notify],
  );

  const setSearchInput = useCallback(
    (v: string) => {
      setSearchInputRaw(v);
      if (!v) {
        setSearch("");
        notify();
        return;
      }
      debounce(() => {
        setSearch(v);
        notify();
      });
    },
    [notify],
  );

  const setAmountMinInput = useCallback(
    (v: string) => {
      setAmountMinInputRaw(v);
      debounce(() => {
        setAmountMin(v);
        notify();
      });
    },
    [notify],
  );

  const setAmountMaxInput = useCallback(
    (v: string) => {
      setAmountMaxInputRaw(v);
      debounce(() => {
        setAmountMax(v);
        notify();
      });
    },
    [notify],
  );

  const setStatus = useCallback(
    (v: string) => {
      setStatusRaw(v);
      notify();
    },
    [notify],
  );

  const setCounterpartySource = useCallback(
    (v: string) => {
      setCounterpartySourceRaw(v);
      notify();
    },
    [notify],
  );

  const setCustom = useCallback(
    (key: string, v: string) => {
      setCustomRaw((prev) => ({ ...prev, [key]: v }));
      notify();
    },
    [notify],
  );

  // ── Reset ────────────────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    if (config.period) {
      const p = initPeriod();
      setPeriodRaw(p);
      setDateFromRaw(periodFirstDay(p));
      setDateToRaw(periodLastDay(p));
    } else {
      setPeriodRaw("");
      setDateFromRaw("");
      setDateToRaw("");
    }
    setChannelRaw("");
    setSearch("");
    setSearchInputRaw("");
    setAmountMin("");
    setAmountMax("");
    setAmountMinInputRaw("");
    setAmountMaxInputRaw("");
    setStatusRaw("");
    setCounterpartySourceRaw("");

    const initialCustomState: Record<string, string> = {};
    config.custom?.forEach((c) => {
      if (c.initialValue) initialCustomState[c.key] = c.initialValue;
    });
    setCustomRaw(initialCustomState);
    notify();
  }, [config, notify]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const hasActiveFilter = useMemo(() => {
    const defaultPeriod = config.period ? initPeriod() : "";
    const defaultFrom = config.period ? initDateFrom() : "";
    const defaultTo = config.period ? initDateTo() : "";

    return (
      period !== defaultPeriod ||
      dateFrom !== defaultFrom ||
      dateTo !== defaultTo ||
      !!channel ||
      !!search ||
      !!amountMin ||
      !!amountMax ||
      !!status ||
      !!counterpartySource ||
      Object.entries(custom).some(([k, v]) => {
        const c = config.custom?.find((x) => x.key === k);
        return c?.initialValue ? v !== c.initialValue : !!v;
      })
    );
  }, [
    period,
    dateFrom,
    dateTo,
    channel,
    search,
    amountMin,
    amountMax,
    status,
    counterpartySource,
    custom,
    config.period,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const defaultPeriod = config.period ? initPeriod() : "";
    const defaultFrom = config.period ? initDateFrom() : "";
    const defaultTo = config.period ? initDateTo() : "";
    if (
      period !== defaultPeriod ||
      dateFrom !== defaultFrom ||
      dateTo !== defaultTo
    )
      count++;
    if (channel) count++;
    if (search) count++;
    if (amountMin || amountMax) count++;
    if (status) count++;
    if (counterpartySource) count++;
    count += Object.entries(custom).filter(([k, v]) => {
      const c = config.custom?.find((x) => x.key === k);
      return c?.initialValue ? v !== c.initialValue : !!v;
    }).length;
    return count;
  }, [
    period,
    dateFrom,
    dateTo,
    channel,
    search,
    amountMin,
    amountMax,
    status,
    counterpartySource,
    custom,
    config.period,
  ]);

  return {
    state: {
      period,
      dateFrom,
      dateTo,
      channel,
      search,
      amountMin,
      amountMax,
      status,
      counterpartySource,
      custom,
    },
    inputs: {
      search: searchInput,
      amountMin: amountMinInput,
      amountMax: amountMaxInput,
    },
    panelOpen,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
    togglePanel: () => setPanelOpen((v) => !v),
    setPeriod,
    setDateFrom,
    setDateTo,
    setChannel,
    setSearchInput,
    setAmountMinInput,
    setAmountMaxInput,
    setStatus,
    setCounterpartySource,
    setCustom,
    resetAll,
    hasActiveFilter,
    activeFilterCount,
  };
}
