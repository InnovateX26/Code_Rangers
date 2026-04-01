// ===== AUTH.JS =====

function showStep(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function sendOTP() {
  const phone = document.getElementById('phone-input').value.trim();
  if (!/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }
  localStorage.setItem('pf_phone', phone);
  document.getElementById('otp-phone-display').textContent = '+91 ' + phone;
  showStep('step-otp');

  // Auto-focus first OTP box
  setTimeout(() => document.querySelector('.otp-box').focus(), 100);

  // OTP box auto-advance
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
    });
  });
}

function verifyOTP() {
  const boxes = document.querySelectorAll('.otp-box');
  const otp = Array.from(boxes).map(b => b.value).join('');
  if (otp === '1234') {
    showStep('step-permission');
  } else {
    boxes.forEach(b => { b.style.borderColor = '#ff4d6d'; });
    setTimeout(() => boxes.forEach(b => { b.style.borderColor = ''; }), 1000);
    alert('Wrong OTP. Try 1234 for demo.');
  }
}

function backToPhone() {
  document.querySelectorAll('.otp-box').forEach(b => b.value = '');
  showStep('step-phone');
}

function grantPermission() {
  localStorage.setItem('pf_permission', 'granted');
  startLoading();
}

function skipPermission() {
  localStorage.setItem('pf_permission', 'skipped');
  startLoading();
}

function startLoading() {
  showStep('step-loading');
  const messages = [
    'Reading your SMS transactions…',
    'Decoding UPI references…',
    'Categorising your spends…',
    'Building your dashboard…',
    'Almost done!'
  ];
  const fill = document.getElementById('progress-fill');
  const loadText = document.getElementById('loading-text');
  let step = 0;
  const interval = setInterval(() => {
    step++;
    const pct = (step / messages.length) * 100;
    fill.style.width = pct + '%';
    loadText.textContent = messages[step - 1] || messages[messages.length - 1];
    if (step >= messages.length) {
      clearInterval(interval);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
    }
  }, 600);
}

// Check if already logged in
if (localStorage.getItem('pf_phone')) {
  // Already logged in — skip to dashboard
  // (comment this out if you want to always show login for demo)
  // window.location.href = 'dashboard.html';
}
