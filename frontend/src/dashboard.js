import { isAdmin } from './helpers.js';
import { handleLoadThreads } from './threads.js';

export function handleDashboard() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('nav-bar').style.display = 'block';
  document.getElementById('toggle-btn').style.display = 'block';
  isAdmin(localStorage.getItem('id'))
    .then(admin => {
      localStorage.setItem('admin', admin);
      localStorage.setItem('index', 0);
      handleLoadThreads();
    })
    .catch((e) => console.log(e));
}
