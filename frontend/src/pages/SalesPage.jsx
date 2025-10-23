/**
 * Sales Page
 * Sales management page
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Components
import DataTable from '../components/common/DataTable';
import SaleForm from '../components/sales/SaleForm';
import SaleFilters from '../components/sales/SaleFilters';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Redux
import {
  fetchSales,
  createSale,
  updateSale,
  deleteSale,
  selectSales,
  selectSalesPagination,
  selectSalesLoading
} from '../store/slices/saleSlice';
import { showSuccess, showError } from '../store/slices/uiSlice';

const SalesPage = () => {
  const dispatch = useDispatch();

  const sales = useSelector(selectSales);
  const pagination = useSelector(selectSalesPagination);
  const loading = useSelector(selectSalesLoading);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(fetchSales({ ...filters, page: 1, limit: 10 }));
  }, [dispatch, filters]);

  const handlePageChange = (page) => {
    dispatch(fetchSales({ ...filters, page, limit: pagination.limit }));
  };

  const handleRowsPerPageChange = (limit) => {
    dispatch(fetchSales({ ...filters, page: 1, limit }));
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    dispatch(fetchSales({ ...newFilters, page: 1, limit: pagination.limit }));
  };

  const handleClearFilters = () => {
    setFilters({});
    dispatch(fetchSales({ page: 1, limit: pagination.limit }));
  };

  const handleCreateOpen = () => {
    setSelectedSale(null);
    setFormOpen(true);
  };

  const handleEditOpen = (sale) => {
    setSelectedSale(sale);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedSale(null);
  };

  const handleFormSubmit = async (data) => {
    let result;
    if (selectedSale) {
      result = await dispatch(updateSale({ id: selectedSale.id, saleData: data }));
    } else {
      result = await dispatch(createSale(data));
    }

    if (createSale.fulfilled.match(result) || updateSale.fulfilled.match(result)) {
      dispatch(showSuccess(selectedSale ? 'Venta actualizada exitosamente' : 'Venta creada exitosamente'));
      handleFormClose();
      dispatch(fetchSales({ ...filters, page: pagination.page, limit: pagination.limit }));
    } else {
      dispatch(showError('Error al guardar la venta'));
    }
  };

  const handleDeleteOpen = (sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    const result = await dispatch(deleteSale(saleToDelete.id));

    if (deleteSale.fulfilled.match(result)) {
      dispatch(showSuccess('Venta eliminada exitosamente'));
      handleDeleteClose();
      dispatch(fetchSales({ ...filters, page: pagination.page, limit: pagination.limit }));
    } else {
      dispatch(showError('Error al eliminar la venta'));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Abierto':
        return 'info';
      case 'En Proceso':
        return 'warning';
      case 'Finalizado':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 50
    },
    {
      id: 'productoNombre',
      label: 'Producto',
      minWidth: 150
    },
    {
      id: 'cupoSolicitado',
      label: 'Monto',
      minWidth: 120,
      align: 'right',
      render: (row) => formatCurrency(row.cupoSolicitado)
    },
    {
      id: 'franquiciaNombre',
      label: 'Franquicia',
      minWidth: 120,
      render: (row) => row.franquiciaNombre || '-'
    },
    {
      id: 'tasa',
      label: 'Tasa',
      minWidth: 80,
      render: (row) => row.tasa ? `${row.tasa}%` : '-'
    },
    {
      id: 'estado',
      label: 'Estado',
      minWidth: 120,
      render: (row) => (
        <Chip label={row.estado} color={getStatusColor(row.estado)} size="small" />
      )
    },
    {
      id: 'usuarioCreadorNombre',
      label: 'Asesor',
      minWidth: 150
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Ventas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de ventas de productos financieros
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
        >
          Nueva Venta
        </Button>
      </Box>

      <SaleFilters onFilter={handleFilter} onClear={handleClearFilters} />

      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
        emptyMessage="No hay ventas disponibles"
      />

      <SaleForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedSale}
        loading={loading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Venta"
        message={`¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteClose}
        loading={loading}
        severity="error"
        confirmText="Eliminar"
      />
    </Box>
  );
};

export default SalesPage;