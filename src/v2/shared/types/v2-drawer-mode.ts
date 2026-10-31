/**
 * Shared Enum quản lý các chế độ hiển thị/chỉnh sửa của Drawer/Form trong kiến trúc ERP Web V2.
 */
export enum V2DrawerMode {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

export type V2DrawerModeType = V2DrawerMode.VIEW | V2DrawerMode.EDIT;
