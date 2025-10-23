/**
 * Top Products Component
 * Display top selling products
 */

import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import Loading from '../common/Loading';

const TopProducts = ({ products = [], loading = false }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calculate max sales count for progress bar
  const maxSalesCount = products.length > 0
    ? Math.max(...products.map(p => p.salesCount))
    : 0;

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Productos Más Vendidos
        </Typography>
        <Loading message="Cargando productos..." />
      </Paper>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Productos Más Vendidos</Typography>
      </Box>
      <List>
        {products.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography color="text.secondary" align="center">
                  No hay datos disponibles
                </Typography>
              }
            />
          </ListItem>
        ) : (
          products.map((product, index) => (
            <ListItem key={product.productoId} divider={index < products.length - 1}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      {product.productoNombre}
                    </Typography>
                    <Chip
                      label={`${product.salesCount} ventas`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total: {formatCurrency(product.totalAmount)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.salesCount / maxSalesCount) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default TopProducts;