import { useQuery } from "@tanstack/react-query";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

export function useModuleGlobalAttributesQuery(
  moduleKey: string,
  isOpen: boolean = true,
) {
  return useQuery({
    queryKey: ["module-config-global-defs", moduleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(moduleKey),
    enabled: isOpen && !!moduleKey,
  });
}

export function useModuleCategoriesQuery(
  moduleKey: string,
  isOpen: boolean = true,
) {
  return useQuery({
    queryKey: ["module-config-categories", moduleKey],
    queryFn: () => moduleConfigApi.getCategories(moduleKey),
    enabled: isOpen && !!moduleKey,
  });
}
