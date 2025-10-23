/**
 * Dashboard Page
 * Main dashboard with statistics and metrics
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Grid } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Components
import MetricCard from '../components/dashboard/MetricCard';
import RecentSales from '../components/dashboard/RecentSales';
import TopProducts from '../components/dashboard/TopProducts';
import SalesByStatus from '../components/dashboard/SalesByStatus';
import Loading from '../components/common/Loading';

// Redux
import {
  fetchComprehensiveDashboard,
  selectMetrics,
  selectRecentSales,
  selectTopProducts,
  selectSalesByStatus,
  selectStatsLoading
} from '../store/slices/statsSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();

  const metrics = useSelector(selectMetrics);
  const recentSales = useSelector(selectRecentSales);
  const topProducts = useSelector(selectTopProducts);
  const salesByStatus = useSelector(selectSalesByStatus);
  const loading = useSelector(selectStatsLoading);

  useEffect(() => {
    dispatch(fetchComprehensiveDashboard());
  }, [dispatch]);

  if (loading && !metrics) {
    return <Loading message="Cargando dashboard..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Panel de control principal con estadísticas
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Ventas"
            value={metrics?.totalSales || 0}
            icon={ShoppingCartIcon}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monto Total"
            value={metrics?.totalAmount || 0}
            icon={AttachMoneyIcon}
            color="success"
            prefix="$"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="En Proceso"
            value={metrics?.salesByStatus?.inProcess || 0}
            icon={HourglassEmptyIcon}
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Finalizadas"
            value={metrics?.salesByStatus?.finished || 0}
            icon={CheckCircleIcon}
            color="success"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Sales by Status */}
      <Box sx={{ mt: 3 }}>
        <SalesByStatus data={salesByStatus} loading={loading} />
      </Box>

      {/* Recent Sales and Top Products */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} lg={8}>
          <RecentSales sales={recentSales} loading={loading} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <TopProducts products={topProducts} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;