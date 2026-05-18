import { create } from "zustand";
import { Transaction, PaginationState, TxSource } from "@/shared/types";

function makeTx(n: number, pfx: string, quys: string[]): Transaction[] {
  const tc: Array<"thu" | "chi"> = ["thu", "chi", "thu", "thu", "chi"];
  const lT = ["UNT - Thu khác", "UNT - Thu bán hàng", "UNT - Thu nợ KH"];
  const lC = ["UNC - Chi khác", "UNC - Thanh toán NCC", "UNC - Chi lương"];
  const tmT = ["Thu khác", "Thu bán hàng", "Thu nợ KH"];
  const tmC = ["Chi khác", "Chi thanh toán NCC", "Chi lương"];
  const dt = [
    "Cty TNHH Công Nghệ ABC",
    "Nguyễn Văn A",
    "Khối Sản Xuất",
    "THANH CH Công Trăng",
    "Cty CP Phát Triển XYZ",
  ];
  const am = [
    50000000, 20000000, 1500000, 5000000, 12000000, 8000000, 30000000, 3000000,
    45000000, 7500000,
  ];
  const dd = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  const isNH = pfx === "NH";

  return Array.from({ length: n }, (_, i) => {
    const t = tc[i % 5];
    return {
      id: i + 1,
      date: dd[i % 10] + "/03/2022",
      code:
        pfx +
        (t === "thu" ? "PT" : "PC") +
        "0" +
        String(i + 1).padStart(3, "0"),
      type: t,
      loai: isNH
        ? t === "thu"
          ? lT[i % 3]
          : lC[i % 3]
        : t === "thu"
          ? tmT[i % 3]
          : tmC[i % 3],
      doituong: dt[i % 5],
      mst: i % 2 === 0 ? "0101234567" : "",
      diachi: i % 2 === 0 ? "Số 123 Nguyễn Trãi, Thanh Xuân, Hà Nội" : "Hà Nội",
      dienGiai: isNH
        ? t === "thu"
          ? "UNT thu tiền KH HĐ-00" + i
          : "UNC thanh toán đề nghị " + i
        : t === "thu"
          ? "Thu tiền KH HĐ-00" + i
          : "Chi thanh toán đề nghị " + i,
      amount: am[i % 10],
      tknNo:
        t === "thu"
          ? isNH
            ? "1121 - NH VCB"
            : "1111 - Tiền mặt"
          : "331 - Phải trả NCC",
      tknCo:
        t === "thu"
          ? "1311 - Phải thu KH"
          : isNH
            ? "1121 - NH VCB"
            : "1111 - Tiền mặt",
      nguoiLap: "Nguyễn Văn A",
      nguoiDuyet: "Trần Thị B",
      trangThai: i % 3 === 0 ? "da-duyet" : "cho-duyet",
      nguonQuy: quys[i % quys.length],
    };
  });
}

interface TransactionState {
  allTM: Transaction[];
  allTG: Transaction[];
  pagination: Record<TxSource, PaginationState>;
  getDs: (src: TxSource) => Transaction[];
  goPage: (src: TxSource, page: number) => void;
  setPageSize: (src: TxSource, size: number) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  allTM: makeTx(32, "", ["Quỹ tiền mặt chính"]),
  allTG: makeTx(28, "NH", ["Vietcombank (VCB)", "Techcombank (TCB)"]),
  pagination: {
    tienmat: { page: 1, size: 10 },
    tiengui: { page: 1, size: 10 },
  },

  getDs: (src) => (src === "tienmat" ? get().allTM : get().allTG),

  goPage: (src, page) => {
    const { pagination } = get();
    const ds = src === "tienmat" ? get().allTM : get().allTG;
    const totalPages = Math.ceil(ds.length / pagination[src].size);
    if (page < 1 || page > totalPages) return;
    set({ pagination: { ...pagination, [src]: { ...pagination[src], page } } });
  },

  setPageSize: (src, size) => {
    const { pagination } = get();
    set({ pagination: { ...pagination, [src]: { page: 1, size } } });
  },
}));
