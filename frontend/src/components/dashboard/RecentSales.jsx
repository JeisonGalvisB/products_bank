/**
 * Recent Sales Component
 * Display list of recent sales
 */

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box
} from '@mui/material';
import Loading from '../common/Loading';

const RecentSales = ({ sales = [], loading = false }) => {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ventas Recientes
        </Typography>
        <Loading message="Cargando ventas recientes..." />
      </Paper>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Ventas Recientes</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Asesor</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No hay ventas recientes
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id} hover>
                  <TableCell>{sale.productoNombre}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(sale.cupoSolicitado)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.estado}
                      color={getStatusColor(sale.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{sale.usuarioCreadorNombre}</TableCell>
                  <TableCell>{formatDate(sale.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentSales;