export type PageKey =
  | "dashboard"
  | "dongtien"
  | "tienmat"
  | "tiengui"
  | "dinhkem"
  | "thietlap"
  | "phaithu"
  | "phaittra"
  | "socat"
  | "nhatkyechung"
  | "nhansu"
  | "phongban"
  | "chucvu"
  | "banhang"
  | "khachhang"
  | "muahang"
  | "nhacungcap"
  | "activitylog"
  | "doitac"
  | "phanquyen";
export type TxSource = "tienmat" | "tiengui";

export interface Transaction {
  id: number;
  date: string;
  code: string;
  type: "thu" | "chi";
  loai: string;
  doituong: string;
  mst: string;
  diachi: string;
  dienGiai: string;
  amount: number;
  tknNo: string;
  tknCo: string;
  nguoiLap: string;
  nguoiDuyet: string;
  trangThai: "da-duyet" | "cho-duyet";
  nguonQuy: string;
}

export interface Quy {
  ma: string;
  ten: string;
  tk: string;
  ptr: string;
  isDefault: boolean;
  active: boolean;
}

export interface NganHang {
  bank: string;
  stk: string;
  chu: string;
  cn: string;
  tk: string;
  loai: string;
  isDefault: boolean;
  active: boolean;
}

export interface TaiKhoan {
  so: string;
  ten: string;
  loai: string;
  cha: string;
  chuan: string;
  active: boolean;
}

export interface PaginationState {
  page: number;
  size: number;
}

export type PanelContent =
  | { kind: "newTx"; txType: "thu" | "chi"; src: TxSource }
  | { kind: "detail"; src: TxSource; id: number };

export interface TabInfo {
  label: string;
  closable: boolean;
}

export interface SectionRoot {
  label: string;
  group: string;
}
