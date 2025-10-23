/**
 * User Form Component
 * Form for creating and editing users
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FormDialog from '../common/FormDialog';
import { selectRoles, fetchRoles } from '../../store/slices/productSlice';

const UserForm = ({
  open = false,
  onClose = () => {},
  onSubmit = () => {},
  initialData = null,
  loading = false
}) => {
  const dispatch = useDispatch();
  const roles = useSelector(selectRoles);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rolId: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Load roles on mount
  useEffect(() => {
    if (open && roles.length === 0) {
      dispatch(fetchRoles());
    }
  }, [open, dispatch, roles.length]);

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        email: initialData.email || '',
        password: '', // Don't populate password when editing
        rolId: initialData.rolId || ''
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rolId: ''
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = () => {
    const submitData = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim().toLowerCase(),
      rolId: parseInt(formData.rolId)
    };

    // Only include password if it's provided (for create or update)
    if (formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <FormDialog
      open={open}
      title={initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      maxWidth="sm"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nombre Completo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={initialData ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required={!initialData}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText="Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Rol"
            name="rolId"
            value={formData.rolId}
            onChange={handleChange}
            required
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default UserForm;