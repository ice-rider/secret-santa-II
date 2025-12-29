import { A } from '@solidjs/router';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Box, Container, Typography } from '@suid/material';

const NotFoundPage = () => {
  return (
    <Box
      component="div"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))'
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ textAlign: 'center', py: 8, px: 4 }}>
          <Typography variant="h1" color="primary" mb={2}>
            404
          </Typography>
          <Typography variant="h5" mb={2}>
            Page Not Found
          </Typography>
          <Typography color="textSecondary" mb={4}>
            Sorry, we couldn't find the page you're looking for.
          </Typography>
          <A href="/" style="text-decoration: none;">
            <Button variant="contained">
              Go Home
            </Button>
          </A>
        </Card>
      </Container>
    </Box>
  );
};

export default NotFoundPage;