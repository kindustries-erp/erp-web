import { useState, useCallback, useRef } from "react";
import {
  getCollectionFieldsApi,
  getRolePermissionsApi,
  saveRolePermissionsApi,
} from "@/modules/system/api/rbacApi";
import {
  RBAC_COLLECTIONS,
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionConfig,
  type PermissionConfigMap,
  type PermissionFieldDef,
  type Permission,
  type PermissionMap,
  type SavePermissionsDto,
} from "@/modules/system/types/rbac";
import { extractApiError } from "@/shared/utils/apiError";

interface PermissionsEditorOptions {
  getApi?: (id: string) => Promise<Permission[]>;
  saveApi?: (id: string, dto: SavePermissionsDto) => Promise<void>;
}

const DEFAULT_PERMISSION_CONFIG: PermissionConfig = {
  isAllFields: true,
  fields: [],
  permissions: null,
  validation: null,
  presets: {},
};

function buildEmptyMap(): PermissionMap {
  const map: PermissionMap = {};
  for (const col of RBAC_COLLECTIONS) {
    map[col.collection] = {
      create: false,
      read: false,
      update: false,
      delete: false,
    };
  }
  return map;
}

function cloneDefaultPermissionConfig(): PermissionConfig {
  return {
    isAllFields: DEFAULT_PERMISSION_CONFIG.isAllFields,
    fields: [],
    permissions: null,
    validation: null,
    presets: {},
  };
}

function buildEmptyConfigMap(): PermissionConfigMap {
  const map = {} as PermissionConfigMap;
  for (const col of RBAC_COLLECTIONS) {
    map[col.collection] = {
      create: cloneDefaultPermissionConfig(),
      read: cloneDefaultPermissionConfig(),
      update: cloneDefaultPermissionConfig(),
      delete: cloneDefaultPermissionConfig(),
    };
  }
  return map;
}

function normalizePermissionConfig(permission: Permission): PermissionConfig {
  const isWildcard =
    permission.fields === "*" ||
    (Array.isArray(permission.fields) && permission.fields.includes("*"));
  const explicitFields = Array.isArray(permission.fields)
    ? permission.fields.filter((f) => f !== "*")
    : [];

  return {
    isAllFields: isWildcard || !permission.fields,
    fields: explicitFields,
    permissions: permission.permissions ?? null,
    validation: permission.validation ?? null,
    presets: permission.presets ?? {},
  };
}

function sanitizeConfig(config: PermissionConfig): PermissionConfig {
  return {
    isAllFields: config.isAllFields,
    fields: Array.from(new Set(config.fields.filter(Boolean))),
    permissions: config.permissions ?? null,
    validation: config.validation ?? null,
    presets: config.presets ?? {},
  };
}

function permissionsToState(permissions: Permission[]): {
  map: PermissionMap;
  configMap: PermissionConfigMap;
} {
  const map = buildEmptyMap();
  const configMap = buildEmptyConfigMap();

  for (const p of permissions) {
    if (map[p.collection] && p.action in map[p.collection]) {
      // Treat `access: true` OR missing `access` field (presence = granted) as true.
      // Only `access: false` explicitly removes it.
      map[p.collection][p.action] = p.access !== false;
      configMap[p.collection][p.action] = normalizePermissionConfig(p);
    }
  }

  return { map, configMap };
}

function mapToPermissions(
  map: PermissionMap,
  configMap: PermissionConfigMap,
): Permission[] {
  const result: Permission[] = [];
  for (const col of RBAC_COLLECTIONS) {
    for (const { action } of CRUD_ACTIONS) {
      const hasAccess = map[col.collection]?.[action] ?? false;
      const config = sanitizeConfig(
        configMap[col.collection]?.[action] ?? cloneDefaultPermissionConfig(),
      );

      result.push({
        collection: col.collection,
        action,
        access: hasAccess,
        fields: hasAccess
          ? config.isAllFields
            ? ["*"]
            : config.fields
          : undefined,
        permissions: hasAccess ? config.permissions : undefined,
        validation: hasAccess ? config.validation : undefined,
        presets: hasAccess ? config.presets : undefined,
      });
    }
  }
  return result;
}

