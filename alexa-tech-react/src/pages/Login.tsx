import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { media } from '../styles/breakpoints';

const LoginContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  
  ${media.mobile} {
    padding: 20px;
    align-items: flex-start;
    padding-top: 60px;
  }
`;

const LoginBox = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  text-align: center;
  
  ${media.mobile} {
    padding: 30px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
  }
`;

const LoginForm = styled.form`
  .form-group {
    margin-bottom: 20px;
    text-align: left;
    
    ${media.mobile} {
      margin-bottom: 18px;
    }
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
    
    ${media.mobile} {
      font-size: 14px;
      margin-bottom: 6px;
    }
  }

  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #007bff;
    }

    &::placeholder {
      color: #999;
    }
    
    ${media.mobile} {
      padding: 14px 12px;
      font-size: 16px; /* Evita zoom en iOS */
      min-height: 44px; /* Tamaño mínimo de toque */
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #004085;
  }
  
  ${media.mobile} {
    padding: 14px 12px;
    font-size: 16px;
    min-height: 48px; /* Tamaño mínimo de toque */
    border-radius: 8px;
  }
`;

const ForgotPasswordLink = styled.div`
  margin-top: 20px;

  a {
    color: #007bff;
    text-decoration: none;
    font-size: 14px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LoginForm onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '14px', 
              marginBottom: '15px',
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <ForgotPasswordLink>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </ForgotPasswordLink>
        </LoginForm>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;