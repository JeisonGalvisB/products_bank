/**
 * Sale Filters Component
 * Filters for sales list
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Box,
  TextField,
  MenuItem,
  Button,
  Grid
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { selectProducts, fetchProducts } from '../../store/slices/productSlice';
import { SALE_STATUSES } from '../../constants';

const SaleFilters = ({ onFilter = () => {}, onClear = () => {} }) => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);

  const [filters, setFilters] = useState({
    productoId: '',
    estado: '',
    startDate: '',
    endDate: ''
  });

  // Load products on mount
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFilter = () => {
    // Remove empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    onFilter(activeFilters);
  };

  const handleClear = () => {
    setFilters({
      productoId: '',
      estado: '',
      startDate: '',
      endDate: ''
    });
    onClear();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Producto"
            name="productoId"
            value={filters.productoId}
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Estado"
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={SALE_STATUSES.OPEN}>Abierto</MenuItem>
            <MenuItem value={SALE_STATUSES.IN_PROCESS}>En Proceso</MenuItem>
            <MenuItem value={SALE_STATUSES.FINISHED}>Finalizado</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Fecha Inicio"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Fecha Fin"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFilter}
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
            >
              Limpiar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SaleFilters;