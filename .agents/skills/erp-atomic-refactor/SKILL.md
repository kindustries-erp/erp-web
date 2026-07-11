---
name: erp-atomic-refactor
description: Trợ lý giúp Agent chia tách một file React quá lớn (vượt quá 200 dòng) thành cấu trúc thư mục Atomic chuẩn (Index, Component, Hook, Util) để code được module hoá.
---

# Kỹ năng Atomic Refactor (ERP)

## Mục đích

Đảm bảo code UI không bị phình to thành các file ngàn dòng khó bảo trì. Kỹ năng này cung cấp checklist và pattern để chia tách file an toàn.

## Khi nào sử dụng?

Mỗi khi bạn phải tạo hoặc sửa đổi một file React Component mà số lượng dòng code (LoC) vượt qua ~200 dòng, bạn BẮT BUỘC phải thực hiện quá trình refactor này.

## Quy trình thực hiện (Checklist)

1. **Phân tích File Hiện Tại:**
   - Xác định phần logic (State management, React Query hooks, useEffect, custom helper logic).
   - Xác định phần UI (JSX markup) và các sub-components đang được định nghĩa trong cùng file.

2. **Tạo Cấu Trúc Thư Mục Mới:**
   Ví dụ bạn đang sửa file `src/pages/MyBigPage.tsx`, hãy chuyển nó thành một thư mục `src/pages/MyBigPage/`:
   - `src/pages/MyBigPage/index.tsx` (Điểm entry, export Component chính)
   - `src/pages/MyBigPage/MyBigPage.tsx` (Chỉ chứa JSX markup, nhận props từ hook)
   - `src/pages/MyBigPage/useMyBigPageLogic.ts` (Chứa toàn bộ hooks, react-query, state)
   - `src/pages/MyBigPage/utils.ts` (Chứa các pure functions, formatter, helper không liên quan trực tiếp đến state)
   - Nếu có các sub-components (như List, Header), tạo thêm: `src/pages/MyBigPage/components/Header.tsx`

3. **Tách Logic ra Hook:**

   ```typescript
   // useMyBigPageLogic.ts
   export const useMyBigPageLogic = () => {
     // ... hooks, react-query
     return { data, handleEvent, ... };
   }
   ```

4. **Tách UI ra Component:**

   ```tsx
   // MyBigPage.tsx
   import { useMyBigPageLogic } from "./useMyBigPageLogic";
   export const MyBigPage = () => {
     const { data, handleEvent } = useMyBigPageLogic();
     return <div>...</div>;
   };
   ```

5. **Xác Nhận Refactor:**
   Kiểm tra import xem có lỗi không, sau đó xoá bỏ file cũ.
