// A helper you may want to use when uploading new images to the server.
import { handleLogin, handleLogout } from './login.js';
import { handleRegister } from './register.js';
import { hideError } from './helpers.js';
import { handleDashboard } from './dashboard.js';
import { createThread, handleLoadThreads } from './threads.js';
import { fillEditThread, handleEditThread, handleDeleteThread, handleLike, handleUnlike, handleWatch, handleUnwatch } from './threadActions.js';
import { handleCreateComment } from './comments.js';
import { handleUpdateProfile, handleUserProfile } from './user.js';

const token = localStorage.getItem('token');
let loggedIn = !!token;
// Variables
const loginForm = document.getElementById('login-button');
const registerForm = document.getElementById('register-button');
const logout = document.getElementById('logout-btn');
const closeErrorBtn = document.getElementById('close-error-btn');
const like = document.getElementById('like-btn');
const unlike = document.getElementById('unlike-btn');
const watch = document.getElementById('watch-btn');
const unwatch = document.getElementById('unwatch-btn');
const replyModal = document.getElementById('reply-modal');
const hideReply = () => {
  replyModal.style.display = 'none';
};
const commentBtn = document.getElementById('submit-comment');

// Show Dashboard
if (loggedIn) {
  handleDashboard();
} else {
  document.getElementById('auth').style.display = 'block';
}

// Event listener for the "Load More" button
document.getElementById('load-more-btn').addEventListener('click', handleLoadThreads);

// Authentication
loginForm.addEventListener('click', function (e) {
  e.preventDefault();
  loggedIn = handleLogin();
});
registerForm.addEventListener('click', function (e) {
  e.preventDefault();
  loggedIn = handleRegister();
});
logout.addEventListener('click', function (e) {
  loggedIn = handleLogout();
});

// Close error button event listener
closeErrorBtn.addEventListener('click', hideError);

// Create thread button event listener
document.getElementById('create-btn').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('thread-cols').style.display = 'none';
  document.getElementById('create-thread').style.display = 'block';
});

// Create thread submit form
document.getElementById('create-submit').addEventListener('click', function (e) {
  e.preventDefault();
  createThread();
  document.getElementById('thread-cols').style.display = 'block';
});
document.getElementById('exit-create-thread').addEventListener('click', () => {
  document.getElementById('create-thread').style.display = 'none';
  document.getElementById('thread-cols').style.display = 'block';
});

// Edit Thread
document.getElementById('edit-thread-btn').addEventListener('click', fillEditThread);
document.getElementById('edit-thread-submit').addEventListener('click', handleEditThread);

// Delete Thread
document.getElementById('delete-thread-btn').addEventListener('click', handleDeleteThread);

// Like Thread
like.addEventListener('click', handleLike);
unlike.addEventListener('click', handleUnlike);

// Watch thread
watch.addEventListener('click', handleWatch);
unwatch.addEventListener('click', handleUnwatch);

// Close modals
document.getElementById('reply-x').addEventListener('click', hideReply);
document.getElementById('reply-close').addEventListener('click', hideReply);

// New Comment
commentBtn.addEventListener('click', () => {
  const comment = document.getElementById('new-comment').value;
  const threadId = localStorage.getItem('thread');
  handleCreateComment(threadId, comment, null);
});

// View own profile
document.getElementById('profile-btn').addEventListener('click', () => {
  const uId = localStorage.getItem('id');
  document.getElementById('edit-profile-btn').style.display = 'block';
  handleUserProfile(uId);
});

// Edit Profile
document.getElementById('profile-submit').addEventListener('click', handleUpdateProfile);

// Extra toggle to help with Mobile Responsiveness
const toggleBtn = document.getElementById('toggle-btn');
toggleBtn.addEventListener('click', () => {
  const threadsContainer = document.getElementById('threads-container');
  if (threadsContainer.classList.contains('hide')) {
    threadsContainer.classList.remove('hide');
  } else {
    threadsContainer.classList.add('hide');
  }
});
