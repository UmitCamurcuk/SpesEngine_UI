import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../../services';

// Tip tanımlamaları
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: any;
}

// Initial state - localStorage'dan token'ları yükle
const loadTokensFromStorage = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return {
    accessToken,
    refreshToken,
    isAuthenticated: !!(accessToken && refreshToken)
  };
};

const tokenState = loadTokensFromStorage();

const initialState: AuthState = {
  isAuthenticated: tokenState.isAuthenticated,
  user: null,
  accessToken: tokenState.accessToken,
  refreshToken: tokenState.refreshToken,
  loading: false,
  error: null,
};

// Token'ları localStorage'dan yükle ve kullanıcı bilgilerini getir
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        return null;
      }
      
      // Kullanıcı bilgilerini getir
      const user = await authService.getCurrentUser();
      return { accessToken, refreshToken, user };
    } catch (error: any) {
      // Token'lar geçersizse temizle
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue('Token geçersiz');
    }
  }
);

// Async thunk actions
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        success: false,
        error: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu'
      });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      
      // Manuel olarak localStorage'a token'ları kaydedelim
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kayıt başarısız');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Çıkış yapılırken bir hata oluştu');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kullanıcı bilgileri alınamadı');
    }
  }
);

// İzinleri yenile
export const refreshPermissions = createAsyncThunk(
  'auth/refreshPermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.refreshPermissions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'İzinler yenilenemedi');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Redux Toolkit uses Immer library, we can "mutate" the state here
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Manuel olarak localStorage'a token'ları kaydedelim
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;

      // Manuel olarak localStorage'dan token'ları silelim
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    // Token'ları localStorage'dan senkronize et
    syncTokensFromStorage: (state) => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = !!(accessToken && refreshToken);
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth cases
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user?.data || action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.accessToken = null;
          state.refreshToken = null;
          state.user = null;
          state.isAuthenticated = false;
        }
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        
        // localStorage'a da kaydet
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string || 'Giriş yapılırken bir hata oluştu';
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        
        // localStorage'dan da temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
        
        // localStorage'dan da temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.data || action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Token geçersizse localStorage'dan da temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        state.accessToken = null;
        state.refreshToken = null;
      })
      
      // Refresh Permissions
      .addCase(refreshPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(refreshPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setTokens, clearAuth, clearError, syncTokensFromStorage } = authSlice.actions;

export default authSlice.reducer; 