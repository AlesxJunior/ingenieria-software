import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { media } from '../../../styles/breakpoints';
import { COLOR_SCALES } from '../../../styles/theme';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const LoginContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, ${COLOR_SCALES.primary[900]} 0%, ${COLOR_SCALES.primary[800]} 50%, ${COLOR_SCALES.primary[700]} 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 40%);
    pointer-events: none;
  }
  
  ${media.mobile} {
    padding: 20px;
    align-items: flex-start;
    padding-top: 60px;
  }
`;

const LoginBox = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3), 
              0 0 0 1px rgba(255,255,255,0.2),
              inset 0 1px 0 rgba(255,255,255,0.8);
  width: 100%;
  max-width: 440px;
  padding: 52px 44px;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: ${floatAnimation} 6s ease-in-out infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.35), 
                0 0 0 1px rgba(255,255,255,0.3),
                inset 0 1px 0 rgba(255,255,255,0.9);
  }
  
  ${media.mobile} {
    padding: 40px 28px;
    border-radius: 20px;
    animation: none;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  }
`;

const LogoText = styled.h1`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a5f 0%, #3498db 50%, #1e3a5f 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
  animation: ${shimmer} 3s linear infinite;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 15px;
  margin: 0 0 36px 0;
  font-weight: 400;
`;

const LoginForm = styled.form`
  .form-group {
    margin-bottom: 24px;
    text-align: left;
    
    ${media.mobile} {
      margin-bottom: 20px;
    }
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: #374151;
    font-weight: 600;
    font-size: 14px;
    transition: color 0.2s ease;
    
    ${media.mobile} {
      font-size: 14px;
      margin-bottom: 6px;
    }
  }

  input {
    width: 100%;
    padding: 16px 18px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-sizing: border-box;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: #f8fafc;

    &:hover {
      border-color: #90caf9;
      background: #fff;
    }

    &:focus {
      outline: none;
      border-color: #42a5f5;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(66, 165, 245, 0.2), 0 4px 12px rgba(52, 152, 219, 0.15);
      transform: translateY(-1px);
    }

    &::placeholder {
      color: #9ca3af;
    }

    /* Deshabilitar el ícono nativo de mostrar/ocultar contraseña del navegador */
    &::-ms-reveal,
    &::-ms-clear {
      display: none;
    }

    &::-webkit-contacts-auto-fill-button,
    &::-webkit-credentials-auto-fill-button {
      visibility: hidden;
      display: none !important;
      pointer-events: none;
      height: 0;
      width: 0;
      margin: 0;
    }
    
    ${media.mobile} {
      padding: 16px 14px;
      font-size: 16px;
      min-height: 52px;
    }
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  font-size: 18px;

  &:hover {
    color: ${COLOR_SCALES.primary[600]};
  }

  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: ${COLOR_SCALES.primary[600]};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  letter-spacing: 0.5px;

  &:hover {
    background: ${COLOR_SCALES.primary[700]};
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.5);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
    
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
    }
  }
  
  ${media.mobile} {
    padding: 18px;
    font-size: 17px;
    min-height: 56px;
    border-radius: 14px;
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logs
  console.log('[LOGIN] Estado:', { isAuthenticated, isLoading });

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('[LOGIN] useEffect:', { isAuthenticated, isLoading });
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('[LOGIN] Redirigiendo a:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Si el login es exitoso, el useEffect se encargará de la redirección
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug: Verificar si se está renderizando
  console.log('[LOGIN] Renderizando componente...');
  
  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <LoginContainer>
        <LoginBox>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Cargando...</p>
          </div>
        </LoginBox>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginBox>
        <LogoText>AlexaTech</LogoText>
        <Subtitle>Inicia sesión en tu cuenta</Subtitle>
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
            <PasswordInputWrapper>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '48px' }}
              />
              <TogglePasswordButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </TogglePasswordButton>
            </PasswordInputWrapper>
          </div>
          {error && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '14px', 
              marginBottom: '15px',
              textAlign: 'center',
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </LoginForm>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;