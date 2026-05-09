import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CheckoutPage from './components/CheckoutPage.jsx';
import PaymentSuccess from './components/PaymentSuccess.jsx';
import PaymentFailure from './components/PaymentFailure.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Background Orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="24" height="24" rx="6" stroke="url(#logo-grad)" strokeWidth="2.5"/>
                  <path d="M9 14h10M14 9v10" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="logo-grad" x1="2" y1="2" x2="26" y2="26">
                      <stop stopColor="#6c5ce7"/>
                      <stop offset="1" stopColor="#a29bfe"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">PayFlow</span>
            </div>
            <div className="header-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure Checkout
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<CheckoutPage />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/failure" element={<PaymentFailure />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>Secured by <strong>Razorpay</strong> • 256-bit SSL Encryption</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
