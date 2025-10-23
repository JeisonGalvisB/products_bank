/**
 * UI Slice
 * Manages UI state (snackbars, modals, drawer, etc.)
 */

import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  },
  drawer: {
    open: true
  },
  modal: {
    open: false,
    type: null,
    data: null
  },
  loading: {
    global: false
  }
};

/**
 * UI Slice
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Snackbar actions
    showSnackbar: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity || 'info';
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    showSuccess: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'success';
    },
    showError: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'error';
    },
    showWarning: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'warning';
    },
    showInfo: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload;
      state.snackbar.severity = 'info';
    },

    // Drawer actions
    toggleDrawer: (state) => {
      state.drawer.open = !state.drawer.open;
    },
    openDrawer: (state) => {
      state.drawer.open = true;
    },
    closeDrawer: (state) => {
      state.drawer.open = false;
    },

    // Modal actions
    openModal: (state, action) => {
      state.modal.open = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.type = null;
      state.modal.data = null;
    },

    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    }
  }
});

// Export actions
export const {
  showSnackbar,
  hideSnackbar,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  toggleDrawer,
  openDrawer,
  closeDrawer,
  openModal,
  closeModal,
  setGlobalLoading
} = uiSlice.actions;

// Selectors
export const selectSnackbar = (state) => state.ui.snackbar;
export const selectDrawer = (state) => state.ui.drawer;
export const selectModal = (state) => state.ui.modal;
export const selectGlobalLoading = (state) => state.ui.loading.global;

// Export reducer
export default uiSlice.reducer;