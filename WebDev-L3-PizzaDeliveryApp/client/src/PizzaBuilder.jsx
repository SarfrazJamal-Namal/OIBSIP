import React, { useState } from 'react';

const PizzaBuilder = () => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    base: '',
    sauce: '',
    cheese: '',
    veggies: []
  });
  const [orderStatus, setOrderStatus] = useState(null);

  const bases = ['Thin Crust', 'Cheese Burst', 'Pan Crust', 'Wheat Base'];
  const sauces = ['Marinara', 'BBQ', 'Garlic Ranch', 'Spicy Schezwan'];
  const cheeses = ['Mozzarella', 'Cheddar', 'Parmesan', 'Gouda'];
  const veggiesList = ['Jalapenos', 'Mushrooms', 'Onions', 'Olives', 'Capsicum'];

  const handleVeggieToggle = (item) => {
    setSelection(prev => ({
      ...prev,
      veggies: prev.veggies.includes(item)
        ? prev.veggies.filter(v => v !== item)
        : [...prev.veggies, item]
    }));
  };

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selection, amount: 14.99 })
      });
      const data = await res.json();
      if (data.success) {
        setOrderStatus(data.order);
      }
    } catch (err) {
      console.error('Order Error:', err);
    }
  };

  if (orderStatus) {
    return (
      <div style={{ padding: '20px', background: '#e0f2fe', borderRadius: '8px', marginTop: '20px' }}>
        <h2>🎉 Order Confirmed!</h2>
        <p><strong>Order ID:</strong> {orderStatus.id}</p>
        <p><strong>Status:</strong> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{orderStatus.status}</span></p>
        <p><strong>Details:</strong> {orderStatus.base} | {orderStatus.sauce} | {orderStatus.cheese}</p>
        <button onClick={() => { setOrderStatus(null); setStep(1); }} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Order Another Pizza
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Custom Pizza Builder (Step {step} of 4)</h2>

      {step === 1 && (
        <div>
          <h3>Select Base:</h3>
          {bases.map(b => (
            <button key={b} onClick={() => { setSelection({ ...selection, base: b }); setStep(2); }} style={btnStyle}>
              {b}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Select Sauce:</h3>
          {sauces.map(s => (
            <button key={s} onClick={() => { setSelection({ ...selection, sauce: s }); setStep(3); }} style={btnStyle}>
              {s}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Select Cheese:</h3>
          {cheeses.map(c => (
            <button key={c} onClick={() => { setSelection({ ...selection, cheese: c }); setStep(4); }} style={btnStyle}>
              {c}
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <h3>Select Vegetables:</h3>
          {veggiesList.map(v => (
            <label key={v} style={{ display: 'block', margin: '8px 0' }}>
              <input
                type="checkbox"
                checked={selection.veggies.includes(v)}
                onChange={() => handleVeggieToggle(v)}
              /> {v}
            </label>
          ))}
          <button onClick={handlePlaceOrder} style={{ ...btnStyle, background: '#16a34a', color: '#fff', marginTop: '15px' }}>
            Confirm & Place Order ($14.99)
          </button>
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  margin: '8px 0',
  borderRadius: '4px',
  border: '1px solid #0284c7',
  background: '#f0f9ff',
  cursor: 'pointer'
};

export default PizzaBuilder;
