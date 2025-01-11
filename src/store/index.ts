import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import certificatesReducer from './slices/certificatesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    certificates: certificatesReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;