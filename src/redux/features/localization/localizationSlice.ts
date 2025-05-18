import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import localizationService from '../../../services/api/localizationService';
import { RootState } from '../../store';

// State tipi
interface LocalizationState {
  currentLanguage: string;
  supportedLanguages: string[];
  translations: Record<string, Record<string, string>>;
  loading: boolean;
  error: string | null;
}

// Başlangıç state
const initialState: LocalizationState = {
  currentLanguage: localStorage.getItem('language') || 'tr',
  supportedLanguages: ['tr', 'en'],
  translations: {},
  loading: false,
  error: null
};

// Async thunklar
export const fetchTranslations = createAsyncThunk(
  'localization/fetchTranslations',
  async (lang: string, { rejectWithValue }) => {
    try {
      const response = await localizationService.getTranslations(lang);
      return response.data;
    } catch (error: any) {
      console.error('[localizationSlice] Çeviriler alınırken hata:', error);
    }
  }
);

export const fetchSupportedLanguages = createAsyncThunk(
  'localization/fetchSupportedLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await localizationService.getSupportedLanguages();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Desteklenen diller alınamadı');
    }
  }
);

// Slice
const localizationSlice = createSlice({
  name: 'localization',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('language', action.payload);
    },
    clearTranslations: (state) => {
      state.translations = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTranslations
      .addCase(fetchTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTranslations.fulfilled, (state, action) => {
        state.loading = false;
        state.translations = action.payload;
      })
      .addCase(fetchTranslations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchSupportedLanguages
      .addCase(fetchSupportedLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportedLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.supportedLanguages = action.payload;
      })
      .addCase(fetchSupportedLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Action'ları export et
export const { setLanguage, clearTranslations } = localizationSlice.actions;

// Selectors
export const selectCurrentLanguage = (state: RootState) => state.localization.currentLanguage;
export const selectTranslations = (state: RootState) => state.localization.translations;
export const selectSupportedLanguages = (state: RootState) => state.localization.supportedLanguages;
export const selectLocalizationLoading = (state: RootState) => state.localization.loading;
export const selectLocalizationError = (state: RootState) => state.localization.error;

export default localizationSlice.reducer; 