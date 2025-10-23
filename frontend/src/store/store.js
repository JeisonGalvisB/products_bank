/**
 * Redux Store Configuration
 * Configures Redux Toolkit store with all slices
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import saleReducer from './slices/saleSlice';
import productReducer from './slices/productSlice';
import statsReducer from './slices/statsSlice';
import uiReducer from './slices/uiSlice';

/**
 * Configure Redux Store
 * Combines all reducers and applies middleware
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    sales: saleReducer,
    products: productReducer,
    stats: statsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['auth/login/fulfilled'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;