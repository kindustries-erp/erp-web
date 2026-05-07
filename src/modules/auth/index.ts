// Public API of the auth module
export { useAuthStore } from "@/modules/auth/domain/authStore";
export { useAuth } from "@/modules/auth/hooks/useAuth";
export {
  loginApi,
  logoutApi,
  updateProfileApi,
  changePasswordApi,
} from "@/modules/auth/api/auth";
export { UserProfileModal } from "@/modules/auth/components/UserProfileModal";
export { ChangePasswordModal } from "@/modules/auth/components/ChangePasswordModal";
export type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshRequest,
  RefreshResponse,
  Employee,
  Department,
  Position,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/modules/auth/api/auth";
