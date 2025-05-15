import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

import authReducer from './features/auth/authSlice';
import localizationReducer from './features/localization/localizationSlice';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  localization: localizationReducer,
  // buraya diğer reducer'lar eklenebilir
});

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'localization'], // auth ve localization state'leri persist edilecek
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE', 
          'auth/login/fulfilled', 
          'auth/register/fulfilled',
          'localization/fetchTranslations/fulfilled'
        ],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 