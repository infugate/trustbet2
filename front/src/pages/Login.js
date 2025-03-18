import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = () => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    setIsFormValid(isEmailValid && isPasswordValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('wallet', JSON.stringify(data.wallet));
        localStorage.setItem('history', JSON.stringify(data.history));
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Error connecting to server. Please try again later.');
    }
  };

  return (
    <LoginPageContainer>
      <LoginFormContainer>
        <Logo>
          <img src={logo} alt="RedBook Club" />
        </Logo>
        <FormTitle>Login with Email ID</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <InputGroup>
              <FaEnvelope />
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => { setEmail(e.target.value); validateForm(); }} 
                required 
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <InputGroup>
              <FaLock />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); validateForm(); }} 
                required 
              />
            </InputGroup>
          </FormGroup>

          <Button type="submit" disabled={!isFormValid}>Sign In</Button>
        </form>
        <div>
          <p>
            Don't have an account? 
            <Link to="/signup" style={{ color: 'black', textDecoration: 'none', marginLeft: '5px' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </LoginFormContainer>
    </LoginPageContainer>
  );
};

// Styled Components
const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`;

const LoginPageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2236 0%, #2d3748 100%);
  padding: 20px;
`;

const LoginFormContainer = styled.div`
  width: 100%;
  max-width: 450px;
  margin: auto;
  padding: 40px;
  background-color: white;
  border-radius: 10px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;

  img {
    height: 60px;
  }
`;

const FormTitle = styled.h2`
  color: #2d3748;
  font-size: 24px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 0;
  border: none;
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #3182ce;
  color: white;
  border-radius: 6px;
`;

export default LoginPage;
