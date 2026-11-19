# Bổ Sung Storybook Coverage Cho V2Image (erp-web)

Khắc phục lỗi test coverage Storybook `FAIL src/v2/shared/components/storyCoverage.test.ts` do thành phần `atoms/v2-image` chưa có file `*.stories.tsx`.

Track: N/A (bổ sung story cho atom V2 sẵn có)  
Structure: `/erp-ui-structure`  
Consistency Check: đạt  
Plane: không theo dõi  

---

## 📝 Spec
- **Mục tiêu**: Tạo mới `V2Image.stories.tsx` tại `src/v2/shared/components/atoms/v2-image/` đầy đủ các trường hợp (Default, WithFallbackIcon, WithFallbackSrc, AvatarThumbnail) để `storyCoverage.test.ts` pass và đạt chuẩn Design System V2.
- **Phạm vi**: 
  - `src/v2/shared/components/atoms/v2-image/V2Image.stories.tsx` (tạo mới)
  - Chạy xác thực test thu hẹp: `src/v2/shared/components/storyCoverage.test.ts`
- **Ngoài phạm vi**: 
  - Không thay đổi `ALLOWLIST` trong `storyCoverage.test.ts` (vì atom phải có story riêng thay vì đưa vào allowlist).
  - Không sửa logic `V2Image.tsx` đang chạy ổn định.
- **Tiêu chí chấp nhận (AC)**:
  - `AC-1`: File `V2Image.stories.tsx` được tạo đúng chuẩn Storybook v8 của dự án (`title: "Components/Atoms/V2Image"`, tuân thủ No Blue).
  - `AC-2`: Test `storyCoverage.test.ts` chạy pass toàn bộ 3 test cases, không còn lỗi `expected [ 'atoms/v2-image' ] to deeply equal []`.
  - `AC-3`: `type:check` không có lỗi.

| AC | Task | Verification |
| :--- | :--- | :--- |
| `AC-1` | `4.1.1` | `test -f src/v2/shared/components/atoms/v2-image/V2Image.stories.tsx` |
| `AC-2` | `4.1.2` | `bunx vitest run src/v2/shared/components/storyCoverage.test.ts` |
| `AC-3` | `4.1.2` | `bun run type:check` |

---

## ⚠️ User Review Required
> Không có breaking change. Đây là việc bổ sung file Storybook phục vụ test coverage và tài liệu hóa atom component `V2Image`.

---

## ❓ Open Questions
- Không có câu hỏi kỹ thuật tồn đọng.

---

## 🏛️ Thiết Kế Kỹ Thuật

### Cấu trúc thư mục của atom `v2-image`:
```
src/v2/shared/components/atoms/v2-image/
├── index.ts
├── V2Image.test.tsx
├── V2Image.tsx
├── V2Image.type.ts
└── V2Image.stories.tsx   <-- [NEW]
```

---

## 📋 Task Breakdown 3 Cấp & DoD

Thứ tự thực hiện: `QC` (Phase 4 theo chuẩn erp-web)

- [x] **Task 4.1.1: Tạo file V2Image.stories.tsx**
  - **Phân hệ**: `Web` | **Ưu tiên**: `P0`
  - **Runner**: `Main Agent`
  - **Files**: `[NEW]` [src/v2/shared/components/atoms/v2-image/V2Image.stories.tsx](erp/erp-web/src/v2/shared/components/atoms/v2-image/V2Image.stories.tsx)
  - **DoD**: File story được tạo tuân thủ đầy đủ chuẩn Storybook Meta, StoryObj, token màu No Blue, và hiển thị các biến thể chính.
  - **Verification**: `test -f src/v2/shared/components/atoms/v2-image/V2Image.stories.tsx` (PASS)

- [x] **Task 4.1.2: Xác thực test coverage và typecheck**
  - **Phân hệ**: `QC` | **Ưu tiên**: `P0`
  - **Runner**: `Main Agent`
  - **Files**: Không sửa file (chỉ chạy test kiểm chứng)
  - **DoD**: `storyCoverage.test.ts` pass 100%, không còn thiếu coverage cho `atoms/v2-image`; `bun run type:check` pass.
  - **Verification**: `bunx vitest run src/v2/shared/components/storyCoverage.test.ts && cd /home/dev/repos-dev-01/erp/erp-web && bun run type:check` (PASS - 3/3 tests pass, 0 typecheck errors)

---

## ⏸️ Session Checkpoint (Hoàn thành)
- **Active Task**: `None`
- **Tiến độ chi tiết**: Đã tạo file `V2Image.stories.tsx`, xác thực `storyCoverage.test.ts` và `V2Image.test.tsx` cùng `type:check` đều đạt 100%.
- **Git Status**: Untracked `src/v2/shared/components/atoms/v2-image/V2Image.stories.tsx` & `.agents/plans/fix-v2-image-story-coverage/`.
