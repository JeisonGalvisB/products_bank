/**
 * Sale Form Component
 * Form for creating and editing sales
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import FormDialog from '../common/FormDialog';
import { selectProducts, selectFranchises, fetchProducts, fetchFranchises } from '../../store/slices/productSlice';
import { PRODUCTS, SALE_STATUSES } from '../../constants';

const SaleForm = ({
  open = false,
  onClose = () => {},
  onSubmit = () => {},
  initialData = null,
  loading = false
}) => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const franchises = useSelector(selectFranchises);

  const [formData, setFormData] = useState({
    productoId: '',
    cupoSolicitado: '',
    franquiciaId: '',
    tasa: '',
    estado: SALE_STATUSES.OPEN
  });

  // Load products and franchises on mount
  useEffect(() => {
    if (open) {
      if (products.length === 0) {
        dispatch(fetchProducts());
      }
      if (franchises.length === 0) {
        dispatch(fetchFranchises());
      }
    }
  }, [open, dispatch, products.length, franchises.length]);

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        productoId: initialData.productoId || '',
        cupoSolicitado: initialData.cupoSolicitado || '',
        franquiciaId: initialData.franquiciaId || '',
        tasa: initialData.tasa || '',
        estado: initialData.estado || SALE_STATUSES.OPEN
      });
    } else {
      setFormData({
        productoId: '',
        cupoSolicitado: '',
        franquiciaId: '',
        tasa: '',
        estado: SALE_STATUSES.OPEN
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear franchise when product changes and it's not a credit card
    if (name === 'productoId' && parseInt(value) !== PRODUCTS.CREDIT_CARD.ID) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        franquiciaId: ''
      }));
    }

    // Clear rate when product changes and it's not credit or payroll
    if (name === 'productoId') {
      const productId = parseInt(value);
      if (productId !== PRODUCTS.CONSUMER_CREDIT.ID &&
          productId !== PRODUCTS.FREE_INVESTMENT_PAYROLL.ID) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          tasa: ''
        }));
      }
    }
  };

  const handleSubmit = () => {
    // Prepare data
    const submitData = {
      productoId: parseInt(formData.productoId),
      cupoSolicitado: parseFloat(formData.cupoSolicitado),
      estado: formData.estado
    };

    // Add franchise only for credit cards
    if (parseInt(formData.productoId) === PRODUCTS.CREDIT_CARD.ID && formData.franquiciaId) {
      submitData.franquiciaId = parseInt(formData.franquiciaId);
    }

    // Add rate only for credits and payrolls
    const productId = parseInt(formData.productoId);
    if ((productId === PRODUCTS.CONSUMER_CREDIT.ID ||
         productId === PRODUCTS.FREE_INVESTMENT_PAYROLL.ID) &&
        formData.tasa) {
      submitData.tasa = parseFloat(formData.tasa);
    }

    onSubmit(submitData);
  };

  // Determine if franchise field should be shown
  const showFranchise = parseInt(formData.productoId) === PRODUCTS.CREDIT_CARD.ID;

  // Determine if rate field should be shown
  const showRate = parseInt(formData.productoId) === PRODUCTS.CONSUMER_CREDIT.ID ||
                    parseInt(formData.productoId) === PRODUCTS.FREE_INVESTMENT_PAYROLL.ID;

  return (
    <FormDialog
      open={open}
      title={initialData ? 'Editar Venta' : 'Nueva Venta'}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      maxWidth="md"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Producto"
            name="productoId"
            value={formData.productoId}
            onChange={handleChange}
            required
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cupo Solicitado"
            name="cupoSolicitado"
            type="number"
            value={formData.cupoSolicitado}
            onChange={handleChange}
            required
            inputProps={{ min: 0, step: 1000 }}
          />
        </Grid>

        {showFranchise && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Franquicia"
              name="franquiciaId"
              value={formData.franquiciaId}
              onChange={handleChange}
              required={showFranchise}
            >
              {franchises.map((franchise) => (
                <MenuItem key={franchise.id} value={franchise.id}>
                  {franchise.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {showRate && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tasa (%)"
              name="tasa"
              type="number"
              value={formData.tasa}
              onChange={handleChange}
              required={showRate}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <MenuItem value={SALE_STATUSES.OPEN}>Abierto</MenuItem>
            <MenuItem value={SALE_STATUSES.IN_PROCESS}>En Proceso</MenuItem>
            <MenuItem value={SALE_STATUSES.FINISHED}>Finalizado</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default SaleForm;