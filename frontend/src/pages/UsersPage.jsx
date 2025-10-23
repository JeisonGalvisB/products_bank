/**
 * Users Page
 * User management page - Admin only
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Chip, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// Components
import DataTable from '../components/common/DataTable';
import UserForm from '../components/users/UserForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Redux
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  selectUsers,
  selectUsersPagination,
  selectUsersLoading
} from '../store/slices/userSlice';
import { showSuccess, showError } from '../store/slices/uiSlice';

const UsersPage = () => {
  const dispatch = useDispatch();

  const users = useSelector(selectUsers);
  const pagination = useSelector(selectUsersPagination);
  const loading = useSelector(selectUsersLoading);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(fetchUsers({ search: searchTerm, page, limit: pagination.limit }));
  };

  const handleRowsPerPageChange = (limit) => {
    dispatch(fetchUsers({ search: searchTerm, page: 1, limit }));
  };

  const handleSearch = () => {
    dispatch(fetchUsers({ search: searchTerm, page: 1, limit: pagination.limit }));
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateOpen = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = async (data) => {
    let result;
    if (selectedUser) {
      result = await dispatch(updateUser({ id: selectedUser.id, userData: data }));
    } else {
      result = await dispatch(createUser(data));
    }

    if (createUser.fulfilled.match(result) || updateUser.fulfilled.match(result)) {
      dispatch(showSuccess(selectedUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'));
      handleFormClose();
      dispatch(fetchUsers({ search: searchTerm, page: pagination.page, limit: pagination.limit }));
    } else {
      dispatch(showError('Error al guardar el usuario'));
    }
  };

  const handleDeleteOpen = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(deleteUser(userToDelete.id));

    if (deleteUser.fulfilled.match(result)) {
      dispatch(showSuccess('Usuario eliminado exitosamente'));
      handleDeleteClose();
      dispatch(fetchUsers({ search: searchTerm, page: pagination.page, limit: pagination.limit }));
    } else {
      dispatch(showError('Error al eliminar el usuario'));
    }
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 50
    },
    {
      id: 'nombre',
      label: 'Nombre',
      minWidth: 150
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200
    },
    {
      id: 'rolNombre',
      label: 'Rol',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.rolNombre}
          color={row.rolNombre === 'Administrador' ? 'error' : 'primary'}
          size="small"
        />
      )
    },
    {
      id: 'createdAt',
      label: 'Fecha Creación',
      minWidth: 150,
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-CO')
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Usuarios
          </Typography>
          <Chip label="Admin" color="error" size="small" />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Gestión de usuarios del sistema (solo administradores)
      </Typography>

      <Box sx={{ mb: 2, mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
        emptyMessage="No hay usuarios disponibles"
      />

      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        loading={loading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteClose}
        loading={loading}
        severity="error"
        confirmText="Eliminar"
      />
    </Box>
  );
};

export default UsersPage;