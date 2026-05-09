import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  const { orderId, paymentId, amount, customerName } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="success-container">
      {/* Confetti particles */}
      <div className="confetti-container" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              '--x': `${Math.random() * 100}vw`,
              '--delay': `${Math.random() * 2}s`,
              '--duration': `${2 + Math.random() * 3}s`,
              '--color': ['#6c5ce7', '#a29bfe', '#00b894', '#55efc4', '#fdcb6e', '#fab1a0'][i % 6],
              '--rotation': `${Math.random() * 360}deg`,
            }}
          />
        ))}
      </div>

      <div className={`success-card ${showContent ? 'visible' : ''}`}>
        {/* Animated Checkmark */}
        <div className="success-icon-wrapper">
          <div className="success-ripple" />
          <div className="success-ripple ripple-2" />
          <div className="success-icon">
            <svg viewBox="0 0 52 52" className="checkmark-svg">
              <circle className="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">
          Thank you, <strong>{customerName}</strong>! Your order has been confirmed.
        </p>

        {/* Transaction Details */}
        <div className="transaction-details">
          <div className="detail-row">
            <span className="detail-label">Order ID</span>
            <span className="detail-value mono">{orderId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment ID</span>
            <span className="detail-value mono">{paymentId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount Paid</span>
            <span className="detail-value amount">₹{amount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value status-badge">
              <span className="status-dot" />
              Confirmed
            </span>
          </div>
        </div>

        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Store
        </button>
      </div>
    </div>
  );
}
