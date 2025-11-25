import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useRegisterMutation } from '@/state/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password }).unwrap();
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err?.data?.error || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={onSubmit}>
            <Typography variant="h4" textAlign="center">Create your STREAM account</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained" disabled={isLoading}>Create account</Button>
            <Box>
              <Typography variant="body2">Already have an account? <Button onClick={() => navigate('/login')}>Sign in</Button></Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;


