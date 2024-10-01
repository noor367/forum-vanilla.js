import { BACKEND_PORT } from './config.js';
import { showError } from './helpers.js';
import { handleDashboard } from './dashboard.js';

const url = 'http://localhost:' + BACKEND_PORT + '/auth/login';

export function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email.includes('@') || password === '') { return; }
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password })
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.error) {
      showError('invalid input');
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('id', data.userId);
      handleDashboard();
      return true;
    }
  })
  .catch((error) => {
    showError(error);
  });
  return false;
}

export function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('id');
  localStorage.removeItem('thread');
  localStorage.removeItem('index');
  localStorage.removeItem('admin')
  document.getElementById('auth').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('nav-bar').style.display = 'none';
  document.getElementById('create-thread').style.display = 'none';
  document.getElementById('toggle-btn').style.display = 'none';
  return false;
}
