import * as React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef, Table } from "@tanstack/react-table";

interface TableHarnessProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  /** Mặc định bọc trong `<table>`; tắt khi component tự render `<table>` (ví dụ V2TableGrid) */
  wrapInTable?: boolean;
  children: (table: Table<T>) => React.ReactNode;
}

/** Bọc một bảng TanStack thật để test các phần render nhận `Table<T>` (dùng cho test, không dùng trong production) */
export function TableHarness<T>({
  data,
  columns,
  wrapInTable = true,
  children,
}: TableHarnessProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return wrapInTable ? (
    <table>{children(table)}</table>
  ) : (
    <>{children(table)}</>
  );
}
