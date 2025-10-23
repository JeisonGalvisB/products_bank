/**
 * Role-Based Route Component
 * Wraps routes that require specific roles
 */

import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { Typography, Container, Paper } from '@mui/material';
import { ROLES } from '../constants';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector(selectUser);

  // Check if user has required role
  const hasRequiredRole = user && allowedRoles.includes(user.rolId);

  if (!hasRequiredRole) {
    // Show access denied page
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No tienes permisos para acceder a esta página.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Tu rol: {user?.rolNombre || 'Desconocido'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roles requeridos:{' '}
            {allowedRoles
              .map((roleId) => {
                if (roleId === ROLES.ADMIN.ID) return ROLES.ADMIN.NAME;
                if (roleId === ROLES.ADVISOR.ID) return ROLES.ADVISOR.NAME;
                return 'Desconocido';
              })
              .join(', ')}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return children;
};

export default RoleRoute;