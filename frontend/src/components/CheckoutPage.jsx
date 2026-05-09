import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, verifyPayment } from '../services/paymentService.js';
import './CheckoutPage.css';

const PRODUCT = {
  name: 'SonicPro X1 — Wireless ANC Headphones',
  description: 'Premium noise-cancelling headphones with 40hr battery, spatial audio, and ultra-comfort memory foam cushions.',
  price: 2999,
  originalPrice: 5999,
  image: '/product.png',
  features: ['Active Noise Cancellation', '40hr Battery Life', 'Spatial Audio', 'Bluetooth 5.3'],
};

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Load Razorpay script
      console.log('Loading Razorpay script...');
      await loadRazorpayScript();
      console.log('Razorpay script loaded successfully.');

      // 2. Create order on backend
      console.log('Creating order with backend...', {
        amount: PRODUCT.price,
        customerName: customerName.trim()
      });
      const orderData = await createOrder({
        customerName: customerName.trim(),
        amount: PRODUCT.price,
      });
      
      console.log('Backend response for order creation:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const { orderId, amount, currency, razorpayKeyId } = orderData.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: currency,
        name: 'PayFlow Store',
        description: PRODUCT.name,
        order_id: orderId,
        // Explicitly enabling UPI and other payment methods as requested
        method: {
           upi: true,
           card: true,
           netbanking: true,
           wallet: true
        },
        prefill: {
          name: customerName.trim(),
        },
        theme: {
          color: '#6c5ce7',
        },
        handler: async function (response) {
          console.log('Payment success handler triggered. Response:', response);
          // 4. Verify payment on backend
          try {
            console.log('Sending proof to backend for signature verification...');
            const verifyData = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            console.log('Backend verification response:', verifyData);

            if (verifyData.success) {
              navigate('/success', {
                state: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount: PRODUCT.price,
                  customerName: customerName.trim(),
                },
              });
            } else {
              navigate('/failure', {
                state: { message: verifyData.message || 'Payment verification failed' },
              });
            }
          } catch (verifyError) {
            console.error('Error during backend verification:', verifyError);
            navigate('/failure', {
              state: { message: 'Payment verification failed. Please contact support.' },
            });
          }
        },
        modal: {
          ondismiss: function () {
            console.warn('Razorpay modal closed before completion.');
            setLoading(false);
          },
        },
      };

      console.log('Initializing Razorpay Checkout with options:', options);
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed event from Razorpay:', response);
        navigate('/failure', {
          state: {
            message: response.error?.description || 'Payment failed',
            code: response.error?.code,
          },
        });
      });

      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const discount = Math.round(((PRODUCT.originalPrice - PRODUCT.price) / PRODUCT.originalPrice) * 100);

  return (
    <div className="checkout-container animate-fade-in">
      {/* Product Section */}
      <div className="checkout-product">
        <div className="product-image-wrapper">
          <div className="product-badge">{discount}% OFF</div>
          <img src={PRODUCT.image} alt={PRODUCT.name} className="product-image" />
          <div className="product-image-glow" />
        </div>

        <div className="product-features">
          {PRODUCT.features.map((feature, i) => (
            <div key={i} className="feature-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Form Section */}
      <div className="checkout-form-section">
        <div className="checkout-card">
          <div className="card-header">
            <h1 className="product-name">{PRODUCT.name}</h1>
            <p className="product-description">{PRODUCT.description}</p>
          </div>

          <div className="price-section">
            <div className="price-row">
              <span className="current-price">₹{PRODUCT.price.toLocaleString('en-IN')}</span>
              <span className="original-price">₹{PRODUCT.originalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="price-savings">
              You save ₹{(PRODUCT.originalPrice - PRODUCT.price).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="divider" />

          <div className="form-group">
            <label htmlFor="customer-name" className="form-label">Full Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="customer-name"
                type="text"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); setError(''); }}
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <button
            id="pay-now-btn"
            className={`pay-button ${loading ? 'loading' : ''}`}
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Processing...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pay ₹{PRODUCT.price.toLocaleString('en-IN')}
              </>
            )}
          </button>

          <div className="trust-badges">
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SSL Secured
            </div>
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Instant Delivery
            </div>
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
