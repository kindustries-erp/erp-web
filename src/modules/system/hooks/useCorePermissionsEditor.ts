import { useState, useCallback } from "react";
import {
  getCoreRolePermissionsApi,
  saveCoreRolePermissionsApi,
  getCoreAvailableResourcesApi,
} from "@/modules/system/api/rbacCoreApi";
import {
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionMap,
} from "@/modules/system/types/rbac";
import { extractApiError } from "@/shared/utils/apiError";

export function useCorePermissionsEditor() {
  const [roleId, setRoleId] = useState<string | null>(null);
  const [permMap, setPermMap] = useState<PermissionMap>({});
  const [initialPermMap, setInitialPermMap] = useState<PermissionMap>({});
  const [resources, setResources] = useState<
    { resource: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    try {
      const res = await getCoreAvailableResourcesApi();
      setResources(res.filter((r) => r.resource !== "*")); // Hide wildcard from UI matrix usually
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadPermissions = useCallback(async (id: string) => {
    setRoleId(id);
    setLoading(true);
    setError(null);
    try {
      const permissions = await getCoreRolePermissionsApi(id);

      const map: PermissionMap = {};
      // initialize empty map for all available resources
      const currentResources = await getCoreAvailableResourcesApi();
      const filteredResources = currentResources.filter(
        (r) => r.resource !== "*",
      );
      setResources(filteredResources);

      for (const res of filteredResources) {
        map[res.resource] = {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
      }

      // fill map
      for (const p of permissions) {
        if (p.action === "*") {
          if (p.resource === "*") {
            // Super admin, check all
            for (const res of filteredResources) {
              map[res.resource] = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
            }
          } else if (map[p.resource]) {
            map[p.resource] = {
              create: true,
              read: true,
              update: true,
              delete: true,
            };
          }
        } else if (map[p.resource]) {
          map[p.resource][p.action as CrudAction] = true;
        }
      }

      setPermMap(map);
      setInitialPermMap(JSON.parse(JSON.stringify(map)));
    } catch (e) {
      setError(extractApiError(e, "Không thể tải quyền."));
      setPermMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  function toggle(resource: string, action: CrudAction) {
    setPermMap((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  }

  function toggleRow(resource: string, value: boolean) {
    setPermMap((prev) => ({
      ...prev,
      [resource]: {
        create: value,
        read: value,
        update: value,
        delete: value,
      },
    }));
  }

  function toggleColumn(action: CrudAction, value: boolean) {
    setPermMap((prev) => {
      const next = { ...prev };
      for (const r of resources) {
        next[r.resource] = { ...next[r.resource], [action]: value };
      }
      return next;
    });
  }

  function isRowFull(resource: string): boolean {
    return CRUD_ACTIONS.every((a) => permMap[resource]?.[a.action]);
  }

  function isColumnFull(action: CrudAction): boolean {
    return (
      resources.length > 0 &&
      resources.every((r) => permMap[r.resource]?.[action])
    );
  }

  function isAllFull(): boolean {
    return (
      resources.length > 0 &&
      resources.every((r) =>
        CRUD_ACTIONS.every((a) => permMap[r.resource]?.[a.action]),
      )
    );
  }

  function isAnyChecked(): boolean {
    return resources.some((r) =>
      CRUD_ACTIONS.some((a) => permMap[r.resource]?.[a.action]),
    );
  }

  function toggleAll(value: boolean) {
    const next: PermissionMap = {};
    for (const r of resources) {
      next[r.resource] = {
        create: value,
        read: value,
        update: value,
        delete: value,
      };
    }
    setPermMap(next);
  }

  async function save(overrideRoleId?: string): Promise<void> {
    const id = overrideRoleId ?? roleId;
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const permissionsToSave: { resource: string; action: string }[] = [];
      for (const resource of resources) {
        const row = permMap[resource.resource];
        if (!row) continue;
        if (row.create && row.read && row.update && row.delete) {
          permissionsToSave.push({ resource: resource.resource, action: "*" });
        } else {
          for (const { action } of CRUD_ACTIONS) {
            if (row[action]) {
              permissionsToSave.push({ resource: resource.resource, action });
            }
          }
        }
      }
      await saveCoreRolePermissionsApi(id, permissionsToSave);
    } catch (e) {
      throw new Error(extractApiError(e, "Lưu quyền thất bại."));
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setRoleId(null);
    setPermMap({});
    setInitialPermMap({});
    setError(null);
  }

  return {
    initialPermMap,
    permMap,
    resources,
    loading,
    saving,
    error,
    loadResources,
    loadPermissions,
    toggle,
    toggleRow,
    toggleColumn,
    isRowFull,
    isColumnFull,
    isAllFull,
    isAnyChecked,
    toggleAll,
    save,
    reset,
  };
}
