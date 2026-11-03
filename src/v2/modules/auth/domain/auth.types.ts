export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface AuthStateSummary {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
}
