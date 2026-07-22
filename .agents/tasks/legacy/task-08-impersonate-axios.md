# Task 08 — Login as User: Axios Interceptor

## Dependency

**Task 07 phải hoàn thành trước** — task này cần `actorRefreshToken` field trong `erp-auth` localStorage (được persist từ task 07).

## Scope

File duy nhất cần sửa: `src/core/api/axiosInstance.ts`

Không tạo file mới. Không sửa file khác.

---

## Bối cảnh

Khi impersonation đang active:

- `accessToken` trong store = **impersonation token** (short-lived JWT, không có refresh_token)
- `refreshToken` trong store = `null`
- `actorRefreshToken` trong store = refresh token gốc của actor

Vấn đề: khi impersonation token hết hạn, 401 xảy ra. Logic hiện tại:

1. `getStoredAuth()` trả `refreshToken = null`
2. Code gọi `clearAuth()` → đăng xuất toàn bộ ❌

Kết quả mong muốn: **restore actor session** thay vì đăng xuất.

---

## 1. Thêm helper `getStoredImpersonationSnapshot`

Thêm sau hàm `patchStoredTokens`:

```ts
/**
 * Reads the actor snapshot from localStorage.
 * Returns non-null actorRefreshToken only when an impersonation session
 * was active and we have a way to restore the actor session.
 */
function getStoredImpersonationSnapshot(): {
  actorRefreshToken: string | null;
} {
  try {
    const raw = localStorage.getItem("erp-auth");
    if (!raw) return { actorRefreshToken: null };
    const parsed = JSON.parse(raw) as {
      state?: { actorRefreshToken?: string };
    };
    return {
      actorRefreshToken: parsed?.state?.actorRefreshToken ?? null,
    };
  } catch {
    return { actorRefreshToken: null };
  }
}
```

---

## 2. Thêm helper `patchStoredActorRestore`

Thêm sau `patchStoredTokens`:

```ts
/**
 * Patches localStorage after restoring actor session from impersonation:
 * - Replaces accessToken/refreshToken/expiresAt with actor tokens
 * - Clears actorAccessToken/actorRefreshToken/actorExpiresAt/impersonation
 */
function patchStoredActorRestore(
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
) {
  try {
    const raw = localStorage.getItem("erp-auth");
    const obj = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    obj.state = {
      ...(obj.state as object | undefined),
      accessToken,
      refreshToken,
      expiresAt,
      actorAccessToken: null,
      actorRefreshToken: null,
      actorExpiresAt: null,
      impersonation: null,
    };
    localStorage.setItem("erp-auth", JSON.stringify(obj));
  } catch {
    // silent
  }
}
```

---

## 3. Cập nhật 401 handler — thêm nhánh impersonation

Tìm block xử lý "No refresh token" trong 401 handler:

```ts
// BEFORE:
const { refreshToken } = getStoredAuth();

if (!refreshToken) {
  // No refresh token available — force logout
  import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
    useAuthStore.getState().clearAuth();
  });
  return Promise.reject(error);
}

// AFTER:
const { refreshToken } = getStoredAuth();

if (!refreshToken) {
  // Check if this is an expired impersonation token
  const { actorRefreshToken } = getStoredImpersonationSnapshot();

  if (actorRefreshToken) {
    // Impersonation token expired — restore actor session
    try {
      const { data } = await axios.post<{
        access_token: string;
        refresh_token: string;
        expires: number;
      }>(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: actorRefreshToken },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        },
      );

      const newExpiresAt = Date.now() + data.expires * 1000;

      // Patch localStorage immediately
      patchStoredActorRestore(
        data.access_token,
        data.refresh_token,
        newExpiresAt,
      );

      // Sync Zustand store and refresh profile
      import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
        useAuthStore.setState({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: newExpiresAt,
          actorAccessToken: null,
          actorRefreshToken: null,
          actorExpiresAt: null,
          impersonation: null,
        });
        // Re-bootstrap to reload actor profile/permissions
        useAuthStore.getState().bootstrapAction();
      });

      // Show toast notification
      import("@/core/config/uiStore").then(({ useUIStore }) => {
        useUIStore.getState().showToast({
          title: "Phiên đăng nhập hộ đã kết thúc",
          description: "Token hết hạn — đã khôi phục tài khoản gốc.",
          variant: "default",
        });
      });
    } catch {
      // Actor refresh also failed — full logout
      import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuth();
      });
    }
    // Do NOT retry original request — it was made as impersonated user
    return Promise.reject(error);
  }

  // Normal case: no refresh token, not in impersonation — force logout
  import("@/modules/auth/domain/authStore").then(({ useAuthStore }) => {
    useAuthStore.getState().clearAuth();
  });
  return Promise.reject(error);
}
```

---

## Acceptance Criteria

- [ ] `tsc --noEmit` không lỗi.
- [ ] `getStoredImpersonationSnapshot` được thêm sau `patchStoredTokens`.
- [ ] `patchStoredActorRestore` được thêm sau `patchStoredTokens`.
- [ ] Khi 401 xảy ra và `refreshToken = null`, code kiểm tra `actorRefreshToken` trước khi gọi `clearAuth`.
- [ ] Nếu `actorRefreshToken` tồn tại: gọi raw axios refresh, patch localStorage, sync Zustand, show toast, reject original request (không retry).
- [ ] Nếu actor refresh cũng fail: gọi `clearAuth()`.
- [ ] Nếu `actorRefreshToken = null` (không phải impersonation, là normal 401 không refresh): gọi `clearAuth()` như cũ.
- [ ] Flow refresh token bình thường (khi không phải impersonation) KHÔNG bị ảnh hưởng.
