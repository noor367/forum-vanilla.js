import { BACKEND_PORT } from './config.js';
import { handleDashboard } from './dashboard.js';
import { showError } from './helpers.js';

const PATH = '/auth/register';

export function handleRegister() {
  const email = document.getElementById('register-email').value;
  const name = document.getElementById('register-name').value;
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('confirm-password').value;
  if (password !== confirm) {
    showError('Passwords do not match!');
  } else {
    fetch('http://localhost:' + BACKEND_PORT + PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password, name: name })
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.error) {
      showError('Invalid Input');
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('id', data.userId);
      handleDashboard();
      return true;
    }
  })
  .catch(function (error) {
    showError(error);
  });
}
return false;
}
