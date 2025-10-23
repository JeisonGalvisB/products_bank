/**
 * Profile Page
 * User profile and settings
 */

import { Box, Typography, Paper, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

const ProfilePage = () => {
  const user = useSelector(selectUser);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Información personal y configuración de cuenta
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nombre:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.nombre || '-'}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Email:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.email || '-'}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Rol:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.rolNombre || '-'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChangePasswordForm />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;