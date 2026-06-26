# Global Loading and Theme Configuration Refactor

## Context

Refactoring the application to use a global indeterminate loading bar connected to Zustand (`uiStore`) instead of rendering inline loading components. Additionally, the theme configuration was updated to set `classic` as the default theme and adjust the theme order in the UI.

## Changes

1. **`uiStore.ts`**: Added `globalLoading` state and `setGlobalLoading` action.
2. **`TopProgressBar.tsx`**: Created a centralized global loading bar that adjusts background color depending on the active theme (light for shell/orcaq, primary for classic).
3. **`App.tsx`**: Added `<TopProgressBar />` to the root layout.
4. **`appStore.ts`**: Set `classic` as the default theme and fallback, and reordered the theme toggling sequence to `["classic", "shell", "orcaq"]`.
5. **`ThemePopover.tsx` & `UserMenuPopover.tsx`**: Reordered theme options to `Classic, Shell, Orcaq`.
6. **`ErpWarehouseTab.tsx`**: Replaced inline portal loader with `setGlobalLoading(true)` on `printTargetId`.
7. **`GiFormDrawer.tsx` & `GrFormDrawer.tsx`**: Integrated `globalLoading` to toggle during save operations.

## Verification

- TopProgressBar appears and disappears successfully during saving and printing.
- Theme defaults to `classic` upon initialization or hard refresh.
- Theme popup menus display options in the requested order.
