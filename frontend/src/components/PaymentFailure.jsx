import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentFailure.css';

export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();

  const { message, code } = location.state || {};

  return (
    <div className="failure-container animate-fade-in-scale">
      <div className="failure-card">
        {/* Error Icon */}
        <div className="failure-icon-wrapper">
          <div className="failure-icon">
            <svg viewBox="0 0 52 52" className="error-svg">
              <circle className="error-circle" cx="26" cy="26" r="24" fill="none" />
              <line className="error-line-1" x1="16" y1="16" x2="36" y2="36" />
              <line className="error-line-2" x1="36" y1="16" x2="16" y2="36" />
            </svg>
          </div>
        </div>

        <h1 className="failure-title">Payment Failed</h1>
        <p className="failure-subtitle">
          {message || 'Something went wrong while processing your payment. No money has been deducted.'}
        </p>

        {code && (
          <div className="error-code-badge">
            Error Code: <span>{code}</span>
          </div>
        )}

        <div className="failure-info">
          <div className="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>If any amount was deducted, it will be refunded within 5-7 business days.</span>
          </div>
        </div>

        <div className="failure-actions">
          <button className="retry-button" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Try Again
          </button>

          <button className="home-button" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );
}
