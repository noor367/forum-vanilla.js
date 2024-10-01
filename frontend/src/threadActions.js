import { BACKEND_PORT } from './config.js';
import { getLatestThread, showError } from './helpers.js';
import { fetchThreadDetails, displayThread, handleLoadThreads } from './threads.js';

const url = 'http://localhost:' + BACKEND_PORT + '/thread';

function fillEditThread() {
  const threadId = localStorage.getItem('thread');
  fetchThreadDetails(threadId)
  .then(thread => {
    document.getElementById('edit-title').defaultValue = thread.title;
    document.getElementById('edit-content').defaultValue = thread.content;
    document.getElementById('edit-public').checked = thread.isPublic;
    document.getElementById('edit-lock').checked = thread.lock;
  })
  .catch(error => {
    showError(error);
  });
}

function handleEditThread() {
  const title = document.getElementById('edit-title').value;
  const content = document.getElementById('edit-content').value;
  const isPublic = document.getElementById('edit-public').checked;
  const lock = document.getElementById('edit-lock').checked;
  const threadId = localStorage.getItem('thread');
  
  fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: threadId, title: title, isPublic: isPublic, lock: lock, content: content })
  })
  .then((response) => response.json())
  .then(() => {
    displayThread(threadId);
  })
  .catch(function (error) {
    console.log(error);
  });
}

function handleDeleteThread() {
  const threadId = localStorage.getItem('thread');
  fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: threadId })
  })
  .then((response) => response.json())
  .then(() => {
    getLatestThread().then(thread => {
      localStorage.setItem('thread', thread);
    }).then(() => {
      displayThread(localStorage.getItem('thread'));
      localStorage.setItem('index', 0);
      handleLoadThreads();
    });
  })
  .catch(function (error) {
    showError(error);
  });
}

function handleLike() {
  handleLikeThread(true);
  document.getElementById('like-btn').style.display = 'none';
  document.getElementById('unlike-btn').style.display = 'block';
  displayThread(localStorage.getItem('thread'));
}

function handleUnlike() {
  handleLikeThread(false);
  document.getElementById('like-btn').style.display = 'block';
  document.getElementById('unlike-btn').style.display = 'none';
  displayThread(localStorage.getItem('thread'));
}

function handleLikeThread(turnon) {
  const threadId = localStorage.getItem('thread');
  fetch(url + '/like', {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: threadId, turnon: turnon })
  })
  .then((response) => response.json())
  .catch(function (error) {
    showError(error);
  });
}

function handleWatch() {
  handleWatchThread(true);
  document.getElementById('watch-btn').style.display = 'none';
  document.getElementById('unwatch-btn').style.display = 'block';
  displayThread(localStorage.getItem('thread'));
}

function handleUnwatch() {
  handleWatchThread(false);
  document.getElementById('watch-btn').style.display = 'block';
  document.getElementById('unwatch-btn').style.display = 'none';
  displayThread(localStorage.getItem('thread'));
}

function handleWatchThread(turnon) {
  const threadId = localStorage.getItem('thread');
  fetch(url + '/watch', {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: threadId, turnon: turnon })
  })
  .then((response) => response.json())
  .catch(function (error) {
    console.log(error);
  });
}

export { handleEditThread, fillEditThread, handleDeleteThread, handleLike, handleUnlike, handleWatch, handleUnwatch };
