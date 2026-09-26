import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import {
  moduleConfigApi,
  resolveAttrName,
  resolveCategoryName,
  type ModuleAttributeFieldType,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";
import {
  ERP_MODULE_REGISTRY,
  type ErpModuleDomain,
} from "@/shared/components/ModuleCustomFieldConfigDrawer";

export interface CustomFieldRow {
  id: string;
  moduleKey: string;
  moduleName: string;
  domain: ErpModuleDomain;
  code: string;
  name: string;
  nameEn?: string | null;
  fieldType: ModuleAttributeFieldType;
  isSystem: boolean;
  isGlobal: boolean;
  categoryId?: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  defaultDebitAccountId?: string | null;
  defaultDebitAccountCode?: string | null;
  defaultDebitAccountName?: string | null;
  parentAttrCode?: string | null;
  options?: ModuleAttributeOption[] | null;
  optionsCount: number;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useCustomFieldsList(
  initialDomain: string = "ALL",
  initialModule: string = "ALL",
) {
  const t = useT();
  const locale = useAppStore((s) => s.locale);

  // Tab states: Domain & Module
  const [activeDomain, setActiveDomain] = useState<string>(initialDomain);
  const [activeModule, setActiveModule] = useState<string>(initialModule);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);

  // Sorting & Column Filtering
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  // Fetch all global defs across modules
  const {
    data: rawGlobalDefs = [],
    isLoading: isGlobalLoading,
    refetch: refetchGlobal,
  } = useQuery({
    queryKey: ["custom-fields-all-global-defs"],
    queryFn: async () => {
      // Fetch global attribute defs for each module in registry
      const results = await Promise.all(
        ERP_MODULE_REGISTRY.map(async (mod) => {
          try {
            const defs = await moduleConfigApi.getGlobalAttributeDefs(mod.key);
            return defs.map((d) => ({ ...d, moduleKeyGlobal: mod.key }));
          } catch {
            return [];
          }
        }),
      );
      return results.flat();
    },
    staleTime: 60_000,
  });

  // Fetch all categories across modules (which contain category-specific attribute defs)
  const {
    data: rawCategories = [],
    isLoading: isCatLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["custom-fields-all-categories"],
    queryFn: async () => {
      const results = await Promise.all(
        ERP_MODULE_REGISTRY.map(async (mod) => {
          try {
            const cats = await moduleConfigApi.getCategories(mod.key);
            return cats.map((c) => ({ ...c, moduleKey: mod.key }));
          } catch {
            return [];
          }
        }),
      );
      return results.flat();
    },
    staleTime: 60_000,
  });

  const isLoading = isGlobalLoading || isCatLoading;

  // Flatten and normalize into CustomFieldRow[]
  const allRows: CustomFieldRow[] = useMemo(() => {
    const rows: CustomFieldRow[] = [];
    const moduleMap = new Map<string, (typeof ERP_MODULE_REGISTRY)[0]>();
    ERP_MODULE_REGISTRY.forEach((m) => moduleMap.set(m.key, m));

    // 1. Process Global Attributes
    for (const def of rawGlobalDefs) {
      if (def.isDeleted) continue;
      const modKey = (def.moduleKeyGlobal || "BOM").toUpperCase();
      const modDef = moduleMap.get(modKey);
      const modName = modDef ? t(modDef.nameKey, modDef.defaultName) : modKey;
      const domain: ErpModuleDomain = modDef?.domain || "INVENTORY";
      const displayName = resolveAttrName(def, modKey, null, t, locale);

      rows.push({
        id: def.id,
        moduleKey: modKey,
        moduleName: modName,
        domain,
        code: def.code,
        name: displayName,
        nameEn: def.nameEn || null,
        fieldType: def.fieldType,
        isSystem: Boolean(def.isSystem),
        isGlobal: true,
        categoryId: null,
        categoryCode: null,
        categoryName: null,
        parentAttrCode: def.parentAttrCode || null,
        options: def.options || null,
        optionsCount: def.options?.length || 0,
        sortOrder: def.sortOrder || 0,
        isRequired: Boolean(def.isRequired),
        isActive: def.isActive !== false,
        usageCount: def.usageCount || 0,
        createdAt: def.createdAt,
        updatedAt: def.updatedAt,
      });
    }

    // 2. Process Category-specific Attributes
    for (const cat of rawCategories) {
      if (cat.isDeleted) continue;
      const modKey = (cat.moduleKey || "BOM").toUpperCase();
      const modDef = moduleMap.get(modKey);
      const modName = modDef ? t(modDef.nameKey, modDef.defaultName) : modKey;
      const domain: ErpModuleDomain = modDef?.domain || "INVENTORY";
      const catDisplayName = resolveCategoryName(cat, t, locale);

      for (const def of cat.attributeDefs || []) {
        if (def.isDeleted || def.isGlobal) continue;
        const displayName = resolveAttrName(def, modKey, cat.code, t, locale);

        rows.push({
          id: def.id,
          moduleKey: modKey,
          moduleName: modName,
          domain,
          code: def.code,
          name: displayName,
          nameEn: def.nameEn || null,
          fieldType: def.fieldType,
          isSystem: Boolean(def.isSystem),
          isGlobal: false,
          categoryId: cat.id,
          categoryCode: cat.code,
          categoryName: catDisplayName,
          defaultDebitAccountId: cat.defaultDebitAccountId || null,
          defaultDebitAccountCode:
            cat.defaultDebitAccount?.accountCode ||
            cat.defaultDebitAccount?.account_code ||
            null,
          defaultDebitAccountName:
            cat.defaultDebitAccount?.accountName ||
            cat.defaultDebitAccount?.account_name ||
            null,
          parentAttrCode: def.parentAttrCode || null,
          options: def.options || null,
          optionsCount: def.options?.length || 0,
          sortOrder: def.sortOrder || 0,
          isRequired: Boolean(def.isRequired),
          isActive: def.isActive !== false,
          usageCount: def.usageCount || 0,
          createdAt: def.createdAt,
          updatedAt: def.updatedAt,
        });
      }
    }

    return rows;
  }, [rawGlobalDefs, rawCategories, t, locale]);

  // Filter rows based on domain, module, search, column filters
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      // 1. Domain Filter
      if (activeDomain !== "ALL" && row.domain !== activeDomain) {
        return false;
      }

      // 2. Sub-module Filter
      if (activeModule !== "ALL" && row.moduleKey !== activeModule) {
        return false;
      }

      // 3. Column Search
      for (const [key, searchVal] of Object.entries(columnSearch)) {
        if (!searchVal || !searchVal.trim()) continue;
        const term = searchVal.trim().toLowerCase();
        const val = String((row as any)[key] || "").toLowerCase();
        if (!val.includes(term)) return false;
      }

      // 4. Column Filters (multi-select)
      for (const [key, selectedVals] of Object.entries(columnFilters)) {
        if (!selectedVals || selectedVals.length === 0) continue;

        if (key === "scope") {
          const rowScope = row.isGlobal ? "GLOBAL" : "CATEGORY";
          if (!selectedVals.includes(rowScope)) return false;
          continue;
        }

        if (key === "isSystem") {
          const rowSystem = row.isSystem ? "true" : "false";
          if (!selectedVals.includes(rowSystem)) return false;
          continue;
        }

        if (key === "isRequired") {
          const rowReq = row.isRequired ? "true" : "false";
          if (!selectedVals.includes(rowReq)) return false;
          continue;
        }

        if (key === "isActive") {
          const rowActive = row.isActive ? "true" : "false";
          if (!selectedVals.includes(rowActive)) return false;
          continue;
        }

        const rowVal = String((row as any)[key] || "");
        if (!selectedVals.includes(rowVal)) return false;
      }

      return true;
    });
  }, [allRows, activeDomain, activeModule, columnSearch, columnFilters]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (sorts.length === 0) {
      // Default sort: Module -> SortOrder -> Code
      return [...filteredRows].sort((a, b) => {
        if (a.moduleKey !== b.moduleKey)
          return a.moduleKey.localeCompare(b.moduleKey);
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.code.localeCompare(b.code);
      });
    }

    return [...filteredRows].sort((a, b) => {
      for (const sortStr of sorts) {
        const isDesc = sortStr.startsWith("-");
        const key = isDesc ? sortStr.substring(1) : sortStr;
        const valA = (a as any)[key];
        const valB = (b as any)[key];

        if (valA === valB) continue;
        if (valA === undefined || valA === null) return isDesc ? 1 : -1;
        if (valB === undefined || valB === null) return isDesc ? -1 : 1;

        if (typeof valA === "number" && typeof valB === "number") {
          return isDesc ? valB - valA : valA - valB;
        }

        if (typeof valA === "boolean" && typeof valB === "boolean") {
          const numA = valA ? 1 : 0;
          const numB = valB ? 1 : 0;
          return isDesc ? numB - numA : numA - numB;
        }

        const strA = String(valA);
        const strB = String(valB);
        const cmp = strA.localeCompare(strB);
        if (cmp !== 0) return isDesc ? -cmp : cmp;
      }
      return 0;
    });
  }, [filteredRows, sorts]);

  // Pagination calculation
  const total = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  // Setters with auto-page reset
  const handleDomainChange = useCallback((newDomain: string) => {
    setActiveDomain(newDomain);
    setActiveModule("ALL");
    setPage(1);
  }, []);

  const handleModuleChange = useCallback((newModule: string) => {
    setActiveModule(newModule);
    setPage(1);
  }, []);

  const setSort = useCallback((key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  }, []);

  const setColumnFilter = useCallback((key: string, vals: string[]) => {
    setColumnFilters((prev) => ({ ...prev, [key]: vals }));
    setPage(1);
  }, []);

  const setColumnSearchVal = useCallback((key: string, val: string) => {
    setColumnSearch((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (activeModule !== "ALL") count += 1;
    return count;
  }, [columnFilters, columnSearch, activeModule]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearch({});
    setActiveModule("ALL");
    setPage(1);
  }, []);

  const refetchAll = useCallback(() => {
    refetchGlobal();
    refetchCategories();
  }, [refetchGlobal, refetchCategories]);

  return {
    rows: paginatedRows,
    allFilteredCount: total,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    setPageSize,
    isLoading,
    activeDomain,
    setActiveDomain: handleDomainChange,
    activeModule,
    setActiveModule: handleModuleChange,
    sorts,
    setSort,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchVal,
    activeFilterCount,
    clearAllFilters,
    refetch: refetchAll,
  };
}
