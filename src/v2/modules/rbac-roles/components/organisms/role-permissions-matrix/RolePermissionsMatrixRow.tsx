import * as React from "react";
import { TableRow, TableCell, Checkbox } from "@/v2/shared/ui";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import {
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionMap,
  type ResourceItem,
} from "../../../domain/entities/permission";

interface RolePermissionsMatrixRowProps {
  item: ResourceItem;
  isView: boolean;
  permMap: PermissionMap;
  isRowFull: boolean;
  anyRowChecked: boolean;
  onToggle: (res: string, action: CrudAction) => void;
  onToggleRow: (res: string, checked: boolean) => void;
}

export const RolePermissionsMatrixRow: React.FC<
  RolePermissionsMatrixRowProps
> = ({
  item,
  isView,
  permMap,
  isRowFull,
  anyRowChecked,
  onToggle,
  onToggleRow,
}) => {
  return (
    <TableRow className="hover:bg-muted/40 transition-colors border-none">
      <TableCell
        className={`py-2 pl-9 pr-3 text-foreground font-medium ${isView ? "w-[44%]" : "w-[40%]"}`}
      >
        <div className="flex flex-col gap-0.5">
          <V2Text variant="body-sm" weight="medium" className="leading-snug">
            {item.label}
          </V2Text>
          <V2Text
            variant="caption"
            color="muted"
            className="text-[10px] font-mono leading-none"
          >
            {item.resource}
          </V2Text>
        </div>
      </TableCell>
      {CRUD_ACTIONS.map(({ action }) => (
        <TableCell
          key={action}
          className={`py-2 px-2 text-center ${isView ? "w-[14%]" : "w-[12%]"}`}
        >
          <div className="flex justify-center items-center">
            <Checkbox
              checked={Boolean(permMap[item.resource]?.[action])}
              disabled={isView}
              onCheckedChange={() => onToggle(item.resource, action)}
            />
          </div>
        </TableCell>
      ))}
      {!isView && (
        <TableCell className="py-2 px-2 text-center w-[12%]">
          <div className="flex justify-center">
            <Checkbox
              checked={
                !isRowFull && anyRowChecked ? "indeterminate" : isRowFull
              }
              onCheckedChange={(v) => onToggleRow(item.resource, v === true)}
            />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
