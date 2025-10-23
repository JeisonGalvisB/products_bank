/**
 * Change Password Form Component
 * Form for changing user password
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { changePassword, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';
import { showSuccess, showError } from '../../store/slices/uiSlice';

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const handleTogglePassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setValidationError('Por favor ingresa tu contraseña actual');
      return false;
    }

    if (!formData.newPassword) {
      setValidationError('Por favor ingresa una nueva contraseña');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setValidationError('La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      setValidationError('La nueva contraseña debe contener al menos una letra minúscula');
      return false;
    }

    if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      setValidationError('La nueva contraseña debe contener al menos una letra mayúscula');
      return false;
    }

    if (!/(?=.*\d)/.test(formData.newPassword)) {
      setValidationError('La nueva contraseña debe contener al menos un número');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setValidationError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }));

    if (changePassword.fulfilled.match(result)) {
      dispatch(showSuccess('Contraseña cambiada exitosamente'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      dispatch(showError('Error al cambiar la contraseña'));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Cambiar Contraseña
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Asegúrate de usar una contraseña segura que incluya mayúsculas, minúsculas y números.
      </Typography>

      {(error || validationError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError || error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Contraseña Actual"
          name="currentPassword"
          type={showPasswords.current ? 'text' : 'password'}
          value={formData.currentPassword}
          onChange={handleChange}
          required
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleTogglePassword('current')} edge="end">
                  {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          label="Nueva Contraseña"
          name="newPassword"
          type={showPasswords.new ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={handleChange}
          required
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleTogglePassword('new')} edge="end">
                  {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          helperText="Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números"
        />

        <TextField
          fullWidth
          label="Confirmar Nueva Contraseña"
          name="confirmPassword"
          type={showPasswords.confirm ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleTogglePassword('confirm')} edge="end">
                  {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setValidationError('');
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ChangePasswordForm;