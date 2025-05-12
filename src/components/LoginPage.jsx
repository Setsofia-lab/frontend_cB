// components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import styles from './LoginPage.module.css'; 

// You'll need to replace this with your actual Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Get location object

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate successful login
    console.log('Login attempt with:', { email, password });

    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role');

    if (role === 'instructor') {
      navigate('/instructor'); // Navigate to instructor dashboard
    } else {
      navigate('/chat'); // Navigate to student chat page
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    // Here you would typically send the token to your backend for verification and session creation
    
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role');

    if (role === 'instructor') {
      navigate('/instructor');
    } else {
      navigate('/chat');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    // Handle login failure (e.g., show an error message to the user)
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <h2>Login</h2>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.loginButton}>Login</button>
          </form>
          <div className={styles.divider}>
            <span>OR</span>
          </div>
          <div className={styles.googleLoginButtonContainer}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              width="318px" // To match the form width approximately
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
