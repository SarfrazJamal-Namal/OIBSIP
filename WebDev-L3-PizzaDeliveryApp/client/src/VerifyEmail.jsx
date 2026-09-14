import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from './config/api';

function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const res = await fetch(API_ENDPOINTS.AUTH_VERIFY(token));
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (err) {
        console.error('Verification Error:', err);
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
      }
    };

    verifyToken();
  }, []);

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '80px auto', 
      padding: '40px', 
      textAlign: 'center', 
      border: '1px solid #ddd', 
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      background: '#fff'
    }}>
      {status === 'verifying' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Verifying Email...</h2>
          <p style={{ color: '#6b7280' }}>Please wait while we verify your account.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#16a34a', marginBottom: '10px' }}>Email Verified!</h2>
          <p style={{ color: '#374151', marginBottom: '30px' }}>{message}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ 
              padding: '12px 30px', 
              background: '#0284c7', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Go to Login
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Verification Failed</h2>
          <p style={{ color: '#374151', marginBottom: '30px' }}>{message}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ 
              padding: '12px 30px', 
              background: '#6b7280', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Back to Home
          </button>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
