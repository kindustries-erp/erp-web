import { useMemo, useState } from "react";
import {
  DrawerModal,
  DrawerField,
  DrawerSection,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { MultiSelect } from "@/shared/components/MultiSelect";
import { useT } from "@/core/i18n";
import type {
  CrudAction,
  PermissionConfig,
  PermissionFieldDef,
} from "@/modules/system/types/rbac";
import { FieldFilterTreeEditor } from "./FieldFilterTreeEditor";

interface FieldOption {
  value: string;
  label: string;
  description?: string;
}
export interface FieldConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  subtitle: string;
  zIndex?: number;
  stackOffset?: number;
  selectedPermissionKey: string;
  activePermissionOptions: { value: string; label: string }[];
  selectedPermission: { collection: string; action: CrudAction } | null;
  selectedConfig: PermissionConfig | null;
  onPermissionConfigChange: (
    collection: string,
    action: CrudAction,
    patch: Partial<PermissionConfig>,
  ) => void;
  onLoadCollectionFields: (collection: string) => Promise<PermissionFieldDef[]>;
}

export function FieldConfigDrawer({
  open,
  onClose,
  subtitle,
  zIndex = 410,
  stackOffset = -2.5,
  selectedPermissionKey,
  activePermissionOptions,
  selectedPermission,
  selectedConfig,
  onPermissionConfigChange,
  onLoadCollectionFields,
}: FieldConfigDrawerProps) {
  const t = useT();
  const [availableFields, setAvailableFields] = useState<PermissionFieldDef[]>(
    [],
  );
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState<string | null>(null);
  async function loadFieldsForPermission(collection: string) {
    setFieldsLoading(true);
    setFieldsError(null);
    try {
      const rows = await onLoadCollectionFields(collection);
      setAvailableFields(rows);
    } catch {
      setAvailableFields([]);
      setFieldsError(t("permissionMatrix.fieldConfig.loadFieldsError"));
    } finally {
      setFieldsLoading(false);
    }
  }

  const fieldOptions: FieldOption[] = availableFields.map((item) => ({
    value: item.field,
    label: item.name || item.field,
    description: item.type || undefined,
  }));
  const selectedPermissionLabel = useMemo(
    () =>
      activePermissionOptions.find((o) => o.value === selectedPermissionKey)
        ?.label ?? "",
    [activePermissionOptions, selectedPermissionKey],
  );

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("permissionMatrix.fieldConfig.title")}
      subtitle={subtitle}
      zIndex={zIndex}
      stackOffset={stackOffset}
      panelClassName="!w-[560px]"
      actions={[{ label: t("permissionMatrix.btnClose"), onClick: onClose }]}
    >
      {activePermissionOptions.length === 0 ? (
        <p className="text-xs text-[color:var(--muted-fg)]">
          {t("permissionMatrix.fieldConfig.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          <DrawerField label={t("permissionMatrix.fieldConfig.permission")}>
            <div className="w-full text-xs text-foreground bg-[color:var(--muted)] border border-[color:var(--border)] rounded-lg px-3 py-2">
              {selectedPermissionLabel ||
                t("permissionMatrix.fieldConfig.permissionPlaceholder")}
            </div>
          </DrawerField>
          {selectedPermission && selectedConfig && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedConfig.isAllFields}
                  onCheckedChange={(v) => {
                    const next = v === true;
                    const patch: Partial<typeof selectedConfig> = {
                      isAllFields: next,
                    };
                    if (!next) patch.validation = null;
                    onPermissionConfigChange(
                      selectedPermission.collection,
                      selectedPermission.action,
                      patch,
                    );
                  }}
                />
                <span className="text-xs text-foreground">
                  {t("permissionMatrix.fieldConfig.allFields")}
                </span>
              </label>
              {!selectedConfig.isAllFields && (
                <FieldSelector
                  {...{
                    t,
                    fieldOptions,
                    fieldsLoading,
                    fieldsError,
                    selectedConfig,
                    selectedPermission,
                    onPermissionConfigChange,
                  }}
                />
              )}
              <DrawerSection
                title={t("permissionMatrix.fieldConfig.validationTitle")}
              >
                <FieldFilterTreeEditor
                  {...{
                    open,
                    t,
                    selectedPermissionKey,
                    selectedPermission,
                    selectedConfig,
                    fieldOptions,
                    fieldsLoading,
                    onPermissionConfigChange,
                  }}
                />
              </DrawerSection>
            </>
          )}
        </div>
      )}
    </DrawerModal>
  );
}

function FieldSelector({
  t,
  fieldOptions,
  fieldsLoading,
  fieldsError,
  selectedConfig,
  selectedPermission,
  onPermissionConfigChange,
}: any) {
  return (
    <DrawerField label={t("permissionMatrix.fieldConfig.fields")}>
      {fieldsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : fieldOptions.length === 0 ? (
        <p className="text-[11px] text-[color:var(--muted-fg)]">
          {t("permissionMatrix.fieldConfig.fieldsEmpty")}
        </p>
      ) : (
        <MultiSelect
          options={fieldOptions}
          value={selectedConfig.fields}
          onChange={(vals) =>
            onPermissionConfigChange(
              selectedPermission.collection,
              selectedPermission.action,
              { fields: vals },
            )
          }
          placeholder={t("permissionMatrix.fieldConfig.fieldsEmpty")}
          searchPlaceholder="Tìm field..."
          emptyLabel={t("permissionMatrix.fieldConfig.fieldsEmpty")}
        />
      )}
      {fieldsError && (
        <p className="mt-1 text-[11px] text-red-500">{fieldsError}</p>
      )}
    </DrawerField>
  );
}
