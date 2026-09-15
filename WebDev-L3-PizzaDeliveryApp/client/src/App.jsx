import React, { useState, useEffect } from 'react';
import PizzaBuilder from './PizzaBuilder';
import VerifyEmail from './VerifyEmail';
import { API_ENDPOINTS } from './config/api';

function App() {
  // Check if URL is verification page
  const isVerifyPage = window.location.pathname === '/verify' || window.location.search.includes('token=');
  
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Verification modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');

  // Show verification page if needed
  if (isVerifyPage) {
    return <VerifyEmail />;
  }

  // Fetch Admin Data
  const fetchAdminData = async () => {
    try {
      const resOrders = await fetch(API_ENDPOINTS.ORDERS);
      const dataOrders = await resOrders.json();
      setOrders(dataOrders.data || []);

      const resInv = await fetch(API_ENDPOINTS.INVENTORY);
      const dataInv = await resInv.json();
      setInventory(dataInv.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchAdminData();
      // Refresh every 10 seconds
      const interval = setInterval(fetchAdminData, 10000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isAdminEmail = userEmail.trim().toLowerCase() === 'sarfrazjamal56@gmail.com';
      const requestRole = isAdminEmail ? 'admin' : (isAdminLogin ? 'admin' : 'user');
      
      if (isRegister) {
        const res = await fetch(API_ENDPOINTS.AUTH_SEND_OTP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail.trim(), 
            password,
            name: userEmail.split('@')[0],
            role: requestRole
          })
        });
        
        const data = await res.json();
        
        if (data.success && data.needsVerification) {
          alert('See your verification 6-digit code sent to your email.');
          setPendingEmail(userEmail.trim());
          setPendingName(userEmail.split('@')[0]);
          setPendingPassword(password);
          setShowVerificationModal(true);
          setUserEmail('');
          setPassword('');
        } else {
          alert(data.message || 'Failed to send verification email. Please check your email address and try again.');
        }
      } else {
        const res = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail.trim(), 
            password,
            role: requestRole
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          const finalRole = isAdminEmail ? 'admin' : data.role;
          setToken(data.token);
          setRole(finalRole);
          
          let name = data.name || data.email.split('@')[0];
          if (isAdminEmail) {
            name = 'Sarfraz Jamal';
          }
          setUserName(name);
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', finalRole);
          localStorage.setItem('email', data.email);
          localStorage.setItem('userName', name);
          
          setUserEmail('');
          setPassword('');
        } else {
          alert(data.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      console.error('Auth Error:', err);
      alert('Authentication Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: pendingEmail, 
          otp: verificationCode 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Verification successful - now login user
        const isAdminEmail = pendingEmail.toLowerCase() === 'sarfrazjamal56@gmail.com';
        const finalRole = isAdminEmail ? 'admin' : data.role;
        
        setToken(data.token);
        setRole(finalRole);
        
        let name = data.name || data.email.split('@')[0];
        if (isAdminEmail) {
          name = 'Sarfraz Jamal';
        }
        setUserName(name);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', finalRole);
        localStorage.setItem('email', data.email);
        localStorage.setItem('userName', name);
        
        // Close modal
        setShowVerificationModal(false);
        setVerificationCode('');
        setPendingEmail('');
        setPendingName('');
        setPendingPassword('');
        
        alert('Email verified successfully! Welcome to Pizza Platform! 🍕');
      } else {
        alert(data.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('Verify Error:', err);
      alert('Verification Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setRole('');
    setUserName('');
    setUserEmail('');
    setPassword('');
    setShowPassword(false);
    setIsAdminLogin(false);
    setIsRegister(false);
    localStorage.clear();
    setShowAdminPanel(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.ADMIN_UPDATE_ORDER(orderId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update local state immediately
        setOrders(orders.map(o => 
          o._id === orderId ? { ...o, status: newStatus } : o
        ));
        
        // Also refresh from server
        fetchAdminData();
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Update Status Error:', err);
      alert('Error updating order status');
    } finally {
      setLoading(false);
    }
  };

  // Login/Register Form
  if (!token) {
    return (
      <>
        <div style={{ maxWidth: '420px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', background: '#fff' }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🍕</div>
        <h2 style={{ marginBottom: '10px', color: '#1f2937' }}>Pizza Platform</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '25px' }}>
          {isRegister ? 'Create your account' : 'Sign in to continue'}
        </p>
        
        <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => { setIsAdminLogin(false); setIsRegister(false); }} 
            style={{ 
              padding: '10px 20px', 
              background: !isAdminLogin ? '#0284c7' : '#e5e7eb', 
              color: !isAdminLogin ? '#fff' : '#374151', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              flex: 1
            }}
          >
            {!isAdminLogin && '👤 '}User
          </button>
          <button 
            onClick={() => { setIsAdminLogin(true); setIsRegister(false); }} 
            style={{ 
              padding: '10px 20px', 
              background: isAdminLogin ? '#0284c7' : '#e5e7eb', 
              color: isAdminLogin ? '#fff' : '#374151', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              flex: 1
            }}
          >
            {isAdminLogin && '🔐 '}Admin
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ marginTop: '20px' }} autoComplete="off">
          <input 
            type="email" 
            name="email"
            placeholder="Email Address" 
            value={userEmail} 
            onChange={(e) => setUserEmail(e.target.value)} 
            required 
            autoComplete="off"
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '12px', 
              margin: '10px 0', 
              boxSizing: 'border-box',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#1f2937'
            }} 
          />
          
          <div style={{ position: 'relative', margin: '10px 0' }}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="new-password"
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '12px', 
                paddingRight: '45px',
                boxSizing: 'border-box',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937'
              }} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6b7280',
                padding: '5px'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: loading ? '#9ca3af' : '#16a34a', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        {!isAdminLogin && (
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#0284c7', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isRegister ? 'Login here' : 'Register here'}
            </button>
          </p>
        )}

        {isAdminLogin && (
          <div style={{ marginTop: '20px', padding: '12px', background: '#fef3c7', borderRadius: '6px', fontSize: '13px', textAlign: 'center', border: '1px solid #fbbf24' }}>
            <strong>⚠️ Authorized Access Only</strong><br />
            <span style={{ fontSize: '12px', color: '#78716c' }}>Contact: Sarfraz Jamal</span>
          </div>
        )}
      </div>

      {/* Verification Code Modal */}
      {showVerificationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📧</div>
            <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Verify Your Email</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>
              We've sent a 6-digit verification code to<br />
              <strong style={{ color: '#0284c7' }}>{pendingEmail}</strong>
            </p>

            <form onSubmit={handleVerifyCode}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: (loading || verificationCode.length !== 6) ? '#9ca3af' : '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: (loading || verificationCode.length !== 6) ? 'not-allowed' : 'pointer',
                  marginBottom: '15px'
                }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setPendingEmail('');
                  setPendingName('');
                  setPendingPassword('');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </form>

            <div style={{ marginTop: '20px', padding: '12px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fbbf24' }}>
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                📬 <strong>Check your email inbox</strong> (or spam/junk folder) for the 6-digit verification code.
              </p>
            </div>
            
            <p style={{ marginTop: '15px', fontSize: '12px', color: '#9ca3af' }}>
              ⏰ Code expires in 10 minutes
            </p>
          </div>
        </div>
      )}
    </>
    );
  }

  // Main App (After Login)
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>🍕 Pizza Platform</h1>
          <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
            {role === 'admin' ? '🔐 Admin Dashboard' : '👤 User Portal'} • <strong>{userName}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {role === 'admin' && (
            <button 
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              style={{ 
                padding: '10px 20px', 
                background: showAdminPanel ? '#0284c7' : '#f3f4f6', 
                color: showAdminPanel ? '#fff' : '#374151', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {showAdminPanel ? '🍕 Order Pizza' : '⚙️ Admin Panel'}
            </button>
          )}
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '10px 20px', 
              background: '#dc2626', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* USER VIEW (Always visible for users, toggle for admin) */}
      {(role === 'user' || (role === 'admin' && !showAdminPanel)) && (
        <div>
          <PizzaBuilder />
        </div>
      )}

      {/* ADMIN PANEL (Only visible when admin clicks Admin Panel button) */}
      {role === 'admin' && showAdminPanel && (
        <div style={{ marginTop: '20px' }}>
          {/* Orders Management */}
          <div style={{ marginBottom: '40px', background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📊 Live Orders Management</h2>
              <button 
                onClick={fetchAdminData}
                disabled={loading}
                style={{ 
                  padding: '8px 16px', 
                  background: loading ? '#9ca3af' : '#0284c7', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
                <p>No orders yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Order ID</th>
                      <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Pizza Details</th>
                      <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Amount</th>
                      <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Payment</th>
                      <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Current Status</th>
                      <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>
                          {o._id.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                            {o.base} • {o.sauce} • {o.cheese}
                          </div>
                          {o.veggies && o.veggies.length > 0 && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              + {o.veggies.join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '15px', color: '#16a34a' }}>
                          ${o.amount}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            background: '#d1fae5', 
                            color: '#065f46',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {o.paymentStatus || 'Completed'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '6px 12px', 
                            background: 
                              o.status === 'Delivered' ? '#d1fae5' : 
                              o.status === 'Sent to Delivery' ? '#fef3c7' :
                              o.status === 'In Kitchen' ? '#dbeafe' : '#f3f4f6',
                            color: 
                              o.status === 'Delivered' ? '#065f46' : 
                              o.status === 'Sent to Delivery' ? '#92400e' :
                              o.status === 'In Kitchen' ? '#1e40af' : '#374151',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select 
                            value={o.status} 
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)} 
                            disabled={loading}
                            style={{ 
                              padding: '8px 12px', 
                              border: '1px solid #d1d5db', 
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              background: '#fff',
                              fontWeight: '500'
                            }}
                          >
                            <option value="Order Received">Order Received</option>
                            <option value="In Kitchen">In Kitchen</option>
                            <option value="Sent to Delivery">Sent to Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inventory Tracker */}
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px' }}>📦 Inventory Alert Tracker</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Item Name</th>
                    <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Category</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Stock Level</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((inv) => (
                    <tr key={inv._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#1f2937' }}>{inv.item}</td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {inv.category}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        color: inv.stock < 20 ? '#dc2626' : inv.stock < 40 ? '#f59e0b' : '#16a34a', 
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {inv.stock}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {inv.stock < 20 ? (
                          <span style={{ 
                            padding: '6px 12px', 
                            background: '#fee2e2', 
                            color: '#991b1b',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            ⚠️ CRITICAL
                          </span>
                        ) : inv.stock < 40 ? (
                          <span style={{ 
                            padding: '6px 12px', 
                            background: '#fef3c7', 
                            color: '#92400e',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            ⚡ LOW
                          </span>
                        ) : (
                          <span style={{ 
                            padding: '6px 12px', 
                            background: '#d1fae5', 
                            color: '#065f46',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            ✓ GOOD
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {inv.isAvailable ? (
                          <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: '500' }}>✓ Available</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>✗ Out of Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
