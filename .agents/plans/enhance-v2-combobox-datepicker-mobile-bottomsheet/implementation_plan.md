# Enhance & Fix `V2Combobox` & `V2DatePicker` trên Mobile (`V2BottomSheet`): Kế Hoạch Triển Khai (`erp-web`)

- **Repo / Branch**: `erp/erp-web` (`erp-master`)
- **Track**: `T2`
- **Structure**: `/ui-structure`
- **Plane**: `KINDU-862` (Story, label `epic:ui-v2`, Module `UI V2: Mobile BottomSheet (Combobox & DatePicker)`) → Tasks `KINDU-863`..`KINDU-870`

## 📝 Spec & Quyết định đã chốt

- **Root Cause**: `V2Combobox` (`className="w-64 p-1"`) và `V2DatePicker` (`className="w-auto p-2"`) truyền width class của desktop vào `V2PopoverMobile`, ghi đè `w-full`; đồng thời `V2Calendar` dùng `flex` cố định `w-8` nên bị đẩy sát mép trái, và `dateTriggerClass` thiếu `justify-start`.
- **`V2Combobox` mobile**: Dùng `V2ComboboxSheet` (`V2BottomSheet`), `V2Input sizeVariant="lg"` (`autoFocus={false}`), `V2ComboboxList` (`min-h-[44px]`, `text-base`, không cắt cụt nhãn), trigger `h-10 sm:h-8 text-base sm:text-sm`.
- **`V2DatePicker` & `V2DateRangePicker` mobile**: Dùng `V2DateSheet` (`V2BottomSheet`) bọc `V2Calendar` căn giữa (`grid-cols-7`, `max-w-[360px] mx-auto`, ô ngày `h-10 w-10 sm:h-8 sm:w-8`), trigger `dateTriggerClass` căn trái (`justify-start text-left font-normal`).
- **Dismiss guard & PopoverMobile**: Truyền `open: !isMobile && open` cho `useV2PopoverDismiss`; gia cố `V2Popover.mobile.tsx` luôn ưu tiên `w-full max-w-none inset-x-0`.

## 📋 Task Breakdown 3 Cấp

- [x] **Task 2.1.1** (`KINDU-863`): `V2ComboboxList.tsx` & `V2ComboboxSheet.tsx`
- [x] **Task 2.1.2** (`KINDU-864`): `V2Combobox.tsx` nhánh Mobile `V2BottomSheet`
- [x] **Task 2.2.1** (`KINDU-865`): `V2Calendar.tsx` responsive căn giữa & `justify-start`
- [x] **Task 2.2.2** (`KINDU-866`): `V2DateSheet.tsx`, `V2DatePicker.tsx`, `V2DateRangePicker.tsx`
- [x] **Task 2.3.1** (`KINDU-867`): `V2Popover.mobile.tsx` bảo toàn `w-full max-w-none`
- [x] **Task 4.1.1** (`KINDU-868`): Bổ sung mobile tests trong `V2Combobox.test.tsx`, `V2DatePicker.test.tsx`, `V2Popover.test.tsx`
- [x] **Task 4.1.2** (`KINDU-869`): QC `/ui-structure` (12 test files / 66 tests, ESLint `--max-warnings=0`, Prettier, LoC $< 180$, `tsc --noEmit`)
- [x] **Task 4.2.1** (`KINDU-870`): Lưu `implementation_plan.md` & cập nhật checklist

