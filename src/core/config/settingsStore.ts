import { create } from 'zustand'
import { Quy, NganHang, TaiKhoan } from '@/shared/types'

interface SettingsState {
  quyData: Quy[]
  nhData: NganHang[]
  tkData: TaiKhoan[]
  addQuy: (quy: Quy) => void
  addNH: (nh: NganHang) => void
  addTK: (tk: TaiKhoan) => void
  setDefault: (type: 'quy' | 'nh', index: number) => void
  toggleActive: (type: 'quy' | 'nh' | 'tk', index: number) => void
  deleteRow: (type: 'quy' | 'nh' | 'tk', index: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  quyData: [
    { ma: 'QUY001', ten: 'Quỹ tiền mặt chính', tk: '1111 - Tiền mặt VNĐ', ptr: 'Nguyễn Văn A', isDefault: true, active: true },
    { ma: 'QUY002', ten: 'Quỹ tiền mặt phụ', tk: '1111 - Tiền mặt VNĐ', ptr: 'Trần Thị B', isDefault: false, active: true },
    { ma: 'QUY003', ten: 'Quỹ ngoại tệ USD', tk: '1112 - Tiền mặt ngoại tệ', ptr: 'Lê Văn C', isDefault: false, active: false },
  ],
  nhData: [
    { bank: 'Vietcombank (VCB)', stk: '0071001234567', chu: 'Cty TNHH ABC', cn: 'Chi nhánh HN', tk: '1121 - TG NH VNĐ', loai: 'UNT và UNC', isDefault: true, active: true },
    { bank: 'Techcombank (TCB)', stk: '1903456789', chu: 'Cty TNHH ABC', cn: 'Chi nhánh HN', tk: '1121 - TG NH VNĐ', loai: 'Chỉ UNC', isDefault: false, active: true },
  ],
  tkData: [
    { so: '1111', ten: 'Tiền mặt VNĐ', loai: 'Tài sản', cha: '111', chuan: 'VAS', active: true },
    { so: '1112', ten: 'Tiền mặt ngoại tệ', loai: 'Tài sản', cha: '111', chuan: 'VAS', active: true },
    { so: '1121', ten: 'TG NH VNĐ', loai: 'Tài sản', cha: '112', chuan: 'VAS', active: true },
    { so: '1122', ten: 'TG NH ngoại tệ', loai: 'Tài sản', cha: '112', chuan: 'VAS', active: true },
    { so: '1311', ten: 'Phải thu KH', loai: 'Tài sản', cha: '131', chuan: 'VAS & IFRS', active: true },
    { so: '331', ten: 'Phải trả NCC', loai: 'Nguồn vốn', cha: '33', chuan: 'VAS & IFRS', active: true },
    { so: '511', ten: 'Doanh thu bán hàng', loai: 'Doanh thu', cha: '51', chuan: 'VAS', active: true },
    { so: '334', ten: 'Phải trả lương', loai: 'Nguồn vốn', cha: '33', chuan: 'VAS', active: true },
  ],

  addQuy: (quy) => set((s) => ({ quyData: [...s.quyData, quy] })),
  addNH: (nh) => set((s) => ({ nhData: [...s.nhData, nh] })),
  addTK: (tk) => set((s) => ({ tkData: [...s.tkData, tk] })),

  setDefault: (type, index) => {
    if (type === 'quy') {
      set((s) => ({ quyData: s.quyData.map((q, i) => ({ ...q, isDefault: i === index })) }))
    } else {
      set((s) => ({ nhData: s.nhData.map((n, i) => ({ ...n, isDefault: i === index })) }))
    }
  },

  toggleActive: (type, index) => {
    if (type === 'quy') {
      set((s) => ({ quyData: s.quyData.map((q, i) => (i === index ? { ...q, active: !q.active } : q)) }))
    } else if (type === 'nh') {
      set((s) => ({ nhData: s.nhData.map((n, i) => (i === index ? { ...n, active: !n.active } : n)) }))
    } else {
      set((s) => ({ tkData: s.tkData.map((t, i) => (i === index ? { ...t, active: !t.active } : t)) }))
    }
  },

  deleteRow: (type, index) => {
    if (type === 'quy') {
      set((s) => ({ quyData: s.quyData.filter((_, i) => i !== index) }))
    } else if (type === 'nh') {
      set((s) => ({ nhData: s.nhData.filter((_, i) => i !== index) }))
    } else {
      set((s) => ({ tkData: s.tkData.filter((_, i) => i !== index) }))
    }
  },
}))
