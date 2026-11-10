import { V2Input, V2Text } from "@/v2/shared/components";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import type { ProcurementLineColumn } from "./ProcurementLinesEditor.columns";

/** Cột Ghi chú của từng dòng chứng từ PR/PO, lưu vào trường `description` của dòng. */
export const procurementLineNoteColumn: ProcurementLineColumn = {
  id: "note",
  headerKey: "v2.procurement.lines.note",
  defaultHeader: "Ghi chú",
  headerClassName: "p-2 text-left min-w-[180px] w-[34%]",
  cellClassName: "p-2 text-xs min-w-[180px] w-[34%]",
  renderCell: ({ viewing, line, onPatch, t }) =>
    viewing ? (
      <V2Text className="text-xs">{line.description || "—"}</V2Text>
    ) : (
      <V2Input
        sizeVariant="xs"
        aria-label={t("v2.procurement.lines.note", "Ghi chú")}
        className={V2_DRAWER_FOCUS_RING_CLASS}
        value={line.description}
        onChange={(e) => onPatch({ description: e.target.value })}
      />
    ),
};
