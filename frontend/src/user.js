import { BACKEND_PORT, PFP } from './config.js';
import { fileToDataUrl, getAllThreads, showError } from './helpers.js';
import { fetchThreadDetails } from './threads.js';
import { fetchComments } from './comments.js';

const url = 'http://localhost:' + BACKEND_PORT + '/user';

function getUserDetails(userId) {
  return fetch(url + '?userId=' + userId, {
    method: 'GET',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.error) {
      showError(data.error);
    } else {
      return data;
    }
  })
  .catch((error) => {
    showError(error);
  });
}

function getUserName(userId) {
  return getUserDetails(userId)
  .then(data => data.name)
  .catch(error => {
    showError(error);
  });
}

function handleUserProfile(uId) {
  getUserDetails(uId).then(user => {
    if (uId === Number(localStorage.getItem('id'))) {
      document.getElementById('edit-profile-btn').style.display = 'block';
    } else {
      document.getElementById('edit-profile-btn').style.display = 'none';
    }
    
    const detailsBox = document.getElementById('display-profile');
    while (detailsBox.firstChild) {
      detailsBox.removeChild(detailsBox.firstChild);
    }
    const img = document.createElement('img');
    img.src = user.image || PFP;
    img.alt = 'Profile Picture';
    img.classList.add('rounded-circle');
    const name = document.createElement('p');
    name.innerText = 'Name: ' + user.name;
    const email = document.createElement('p');
    email.innerText = 'Email: ' + user.email;
    detailsBox.appendChild(img);
    detailsBox.appendChild(name);
    detailsBox.appendChild(email);
    
    const updateBtn = document.getElementById('update-role-btn');
    const roleDropdown = document.getElementById('user-role');
    const roleTitle = document.getElementById('user-role-label');
    if (localStorage.getItem('admin') === 'true') {
      roleDropdown.value = user.admin ? 'admin' : 'user';
      roleTitle.style.display = 'block';
      roleDropdown.style.display = 'block';
      updateBtn.style.display = 'block';
    } else {
      updateBtn.style.display = 'none';
      roleDropdown.style.display = 'none';
      roleTitle.style.display = 'none';
    }
    updateBtn.addEventListener('click', () => {
      handleAdminUpdate(user.id, roleDropdown.value === 'admin');
    });
    
    getAllThreads()
    .then(threads => {
      threads.forEach((threadId) => {
        fetchThreadDetails(threadId).then(thread => {
          if (thread.creatorId === Number(uId)) {
            displayUserThread(thread);
          }
        }).catch(e => {
          console.log(e);
        });
      });
    });
  });
}

function displayUserThread(thread) {
  const threadsContainer = document.createElement('div');
  threadsContainer.classList.add('user-threads');
  
  const threadBox = document.createElement('div');
  threadBox.classList.add('thread-box', 'profile-threads');
  
  const title = document.createElement('div');
  title.classList.add('thread-title');
  title.innerText = thread.title;
  
  const content = document.createElement('div');
  content.classList.add('thread-content');
  content.innerText = thread.content;
  
  const likes = document.createElement('div');
  likes.classList.add('thread-details');
  likes.innerText = 'Likes: ' + thread.likes.length;
  
  const comments = document.createElement('div');
  comments.classList.add('thread-details');
  fetchComments(thread.id).then(c => {
    comments.innerText = 'Comments: ' + c.length;
    threadBox.appendChild(title);
    threadBox.appendChild(content);
    threadBox.appendChild(likes);
    threadBox.appendChild(comments);
    threadsContainer.appendChild(threadBox);
    
    const profileSection = document.getElementById('display-profile');
    profileSection.appendChild(threadsContainer);
  })
  .catch(e => console.log(e));
}

function handleUpdateProfile() {
  const fileInput = document.getElementById('pfp-file').files[0];
  fileToDataUrl(fileInput).then(pfp => {
    const requestBody = {
      email: document.getElementById('update-email').value,
      password: document.getElementById('update-password').value,
      name: document.getElementById('update-name').value,
      image: pfp
    };
    fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .catch((error) => {
      showError(error);
    });
  })
  .catch((e) => console.log(e));
}

function handleAdminUpdate(id, turnon) {
  fetch(url + '/admin', {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: id, turnon: turnon })
  })
  .then(() => {
    if (id === Number(localStorage.getItem('id'))) localStorage.setItem('admin', turnon);
  })
  .catch((error) => {
    showError(error);
  });
}

export { getUserDetails, getUserName, handleUserProfile, handleUpdateProfile };
