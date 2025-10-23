/**
 * Product Slice
 * Manages products, franchises, and roles state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// Initial state
const initialState = {
  products: [],
  franchises: [],
  roles: [],
  loading: false,
  error: null
};

/**
 * Async Thunks
 */

// Get all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
  }
);

// Get all franchises
export const fetchFranchises = createAsyncThunk(
  'products/fetchFranchises',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getAllFranchises();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch franchises' });
    }
  }
);

// Get all roles
export const fetchRoles = createAsyncThunk(
  'products/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getAllRoles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch roles' });
    }
  }
);

/**
 * Product Slice
 */
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch products';
      })

      // Fetch Franchises
      .addCase(fetchFranchises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFranchises.fulfilled, (state, action) => {
        state.loading = false;
        state.franchises = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchFranchises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch franchises';
      })

      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch roles';
      });
  }
});

// Export actions
export const { clearError } = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectFranchises = (state) => state.products.franchises;
export const selectRoles = (state) => state.products.roles;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;

// Export reducer
export default productSlice.reducer;