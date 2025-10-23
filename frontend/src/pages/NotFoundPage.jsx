/**
 * Not Found Page
 * 404 error page
 */

import { Box, Container, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Página No Encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            La página que estás buscando no existe o ha sido movida.
          </Typography>
          <Button variant="contained" onClick={handleGoHome}>
            Ir al Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;