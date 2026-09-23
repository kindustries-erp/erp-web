export const DEFAULT_PAGE_SIZE = 20;

export const CHART_COLORS = {
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  blue: "#2563eb",
  indigo: "#4f46e5",
  purple: "#7c3aed",
  slate: "#475569",
  lineNet: "#0f172a",
};

export const IFRS9_PROBABILITY_MATRIX = {
  OUT: {
    under30: 0.85,
    under60: 0.6,
    under90: 0.3,
    over90: 0.1,
  },
  IN: {
    under30: 0.95,
    under60: 0.85,
    under90: 0.7,
    over90: 0.5,
  },
};

export const IFRS9_RISK_PROVISION_MATRIX = {
  OUT: {
    under30: 0.15,
    under60: 0.4,
    under90: 0.7,
    over90: 0.9,
  },
  IN: {
    under30: 0.05,
    under60: 0.15,
    under90: 0.3,
    over90: 0.5,
  },
};