export function usePermissionsEditor(options?: PermissionsEditorOptions) {
  const getApiRef = useRef(options?.getApi ?? getRolePermissionsApi);
  const saveApiRef = useRef(options?.saveApi ?? saveRolePermissionsApi);

  const [roleId, setRoleId] = useState<string | null>(null);
  const [permMap, setPermMap] = useState<PermissionMap>(buildEmptyMap());
  const [permConfigMap, setPermConfigMap] = useState<PermissionConfigMap>(
    buildEmptyConfigMap(),
  );
  const [collectionFieldsMap, setCollectionFieldsMap] = useState<
    Record<string, PermissionFieldDef[]>
  >({});
  const collectionFieldsCacheRef = useRef<Record<string, PermissionFieldDef[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async (id: string) => {
    setRoleId(id);
    setLoading(true);
    setError(null);
    try {
      const permissions = await getApiRef.current(id);
      const { map, configMap } = permissionsToState(permissions);
      setPermMap(map);
      setPermConfigMap(configMap);
    } catch (e) {
      setError(extractApiError(e, "Không thể tải quyền."));
      setPermMap(buildEmptyMap());
      setPermConfigMap(buildEmptyConfigMap());
    } finally {
      setLoading(false);
    }
  }, []);

  function toggle(collection: string, action: CrudAction) {
    setPermMap((prev) => ({
      ...prev,
      [collection]: {
        ...prev[collection],
        [action]: !prev[collection]?.[action],
      },
    }));
  }

  function getPermissionConfig(
    collection: string,
    action: CrudAction,
  ): PermissionConfig {
    return (
      permConfigMap[collection]?.[action] ?? cloneDefaultPermissionConfig()
    );
  }

  function updatePermissionConfig(
    collection: string,
    action: CrudAction,
    patch: Partial<PermissionConfig>,
  ) {
    setPermConfigMap((prev) => {
      const current =
        prev[collection]?.[action] ?? cloneDefaultPermissionConfig();
      const next = sanitizeConfig({
        ...current,
        ...patch,
      });

      return {
        ...prev,
        [collection]: {
          ...(prev[collection] ?? {
            create: cloneDefaultPermissionConfig(),
            read: cloneDefaultPermissionConfig(),
            update: cloneDefaultPermissionConfig(),
            delete: cloneDefaultPermissionConfig(),
          }),
          [action]: next,
        },
      };
    });
  }

  const loadCollectionFields = useCallback(
    async (collection: string): Promise<PermissionFieldDef[]> => {
      const cached = collectionFieldsCacheRef.current[collection];
      if (cached) return cached;

      const fields = await getCollectionFieldsApi(collection);
      collectionFieldsCacheRef.current = {
        ...collectionFieldsCacheRef.current,
        [collection]: fields,
      };
      setCollectionFieldsMap({ ...collectionFieldsCacheRef.current });
      return fields;
    },
    [], // stable — reads/writes cache via ref, not state
  );

  function getCollectionFields(collection: string): PermissionFieldDef[] {
    return collectionFieldsMap[collection] ?? [];
  }

  function toggleRow(collection: string, value: boolean) {
    setPermMap((prev) => ({
      ...prev,
      [collection]: {
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
      for (const col of RBAC_COLLECTIONS) {
        next[col.collection] = { ...next[col.collection], [action]: value };
      }
      return next;
    });
  }

  function isRowFull(collection: string): boolean {
    return CRUD_ACTIONS.every((a) => permMap[collection]?.[a.action]);
  }

  function isColumnFull(action: CrudAction): boolean {
    return RBAC_COLLECTIONS.every((c) => permMap[c.collection]?.[action]);
  }

  function isAllFull(): boolean {
    return RBAC_COLLECTIONS.every((col) =>
      CRUD_ACTIONS.every((a) => permMap[col.collection]?.[a.action]),
    );
  }

  function isAnyChecked(): boolean {
    return RBAC_COLLECTIONS.some((col) =>
      CRUD_ACTIONS.some((a) => permMap[col.collection]?.[a.action]),
    );
  }

  function toggleAll(value: boolean) {
    const next: PermissionMap = {};
    for (const col of RBAC_COLLECTIONS) {
      next[col.collection] = {
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
      await saveApiRef.current(id, {
        permissions: mapToPermissions(permMap, permConfigMap),
      });
    } catch (e) {
      throw new Error(extractApiError(e, "Lưu quyền thất bại."));
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setRoleId(null);
    setPermMap(buildEmptyMap());
    setPermConfigMap(buildEmptyConfigMap());
    setError(null);
  }

  return {
    permMap,
    permConfigMap,
    loading,
    saving,
    error,
    loadPermissions,
    toggle,
    toggleRow,
    toggleColumn,
    isRowFull,
    isColumnFull,
    isAllFull,
    isAnyChecked,
    toggleAll,
    getPermissionConfig,
    updatePermissionConfig,
    loadCollectionFields,
    getCollectionFields,
    save,
    reset,
  };
}
