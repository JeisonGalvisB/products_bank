/**
 * Sales by Status Component
 * Display sales distribution by status
 */

import { Paper, Box, Typography, Grid, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Loading from '../common/Loading';

const SalesByStatus = ({ data = [], loading = false }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusConfig = (estado) => {
    switch (estado) {
      case 'Abierto':
        return {
          icon: HourglassEmptyIcon,
          color: 'info',
          label: 'Abiertas'
        };
      case 'En Proceso':
        return {
          icon: PlayCircleIcon,
          color: 'warning',
          label: 'En Proceso'
        };
      case 'Finalizado':
        return {
          icon: CheckCircleIcon,
          color: 'success',
          label: 'Finalizadas'
        };
      default:
        return {
          icon: HourglassEmptyIcon,
          color: 'default',
          label: estado
        };
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ventas por Estado
        </Typography>
        <Loading message="Cargando datos..." />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ventas por Estado
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {data.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center">
              No hay datos disponibles
            </Typography>
          </Grid>
        ) : (
          data.map((item) => {
            const config = getStatusConfig(item.estado);
            const Icon = config.icon;

            return (
              <Grid item xs={12} sm={4} key={item.estado}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 40,
                      color: `${config.color}.main`,
                      mb: 1
                    }}
                  />
                  <Typography variant="h4" gutterBottom>
                    {item.count}
                  </Typography>
                  <Chip
                    label={config.label}
                    color={config.color}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(item.totalAmount)}
                  </Typography>
                </Box>
              </Grid>
            );
          })
        )}
      </Grid>
    </Paper>
  );
};

export default SalesByStatus;