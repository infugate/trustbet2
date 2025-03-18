import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
const SignupPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    const isUsernameValid = username.trim().length > 0;

    setIsFormValid(isEmailValid && isPasswordValid && isUsernameValid);
  }, [username, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { username, email, password };

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('UserNo', email);
        setSuccess('User registered successfully!');
        setError('');
        navigate('/login'); // Redirect to login page
      } else {
        setError(data.message || 'Failed to register user');
        setSuccess('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  return (
    <LoginPageContainer>
      <LoginFormContainer>
        <Logo>
          <img src={logo} alt="RedBook Club" />
        </Logo>
        <FormTitle>Create an Account</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <InputGroup>
              <FaUser />
              <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <InputGroup>
              <FaEnvelope />
              <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <InputGroup>
              <FaLock />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </InputGroup>
          </FormGroup>

          <Button type="submit" disabled={!isFormValid}>Sign Up</Button>
        </form>
            <div>
              <p>
                have an account?  
                <Link to="/login" style={{ color: 'black', textDecoration: 'none', marginLeft: '5px' }}>
                  Login
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

const SuccessMessage = styled.p`
  color: green;
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

export default SignupPage;