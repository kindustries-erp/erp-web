import { useState, useCallback } from "react";
import { type VisibilityState } from "@tanstack/react-table";

export interface TablePreference {
  columnOrder: string[];
  columnVisibility: VisibilityState;
}

export interface UserPreferences {
  theme?: string;
  language?: string;
  tables: Record<string, TablePreference>;
}

const PREF_KEY = "erp_preferences";

const defaultPreferences: UserPreferences = {
  tables: {},
};

export function useUserPreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (stored) {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to parse user preferences", e);
    }
    return defaultPreferences;
  });

  const setTablePreferences = useCallback(
    (tableId: string, pref: TablePreference) => {
      setPreferencesState((prev) => {
        const newPrefs = {
          ...prev,
          tables: {
            ...(prev.tables || {}),
            [tableId]: pref,
          },
        };
        try {
          localStorage.setItem(PREF_KEY, JSON.stringify(newPrefs));
        } catch (e) {
          console.error("Failed to save user preferences", e);
        }
        return newPrefs;
      });
    },
    [],
  );

  const getTablePreference = useCallback(
    (tableId: string): TablePreference | undefined => {
      return preferences.tables?.[tableId];
    },
    [preferences],
  );

  return {
    preferences,
    setTablePreferences,
    getTablePreference,
  };
}
