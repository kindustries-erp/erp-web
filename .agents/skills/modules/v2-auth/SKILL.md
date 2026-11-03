---
name: v2-auth
description: Module tri thức Đăng nhập V2 (V2LoginPage) theo kiến trúc ERP Web v2 (Atomic Design 5 tầng, Platform Split Desktop/Mobile, < 180 LoC, No Blue Mandate, 100% i18n, Co-located Vitest testing & Integration test).
---

# 🔐 Module Tri Thức: Auth & Đăng Nhập V2 (ERP Web)

Module quản lý toàn bộ luồng đăng nhập của ERP Web theo chuẩn kiến trúc V2, đặt tại `src/v2/modules/auth`.

---

## 🏛️ Cấu Trúc Thư Mục (Atomic Design 5 Tầng)

```
src/v2/modules/auth/
├── api/
│   ├── v2AuthApi.ts                # Wrapper ủy thác gọi API V1 loginApi (/api/v1/auth/login)
│   └── v2AuthApi.test.ts           # Co-located unit test
├── domain/
│   ├── auth.types.ts               # Interface LoginCredentials, LoginFormErrors, AuthStateSummary
│   ├── auth.constants.ts           # EMAIL_VALIDATION_REGEX, isLocalEnvironment
│   └── hooks/
│       ├── useV2LoginForm.ts       # Custom hook xử lý form state, validation, errors, dev quick-fill
│       └── useV2LoginForm.test.ts  # Co-located unit test (6 test cases)
├── components/
│   ├── atoms/
│   │   ├── v2-auth-brand-badge/    # Atom nhận diện thương hiệu Liouni ERP (4 ô vuông)
│   │   └── v2-auth-locale-toggle/  # Atom chuyển đổi ngôn ngữ VI/EN
│   ├── molecules/
│   │   ├── v2-auth-input-fields/   # Email + Password inputs kèm nút toggle hiện/ẩn mật khẩu
│   │   └── v2-dev-quick-fill/      # Nút điền nhanh admin dev (chỉ hiển thị trên localhost)
│   └── organisms/
│       └── v2-login-card/          # Card đăng nhập trung tâm bg-surface + shadow-lg match theme
├── pages/
│   └── login/
│       ├── V2LoginPage.tsx         # Switcher < 15 LoC dùng useViewport()
│       ├── V2LoginPage.desktop.tsx # Giao diện Desktop căn giữa sang trọng
│       ├── V2LoginPage.mobile.tsx  # Giao diện Mobile tối ưu cảm ứng
│       └── V2LoginPage.test.tsx    # Co-located unit test switcher
├── tests/
│   └── integration/
│       └── V2LoginIntegration.test.tsx # Integration test kiểm thử toàn bộ luồng đăng nhập
└── index.ts                        # Barrel export
```

---

## 🎯 6 Trụ Cột V2 Tuân Thủ
1. **Dual-Run & App Integration**:
   - `src/App.tsx`: Kích hoạt `if (!isLoggedIn) return <V2LoginPage />;`.
   - `src/v2/app/providers/AppProviders.tsx`: Khi `!isAuthenticated`, mount trực tiếp `V2LoginPage`.
2. **Platform Split (Desktop vs Mobile)**:
   - `V2LoginPage.tsx` là Switcher mỏng chỉ **13 LoC** (< 15 LoC).
   - Tách riêng `V2LoginPage.desktop.tsx` và `V2LoginPage.mobile.tsx` dựa trên `useViewport()`.
3. **No Blue Mandate**:
   - 0 vi phạm class `blue-*`.
   - Sử dụng 100% token semantic: `bg-surface`, `bg-background`, `text-primary`, `fill-current`.
4. **Kỷ Luật LoC < 180**:
   - Tất cả các file đều < 100 LoC.
5. **100% i18n**:
   - Sử dụng `useV2Translation()` với namespace `v2.auth.*` trong cả `vi.ts` và `en.ts`.
6. **Testing Pyramid 3 Tầng**:
   - 9/9 test files, 23/23 tests pass 100%.
