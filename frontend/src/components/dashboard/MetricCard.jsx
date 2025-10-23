/**
 * Metric Card Component
 * Display metric with icon and value
 */

import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const MetricCard = ({
  title = '',
  value = 0,
  icon: Icon = TrendingUpIcon,
  color = 'primary',
  prefix = '',
  suffix = '',
  loading = false
}) => {
  const getColorValue = () => {
    switch (color) {
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      case 'info':
        return 'info.main';
      case 'primary':
      default:
        return 'primary.main';
    }
  };

  const formatValue = () => {
    if (loading) return '...';

    // Format numbers with thousands separator
    const formattedValue = typeof value === 'number'
      ? value.toLocaleString('es-CO')
      : value;

    return `${prefix}${formattedValue}${suffix}`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {formatValue()}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: getColorValue(),
              width: 56,
              height: 56
            }}
          >
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;