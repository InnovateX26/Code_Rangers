import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(localStorage.getItem('biometric_enabled') === 'true');

  const handleBiometricLogin = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate OS-level FaceID/Fingerprint prompt
    setTimeout(() => {
      const cachedToken = localStorage.getItem('cached_token');
      const cachedUserStr = localStorage.getItem('cached_user');
      if (cachedToken && cachedUserStr) {
        onLogin(JSON.parse(cachedUserStr), cachedToken);
      } else {
        setError('Biometric data expired. Please use phone login.');
        setHasBiometrics(false);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('cached_user', JSON.stringify(data.user));
        localStorage.setItem('cached_token', data.token);
        // Automatically enable biometrics for demo
        localStorage.setItem('biometric_enabled', 'true');
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split">
      <div className="login-branding">
         <div className="branding-content">
            <div className="logo big-logo">💳</div>
            <h1>The ultimate <br/><span className="gradient-text">finance dashboard</span></h1>
            <p className="branding-sub">
               Track your Google Pay, PhonePe, Paytm, and Amazon Pay spending in one unified powerhouse powered by AI.
            </p>
            
            <div className="feature-list">
               <div className="feature-item"><span>✅</span> Real-time Sync across apps</div>
               <div className="feature-item"><span>🤖</span> AI-powered Fraud Detection</div>
               <div className="feature-item"><span>🍕</span> Automatic Expense Categorization</div>
            </div>
         </div>
      </div>
      
      <div className="login-form-container">
         <div className="login-form-box glass-card">
           <div className="login-header">
             <h2>{step === 1 ? 'Sign in to PayFlow' : 'Verify Identity'}</h2>
             <p>{step === 1 ? 'Get started with just your phone number' : `Enter the code sent to +91 ${phone}`}</p>
           </div>

           {error && <div className="login-error">{error}</div>}

           {hasBiometrics ? (
             <div className="login-form center-align" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', margin: '20px 0', animation: 'pulse 2s infinite' }}>{navigator.userAgent.includes('Mac') ? '🧑‍💻' : '👆🏻'}</div>
                <h3>Unlock with Biometrics</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Use {navigator.userAgent.includes('Mac') ? 'Touch ID' : 'Fingerprint'} or Face Unlock to securely access PayFlow.
                </p>
                <button onClick={handleBiometricLogin} className="btn-primary" disabled={isLoading}>
                   {isLoading ? 'Scanning...' : 'Authenticating...'}
                </button>
                <p className="login-hint" style={{ marginTop: '16px', cursor: 'pointer', color: 'var(--accent-blue)' }} onClick={() => setHasBiometrics(false)}>
                  Use Phone Number Instead
                </p>
             </div>
           ) : step === 1 ? (
             <form onSubmit={handleSendOtp} className="login-form">
               <div className="input-group">
                 <label>Mobile Number</label>
                 <div className="phone-input">
                   <span className="country-code">+91</span>
                   <input 
                     type="tel" 
                     placeholder="Enter 10-digit number"
                     value={phone}
                     onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                     required
                     autoFocus
                   />
                 </div>
               </div>
               
               <div className="input-group">
                 <label>Your Name (Optional)</label>
                 <input 
                   type="text" 
                   placeholder="How should we call you?"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="text-input"
                 />
               </div>

               <button type="submit" className="btn-primary" disabled={isLoading || phone.length !== 10}>
                  {isLoading ? 'Sending OTP...' : 'Continue'}
               </button>
               <p className="login-hint">Demo mode: Any 10 digit number works.</p>
             </form>
           ) : (
             <form onSubmit={handleVerifyOtp} className="login-form">
               <div className="input-group mb-20">
                 <label style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>Enter OTP Code</span>
                    <span className="edit-phone" onClick={() => setStep(1)}>Wrong number?</span>
                 </label>
                 <input 
                   type="text" 
                   placeholder="Enter 123456"
                   value={otp}
                   onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                   required
                   autoFocus
                   className="text-input otp-input"
                 />
               </div>

               <button type="submit" className="btn-primary" disabled={isLoading || otp.length < 6}>
                 {isLoading ? 'Verifying...' : 'Secure Login'}
               </button>
               <p className="login-hint">Demo OTP: <strong>123456</strong></p>
             </form>
           )}
         </div>
      </div>
    </div>
  );
}

export default LoginPage;
