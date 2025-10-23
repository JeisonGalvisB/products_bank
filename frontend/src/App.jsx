/**
 * Main App Component
 * Root component with providers and routing
 */

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

// Redux Store
import store from './store/store';

// Theme
import theme from './theme/theme';

// Routes
import AppRoutes from './routes/routes';

// UI Slice
import { hideSnackbar, selectSnackbar } from './store/slices/uiSlice';

/**
 * Snackbar Component
 * Global snackbar for notifications
 */
const GlobalSnackbar = () => {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector(selectSnackbar);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

/**
 * App Content
 * Contains routes and global components
 */
const AppContent = () => {
  return (
    <>
      <CssBaseline />
      <AppRoutes />
      <GlobalSnackbar />
    </>
  );
};

/**
 * Main App Component
 * Wraps app with providers
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;