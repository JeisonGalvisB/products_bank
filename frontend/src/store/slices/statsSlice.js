/**
 * Stats Slice
 * Manages statistics and dashboard data state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import statsService from '../../services/statsService';

// Initial state
const initialState = {
  dashboard: null,
  metrics: null,
  salesByProduct: [],
  salesByAdvisor: [],
  salesByStatus: [],
  recentSales: [],
  topProducts: [],
  trends: null,
  loading: false,
  error: null
};

/**
 * Async Thunks
 */

// Get comprehensive dashboard
export const fetchComprehensiveDashboard = createAsyncThunk(
  'stats/fetchComprehensiveDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statsService.getComprehensiveDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard' });
    }
  }
);

// Get dashboard metrics
export const fetchDashboardMetrics = createAsyncThunk(
  'stats/fetchDashboardMetrics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statsService.getDashboardMetrics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch metrics' });
    }
  }
);

// Get sales by product
export const fetchSalesByProduct = createAsyncThunk(
  'stats/fetchSalesByProduct',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statsService.getSalesByProduct(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales by product' });
    }
  }
);

// Get sales by advisor
export const fetchSalesByAdvisor = createAsyncThunk(
  'stats/fetchSalesByAdvisor',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statsService.getSalesByAdvisor(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales by advisor' });
    }
  }
);

// Get sales trends
export const fetchSalesTrends = createAsyncThunk(
  'stats/fetchSalesTrends',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statsService.getSalesTrends(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch trends' });
    }
  }
);

/**
 * Stats Slice
 */
const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.dashboard = null;
      state.metrics = null;
      state.salesByProduct = [];
      state.salesByAdvisor = [];
      state.salesByStatus = [];
      state.recentSales = [];
      state.topProducts = [];
      state.trends = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comprehensive Dashboard
      .addCase(fetchComprehensiveDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComprehensiveDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || action.payload;
        state.dashboard = data;
        state.metrics = data.metrics;
        state.salesByProduct = data.salesByProduct || [];
        state.salesByAdvisor = data.salesByAdvisor || [];
        state.salesByStatus = data.salesByStatus || [];
        state.recentSales = data.recentSales || [];
        state.topProducts = data.topProducts || [];
        state.error = null;
      })
      .addCase(fetchComprehensiveDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch dashboard';
      })

      // Fetch Dashboard Metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch metrics';
      })

      // Fetch Sales by Product
      .addCase(fetchSalesByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.salesByProduct = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchSalesByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch sales by product';
      })

      // Fetch Sales by Advisor
      .addCase(fetchSalesByAdvisor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesByAdvisor.fulfilled, (state, action) => {
        state.loading = false;
        state.salesByAdvisor = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchSalesByAdvisor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch sales by advisor';
      })

      // Fetch Sales Trends
      .addCase(fetchSalesTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.trends = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchSalesTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch trends';
      });
  }
});

// Export actions
export const { clearError, clearDashboard } = statsSlice.actions;

// Selectors
export const selectDashboard = (state) => state.stats.dashboard;
export const selectMetrics = (state) => state.stats.metrics;
export const selectSalesByProduct = (state) => state.stats.salesByProduct;
export const selectSalesByAdvisor = (state) => state.stats.salesByAdvisor;
export const selectSalesByStatus = (state) => state.stats.salesByStatus;
export const selectRecentSales = (state) => state.stats.recentSales;
export const selectTopProducts = (state) => state.stats.topProducts;
export const selectTrends = (state) => state.stats.trends;
export const selectStatsLoading = (state) => state.stats.loading;
export const selectStatsError = (state) => state.stats.error;

// Export reducer
export default statsSlice.reducer;