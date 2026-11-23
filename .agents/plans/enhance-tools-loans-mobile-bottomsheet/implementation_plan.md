# Enhance Mobile Layout `/tools/loans` (Bottom Sheet Tabs & Action Sheet): Kế Hoạch Triển Khai (`erp-web`)

- **Repo / Branch**: `erp/erp-web` (`erp-master`)
- **Track**: `T2`
- **Structure**: `/ui-structure`
- **Plane**: `KINDU-854` (Story, label `epic:loans`, Module `Loans & Cashflow Simulator V2`) → Tasks `KINDU-855`..`KINDU-861`

## 📝 Spec & Quyết định đã chốt

- **Tab Bottom Sheet trên mobile**: `LoansListPage.mobile.tsx` dùng `<V2TabBar variant="page" />` (tự động dùng `TabBarPageViewMobile` + `TabBarPageViewSheet` / `V2BottomSheet`) và đồng bộ `?tab=simulator|projection|list` qua `useV2ModuleTabState`.
- **Ẩn header & nút Thêm trên mobile**: Bỏ hoàn toàn card header `"Quản Lý Khoản Vay"` và nút `+ Thêm` trên `LoansListPage.mobile.tsx` (kể cả khi list rỗng, giữ `V2EmptyState` thuần thông báo); ẩn card tiêu đề/mô tả dài trên `LoanSimulatorPage.mobile.tsx`.
- **Gom nút Lưu ERP + Mặc định + Thêm khoản vay vào `V2BottomSheet`**: Thay thanh Lưu ở cuối trang và hàng nút cũ trên mobile bằng trigger `Thao tác danh mục` mở `LoanSimulatorActionsSheet` (`V2BottomSheet`) chứa đầy đủ 3 `V2Button`.
- **Chuẩn `/ui-structure`**: Dùng V2 components qua barrel `@/v2/shared/components` (`V2TabBar`, `V2BottomSheet`, `V2Button`, `V2Input`, `V2NumberInput`, `V2Text`, `V2Badge`, `V2Icon`, `V2Stack`, `V2EmptyState`, `V2Skeleton`), mọi file $< 180$ LoC, 0 `blue-*`, 0 V1 import ngoài `authStore`, 100% i18n `v2.*`.

## 📋 Task Breakdown 3 Cấp

- [x] **Task 2.1.1** (`KINDU-855`): Đồng bộ `?tab=` trong `LoansListPage.hook.ts` & thêm locale `actionsTrigger`/`actionsTitle`/`actionsSubtitle`
- [x] **Task 2.1.2** (`KINDU-856`): Chuẩn hóa `<V2Icon />` trong `PortfolioLoanCard.tsx`, `LoansListPage.mobile-card.tsx`, `LoanSimulatorPage.desktop.tsx`
- [x] **Task 2.2.1** (`KINDU-857`): Cập nhật `LoansListPage.mobile.tsx` dùng `V2TabBar` (`variant="page"`) & ẩn header + nút Thêm
- [x] **Task 2.2.2** (`KINDU-858`): Cập nhật `LoanSimulatorPage.mobile.tsx` + tạo `LoanSimulatorActionsSheet.tsx` (`V2BottomSheet`)
- [x] **Task 4.1.1** (`KINDU-859`): Tạo `LoansListPage.test.tsx` (2 tests) & cập nhật `LoanSimulatorPage.test.tsx` (5 tests)
- [x] **Task 4.1.2** (`KINDU-860`): QC `/ui-structure` (Vitest 7/7, ESLint `--max-warnings=0`, Prettier, LoC $\le 147$, `tsc --noEmit`)
- [x] **Task 4.2.1** (`KINDU-861`): Đồng bộ `SKILL.md` & lưu `implementation_plan.md`

