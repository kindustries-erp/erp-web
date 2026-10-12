import type { InvoiceExportDrawerProps } from "../invoice-export-drawer/InvoiceExportDrawer.type";

export interface InvoiceFileExportDrawerProps extends InvoiceExportDrawerProps {
  /** ID các hóa đơn đang chọn trên bảng; có giá trị thì bật chế độ "Đã chọn". */
  selectedIds: string[];
}
