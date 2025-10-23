/**
 * Sale Slice
 * Manages sales state and actions with role-based access control
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import saleService from '../../services/saleService';

// Initial state
const initialState = {
  sales: [],
  currentSale: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  filters: {
    productoId: null,
    estado: null,
    startDate: null,
    endDate: null
  },
  loading: false,
  error: null
};

/**
 * Async Thunks
 */

// Get all sales
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await saleService.getAllSales(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales' });
    }
  }
);

// Get sale by ID
export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await saleService.getSaleById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sale' });
    }
  }
);

// Create sale
export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await saleService.createSale(saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create sale' });
    }
  }
);

// Update sale
export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, saleData }, { rejectWithValue }) => {
    try {
      const response = await saleService.updateSale(id, saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update sale' });
    }
  }
);

// Delete sale
export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (id, { rejectWithValue }) => {
    try {
      await saleService.deleteSale(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete sale' });
    }
  }
);

// Get my sales
export const fetchMySales = createAsyncThunk(
  'sales/fetchMySales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await saleService.getMySales(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch my sales' });
    }
  }
);

/**
 * Sale Slice
 */
const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        productoId: null,
        estado: null,
        startDate: null,
        endDate: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.sales;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch sales';
      })

      // Fetch Sale by ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch sale';
      })

      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to create sale';
      })

      // Update Sale
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale?.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to update sale';
      })

      // Delete Sale
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter(s => s.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to delete sale';
      })

      // Fetch My Sales
      .addCase(fetchMySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.sales;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMySales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch my sales';
      });
  }
});

// Export actions
export const { clearError, clearCurrentSale, setFilters, clearFilters } = saleSlice.actions;

// Selectors
export const selectSales = (state) => state.sales.sales;
export const selectCurrentSale = (state) => state.sales.currentSale;
export const selectSalesPagination = (state) => state.sales.pagination;
export const selectSalesFilters = (state) => state.sales.filters;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;

// Export reducer
export default saleSlice.reducer;