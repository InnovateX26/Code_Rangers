// ─── Mobile OTP Authentication System ───
// Demo OTP authentication with session management

const crypto = require('crypto');

// In-memory stores (production would use Redis/DB)
const otpStore = new Map();     // phone -> { otp, expiresAt, attempts }
const sessionStore = new Map(); // token -> { phone, name, createdAt, expiresAt }
const userStore = new Map();    // phone -> { name, phone, createdAt, linkedApps }

// Demo OTP is always 123456 for testing
const DEMO_OTP = '123456';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_OTP_ATTEMPTS = 5;

function generateOTP() {
  // In production, this would be random. For demo, use fixed OTP.
  return DEMO_OTP;
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send OTP to a mobile number
 * In production, this would integrate with SMS providers like Twilio/MSG91
 */
function sendOTP(phone) {
  // Validate phone format (Indian 10-digit)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number' };
  }

  const otp = generateOTP();
  
  otpStore.set(cleanPhone, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0
  });

  console.log(`📱 OTP sent to +91${cleanPhone}: ${otp} (demo mode)`);

  return { 
    success: true, 
    message: `OTP sent to +91${cleanPhone}`,
    hint: 'Demo OTP: 123456',
    expiresIn: OTP_EXPIRY_MS / 1000
  };
}

/**
 * Verify OTP and create a session
 */
function verifyOTP(phone, otp, name) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const stored = otpStore.get(cleanPhone);

  if (!stored) {
    return { success: false, error: 'No OTP was sent to this number. Please request a new OTP.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(cleanPhone);
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  stored.attempts++;
  if (stored.attempts > MAX_OTP_ATTEMPTS) {
    otpStore.delete(cleanPhone);
    return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
  }

  if (stored.otp !== otp) {
    return { success: false, error: `Invalid OTP. ${MAX_OTP_ATTEMPTS - stored.attempts} attempts remaining.` };
  }

  // OTP verified — create session
  otpStore.delete(cleanPhone);
  const token = generateSessionToken();
  
  // Create or update user
  if (!userStore.has(cleanPhone)) {
    userStore.set(cleanPhone, {
      name: name || 'PayFlow User',
      phone: cleanPhone,
      createdAt: new Date().toISOString(),
      linkedApps: ['gpay', 'phonepe', 'paytm', 'bhim', 'amazonpay']
    });
  } else if (name) {
    const user = userStore.get(cleanPhone);
    user.name = name;
  }

  const user = userStore.get(cleanPhone);

  sessionStore.set(token, {
    phone: cleanPhone,
    name: user.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY_MS
  });

  console.log(`✅ User authenticated: ${user.name} (+91${cleanPhone})`);

  return {
    success: true,
    token,
    user: {
      name: user.name,
      phone: `+91${cleanPhone}`,
      linkedApps: user.linkedApps
    }
  };
}

/**
 * Validate a session token
 */
function validateSession(token) {
  if (!token) return null;
  
  const session = sessionStore.get(token);
  if (!session) return null;
  
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return null;
  }

  const user = userStore.get(session.phone);
  return {
    phone: session.phone,
    name: session.name,
    user
  };
}

/**
 * Logout — destroy session
 */
function logout(token) {
  sessionStore.delete(token);
  return { success: true };
}

/**
 * Get user profile
 */
function getProfile(token) {
  const session = validateSession(token);
  if (!session) return null;
  return session.user;
}

/**
 * Link/unlink UPI apps
 */
function updateLinkedApps(token, apps) {
  const session = validateSession(token);
  if (!session) return null;
  
  const user = userStore.get(session.phone);
  user.linkedApps = apps;
  return user;
}

module.exports = { sendOTP, verifyOTP, validateSession, logout, getProfile, updateLinkedApps };
