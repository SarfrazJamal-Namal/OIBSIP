import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from './config/api';

const PizzaBuilder = () => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    base: '',
    sauce: '',
    cheese: '',
    veggies: []
  });
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    veggies: []
  });

  // Fetch inventory
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.INVENTORY);
      const data = await res.json();
      
      if (data.success) {
        const grouped = {
          bases: data.data.filter(item => item.category === 'Base' && item.isAvailable),
          sauces: data.data.filter(item => item.category === 'Sauce' && item.isAvailable),
          cheeses: data.data.filter(item => item.category === 'Cheese' && item.isAvailable),
          veggies: data.data.filter(item => item.category === 'Veggies' && item.isAvailable)
        };
        setInventory(grouped);
      }
    } catch (err) {
      console.error('Inventory Error:', err);
    }
  };

  const handleVeggieToggle = (item) => {
    setSelection(prev => ({
      ...prev,
      veggies: prev.veggies.includes(item)
        ? prev.veggies.filter(v => v !== item)
        : [...prev.veggies, item]
    }));
  };

  const handleExecutePayment = async () => {
    try {
      setLoading(true);
      
      const res = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...selection, 
          amount: 14.99,
          paymentStatus: 'Completed',
          paymentMethod: 'Razorpay'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowRazorpay(false);
        setOrderStatus(data.order);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Order Error:', err);
      setLoading(false);
    }
  };

  // Order Confirmation Screen
  if (orderStatus) {
    return (
      <div style={{ padding: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', marginTop: '20px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ fontSize: '64px', marginBottom: '10px' }}>🎉</div>
          <h2 style={{ margin: '10px 0', fontSize: '28px' }}>Payment Success & Order Confirmed!</h2>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.95)', color: '#1f2937', padding: '25px', borderRadius: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#6b7280' }}>Order ID</p>
              <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
                {orderStatus._id}
              </p>
            </div>
            <div>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#6b7280' }}>Amount Paid</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                ${orderStatus.amount}
              </p>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Payment Mode:</strong>{' '}
              <span style={{ 
                padding: '4px 10px', 
                background: '#d1fae5', 
                color: '#065f46',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {orderStatus.paymentStatus} via {orderStatus.paymentMethod}
              </span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Live Order Status:</strong>{' '}
              <span style={{ 
                padding: '4px 10px', 
                background: '#dbeafe', 
                color: '#1e40af',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {orderStatus.status}
              </span>
            </div>
            
            <div style={{ marginTop: '15px', padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Base:</strong> {orderStatus.base}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Sauce:</strong> {orderStatus.sauce}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Cheese:</strong> {orderStatus.cheese}</p>
              {orderStatus.veggies && orderStatus.veggies.length > 0 && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Veggies:</strong> {orderStatus.veggies.join(', ')}
                </p>
              )}
            </div>
            
            <p style={{ margin: '15px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              <strong>Ordered at:</strong> {new Date(orderStatus.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => { 
            setOrderStatus(null); 
            setStep(1); 
            setSelection({ base: '', sauce: '', cheese: '', veggies: [] });
          }} 
          style={{ 
            width: '100%',
            padding: '14px 24px', 
            cursor: 'pointer', 
            background: '#fff', 
            color: '#667eea', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          Place New Order
        </button>
      </div>
    );
  }

  // Pizza Builder Steps
  return (
    <div style={{ maxWidth: '550px', margin: '20px auto', padding: '25px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
        Custom Pizza Builder (Step {step} of 4)
      </h2>

      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#374151' }}>Select Base:</h3>
          {inventory.bases.map(item => (
            <button 
              key={item._id} 
              onClick={() => { setSelection({ ...selection, base: item.item }); setStep(2); }} 
              style={btnStyle}
            >
              {item.item} <span style={{ fontSize: '12px', color: '#6b7280' }}>({item.stock} available)</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#374151' }}>Select Sauce:</h3>
          {inventory.sauces.map(item => (
            <button 
              key={item._id} 
              onClick={() => { setSelection({ ...selection, sauce: item.item }); setStep(3); }} 
              style={btnStyle}
            >
              {item.item} <span style={{ fontSize: '12px', color: '#6b7280' }}>({item.stock} available)</span>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#374151' }}>Select Cheese:</h3>
          {inventory.cheeses.map(item => (
            <button 
              key={item._id} 
              onClick={() => { setSelection({ ...selection, cheese: item.item }); setStep(4); }} 
              style={btnStyle}
            >
              {item.item} <span style={{ fontSize: '12px', color: '#6b7280' }}>({item.stock} available)</span>
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#374151' }}>Select Vegetables (Optional):</h3>
          {inventory.veggies.map(item => (
            <label key={item._id} style={{ display: 'block', margin: '12px 0', cursor: 'pointer', padding: '10px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input
                type="checkbox"
                checked={selection.veggies.includes(item.item)}
                onChange={() => handleVeggieToggle(item.item)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              /> 
              <strong>{item.item}</strong> <span style={{ fontSize: '12px', color: '#6b7280' }}>({item.stock} available)</span>
            </label>
          ))}
          <button 
            onClick={() => setShowRazorpay(true)} 
            style={{ 
              ...btnStyle, 
              background: '#16a34a', 
              color: '#fff', 
              marginTop: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Proceed to Checkout ($14.99)
          </button>
        </div>
      )}

      {step > 1 && (
        <button 
          onClick={() => setStep(step - 1)} 
          style={{ 
            marginTop: '15px', 
            padding: '10px 20px', 
            background: '#f3f4f6', 
            border: '1px solid #d1d5db', 
            borderRadius: '6px', 
            cursor: 'pointer',
            color: '#374151'
          }}
        >
          ← Back
        </button>
      )}

      {/* Razorpay Test Modal */}
      {showRazorpay && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.7)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '30px', 
            borderRadius: '12px', 
            width: '380px', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>💳</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Razorpay Checkout</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>(Test Mode)</p>
            </div>
            
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Payable</span>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>$14.99</div>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                Merchant ID: rzp_test_mockkey123
              </div>
            </div>
            
            <button 
              onClick={handleExecutePayment} 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: loading ? '#9ca3af' : '#2563eb', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                marginBottom: '12px'
              }}
            >
              {loading ? 'Processing...' : '✓ Simulate Successful Payment'}
            </button>
            
            <button 
              onClick={() => setShowRazorpay(false)} 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#f3f4f6', 
                color: '#374151', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  background: '#f9fafb',
  cursor: 'pointer',
  fontSize: '14px',
  textAlign: 'left',
  transition: 'all 0.2s',
  ':hover': {
    background: '#f3f4f6'
  }
};

export default PizzaBuilder;
