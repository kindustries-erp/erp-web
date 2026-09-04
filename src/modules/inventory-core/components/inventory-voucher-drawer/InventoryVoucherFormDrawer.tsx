/**
 * InventoryVoucherFormDrawer — Unified shell for all inventory voucher types.
 *
 * Handles the StandardFormDrawer layout, skeleton states, DataTable rendering,
 * and slot composition. Adapters (GrFormDrawer, GiFormDrawer, IaFormDrawer)
 * build the type-specific props and pass them here.
 */
import type { ReactNode } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DataTable } from "@/shared/components/DataTable";
import { Skeleton } from "@/shared/components/Skeleton";
import {
  DrawerSection,
  DrawerField,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { useT } from "@/core/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Re-export DrawerAction so adapters can type their actions array. */
export type { DrawerAction };
export type VoucherDrawerAction = DrawerAction;

export interface InventoryVoucherFormDrawerProps {
  // ── StandardFormDrawer frame ──────────────────────────────────────────────
  open: boolean;
  mode: "view" | "edit" | "create";
  noAnimation?: boolean;
  title: string;
  subtitle?: ReactNode;
  /** Badge for status — shown as titleExtra in header */
  statusBadge?: ReactNode;
  onClose: () => void;
  onToggleEdit?: () => void;
  actions: VoucherDrawerAction[];
  loading?: boolean;
  error?: string | null;

  // ── Right panel ───────────────────────────────────────────────────────────
  /**
   * Content for DrawerSection "Thông tin chung":
   * Số phiếu, Ngày, Loại, SO/PO/MO selector fields.
   */
  rightPanelContent: ReactNode;
  /**
   * Content for DrawerSection "Ghi chú" — separate section below Thông tin chung.
   */
  remarksContent: ReactNode;
  /**
   * Optional custom fields section slot
   */
  customFieldsSlot?: ReactNode;
  /** Number of skeleton rows shown while loading. Default: 5 */
  rightPanelSkeletonCount?: number;

  // ── Left panel — table section ────────────────────────────────────────────
  sectionTitle: ReactNode;
  sectionTitleExtra?: ReactNode;
  tableItems: any[];
  getRowKey: (item: any) => string;
  tableColumns: any[];
  summaryRow?: Record<string, ReactNode>;
  actionsColumn?: { header?: ReactNode; cell: (item: any) => ReactNode };
  emptyLabel?: string;

  // ── Below-table footer (Add line, Import Excel buttons) ───────────────────
  tableFooter?: ReactNode;

  // ── Hidden slots ──────────────────────────────────────────────────────────
  /** <div className="hidden"><PrintTemplate ref={...} /></div> */
  printSlot?: ReactNode;
  /** <ImportExcelModal /> */
  importModalSlot?: ReactNode;

  // ── Unified context (voucher type switcher) ───────────────────────────────
  unifiedContext?: {
    type: "receipt" | "issue" | "adjustment";
    setType: (t: "receipt" | "issue" | "adjustment") => void;
    mode: "create" | "view" | "edit";
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryVoucherFormDrawer(
  props: InventoryVoucherFormDrawerProps,
) {
  const t = useT();
  const skeletonCount = props.rightPanelSkeletonCount ?? 5;

  return (
    <>
      <StandardFormDrawer
        noAnimation={props.noAnimation}
        open={props.open}
        mode={props.mode}
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        onClose={props.onClose}
        onToggleEdit={props.onToggleEdit}
        title={props.title}
        subtitle={props.subtitle}
        titleExtra={props.statusBadge}
        actions={props.actions}
        loading={props.loading}
        error={props.error}
        leftPanel={
          props.loading ? (
            <DrawerSection title={t("Chi tiết")}>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </DrawerSection>
          ) : (
            <DrawerSection
              title={props.sectionTitle}
              titleExtra={props.sectionTitleExtra}
            >
              <DataTable
                items={props.tableItems}
                getRowKey={props.getRowKey}
                variant="spreadsheet"
                emptyLabel={props.emptyLabel ?? t("Không có dữ liệu")}
                containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
                columns={props.tableColumns}
                summaryRow={props.summaryRow}
                actionsColumn={props.actionsColumn}
              />
              {props.tableFooter && (
                <div className="mt-4 flex justify-center gap-3">
                  {props.tableFooter}
                </div>
              )}
            </DrawerSection>
          )
        }
        rightPanel={
          props.loading ? (
            <>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </>
          ) : (
            <>
              {/* ── Thông tin chung ──────────────────────────────── */}
              <DrawerSection title={t("Thông tin chung")}>
                {/* Unified type switcher — chỉ hiển thị khi tạo mới */}
                {props.unifiedContext?.mode === "create" && (
                  <DrawerField label={t("Loại chứng từ")}>
                    <Combobox
                      options={[
                        { value: "receipt", label: t("Phiếu nhập kho") },
                        { value: "issue", label: t("Phiếu xuất kho") },
                        { value: "adjustment", label: t("Điều chỉnh kho") },
                      ]}
                      value={props.unifiedContext.type}
                      onChange={(v) =>
                        props.unifiedContext!.setType(
                          v as "receipt" | "issue" | "adjustment",
                        )
                      }
                      allowClear={false}
                    />
                  </DrawerField>
                )}
                {props.rightPanelContent}
              </DrawerSection>

              {/* ── Trường tùy chỉnh / Thuộc tính động ───────────── */}
              {props.customFieldsSlot}

              {/* ── Ghi chú (section riêng bên dưới) ────────────── */}
              <DrawerSection title={t("Ghi chú")}>
                {props.remarksContent}
              </DrawerSection>
            </>
          )
        }
      />

      {/* Hidden print template */}
      {props.printSlot}

      {/* Import Excel modal */}
      {props.importModalSlot}
    </>
  );
}
