import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useLoginMutation, useGetMeQuery } from '@/state/api';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation() as any;
  useGetMeQuery(undefined, { skip: true });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password }).unwrap();
      const to = location.state?.from?.pathname || '/home';
      navigate(to, { replace: true });
    } catch (err: any) {
      setError(err?.data?.error || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={onSubmit}>
            <Typography variant="h4" textAlign="center">Sign in to STREAM</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" disabled={isLoading}>Sign in</Button>
            <Box>
              <Typography variant="body2">New here? <Button onClick={() => navigate('/register')}>Create an account</Button></Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;


