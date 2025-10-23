/**
 * ConfirmDialog Component
 * Reusable confirmation dialog
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmDialog = ({
  open = false,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  severity = 'warning' // 'warning', 'error', 'info'
}) => {
  const getColor = () => {
    switch (severity) {
      case 'error':
        return 'error.main';
      case 'info':
        return 'info.main';
      case 'warning':
      default:
        return 'warning.main';
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ color: getColor() }} />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
          disabled={loading}
        >
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;