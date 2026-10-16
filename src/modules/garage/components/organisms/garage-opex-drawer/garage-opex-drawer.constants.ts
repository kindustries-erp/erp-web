import type {
  CategoryPreset,
  CostGroupOption,
} from "./garage-opex-drawer.type";

export const COST_GROUPS: CostGroupOption[] = [
  {
    key: "OPEX",
    labelKey: "costGroups.OPEX",
    defaultLabel: "Chi phí vận hành (OPEX)",
  },
  {
    key: "COGS",
    labelKey: "costGroups.COGS",
    defaultLabel: "Chi phí giá vốn (COGS)",
  },
  {
    key: "COMMISSION",
    labelKey: "costGroups.COMMISSION",
    defaultLabel: "Hoa hồng (Commission)",
  },
];

/**
 * Danh mục chi phí chuẩn hóa. VAT_TU_TIEU_HAO thuộc Giá vốn, HHBH thuộc Hoa hồng (mục 4.2 P&L).
 */
export const CATEGORY_PRESETS: CategoryPreset[] = [
  // 1. Nhóm Chi phí vận hành (OPEX)
  {
    key: "NHAN_SU",
    group: "OPEX",
    labelKey: "categories.NHAN_SU",
    defaultName: "Nhân sự",
  },
  {
    key: "THUE_MAT_BANG",
    group: "OPEX",
    labelKey: "categories.THUE_MAT_BANG",
    defaultName: "Thuê mặt bằng & điện nước",
  },
  {
    key: "DIEN_NUOC",
    group: "OPEX",
    labelKey: "categories.DIEN_NUOC",
    defaultName: "Điện nước",
  },
  {
    key: "BAO_TRI",
    group: "OPEX",
    labelKey: "categories.BAO_TRI",
    defaultName: "Bảo trì",
  },
  {
    key: "KHAU_HAO",
    group: "OPEX",
    labelKey: "categories.KHAU_HAO",
    defaultName: "Khấu hao máy móc & thiết bị",
  },
  {
    key: "KHAC",
    group: "OPEX",
    labelKey: "categories.KHAC",
    defaultName: "Khác",
  },

  // 2. Nhóm Chi phí giá vốn (COGS)
  {
    key: "HOA_HONG_TRUC_TIEP",
    group: "COGS",
    labelKey: "categories.HOA_HONG_TRUC_TIEP",
    defaultName: "Hoa hồng trực tiếp DV (Tính vào Giá vốn)",
    badge: "Giá vốn",
  },
  {
    key: "CHI_PHI_TRUC_TIEP_KHAC",
    group: "COGS",
    labelKey: "categories.CHI_PHI_TRUC_TIEP_KHAC",
    defaultName: "Chi phí trực tiếp khác (Tính vào Giá vốn)",
    badge: "Giá vốn",
  },

  {
    key: "VAT_TU_TIEU_HAO",
    group: "COGS",
    labelKey: "categories.VAT_TU_TIEU_HAO",
    defaultName: "Vật tư tiêu hao (Tính vào Giá vốn)",
    badge: "Giá vốn",
  },

  // 3. Nhóm Hoa hồng (Commission)
  {
    key: "HHBH",
    group: "COMMISSION",
    labelKey: "categories.HHBH",
    defaultName: "HHBH",
    badge: "Hoa hồng",
  },
  {
    key: "HOA_HONG_KHAC",
    group: "COMMISSION",
    labelKey: "categories.HOA_HONG_KHAC",
    defaultName: "Hoa hồng khác / Điều chỉnh hoa hồng",
    badge: "Hoa hồng",
  },
];
