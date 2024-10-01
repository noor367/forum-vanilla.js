import { handleDisplayComments } from './comments.js';
import { BACKEND_PORT } from './config.js';
import { dateFormatter, showError } from './helpers.js';
import { getUserName, handleUserProfile } from './user.js';

const url = 'http://localhost:' + BACKEND_PORT + '/thread';
const threadsContainer = document.getElementById('threads-container');

function createThread() {
  const title = document.getElementById('form-title').value;
  const content = document.getElementById('form-content').value;
  const isPublic = document.getElementById('form-public').checked;
  
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: title, isPublic: isPublic, content: content })
  })
  .then((response) => response.json())
  .then((data) => {
    displayThread(data.id);
    localStorage.setItem('index', 0);
    handleLoadThreads();
    document.getElementById('create-thread').style.display = 'none';
  })
  .catch(function (error) {
    showError(error);
  });
}

// Function to fetch threads from the API
function fetchThreads(start) {
  return fetch(url + 's?start=' + start, {
    method: 'GET',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    return response.json();
  })
  .catch(error => {
    showError(error);
  });
}

// Function to fetch thread details from the API
function fetchThreadDetails(threadId) {
  return fetch(url + '?id=' + threadId, {
    method: 'GET',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    return response.json();
  })
  .catch(error => {
    console.log(error);
  });
}

function displayThread(threadId) {
  const displayThreadDiv = document.getElementById('display-thread');
  if (threadId === 'none') {
    displayThreadDiv.innerText = '';
    return;
  }
  fetchThreadDetails(threadId)
  .then(thread => {
    displayThreadDiv.innerText = '';
    const title = document.createElement('h2');
    title.innerText = thread.title;
    
    const content = document.createElement('p');
    content.innerText = `Content: ${thread.content}`;
    
    const info = document.createElement('p');
    
    getUserName(thread.creatorId).then(name => {
      const author = document.createElement('span');
      author.innerText = name;
      author.classList.add('user-link');
      author.classList.add('user-link');
      author.setAttribute('data-toggle', 'modal');
      author.dataset.target = '#profile-modal';
      author.dataset.userId = thread.creatorId; // Store user ID as a data attribute
      author.addEventListener('click', () => handleUserProfile(thread.creatorId));
      // Append author element to thread details
      info.appendChild(author);
    });
    
    const numLikes = document.createElement('p');
    numLikes.innerText = 'Likes: ' + thread.likes.length;
    numLikes.classList.add('thread-details');
    const postedAt = document.createElement('p');
    const datePosted = dateFormatter(new Date(thread.createdAt));
    postedAt.innerText = 'Posted on ' + datePosted;
    postedAt.classList.add('thread-details');
    info.appendChild(numLikes);
    info.appendChild(postedAt);
    
    const uId = Number(localStorage.getItem('id'));
    const liked = thread.likes.includes(uId);
    const watching = thread.watchees.includes(uId);
    const editBtn = document.getElementById('edit-thread-btn');
    const deleteBtn = document.getElementById('delete-thread-btn');
    
    // Can Edit or Delete
    const admin = localStorage.getItem('admin');
    if (uId === thread.creatorId || admin === 'true') {
      deleteBtn.style.display = 'block';
      if (!thread.lock) {
        editBtn.style.display = 'block';
      } else {
        editBtn.style.display = 'none';
      }
    } else {
      deleteBtn.style.display = 'none';
      editBtn.style.display = 'none';
    }
    
    handleThreadInteractions(thread.lock, liked, watching);
    
    displayThreadDiv.appendChild(title);
    displayThreadDiv.appendChild(content);
    displayThreadDiv.appendChild(info);
    localStorage.setItem('thread', threadId);
    
    handleDisplayComments(threadId);
  })
  .catch(error => {
    showError(error);
  });
}

function handleThreadInteractions(locked, liked, watching) {
  const like = document.getElementById('like-btn');
  const unlike = document.getElementById('unlike-btn');
  const watch = document.getElementById('watch-btn');
  const unwatch = document.getElementById('unwatch-btn');
  const cmtTitle = document.getElementById('comments-title');
  const cmt = document.getElementById('comments-action');
  const lockIcon = document.getElementById('lock-icon');
  // Can Like or Comment
  if (!locked) {
    if (liked) {
      like.style.display = 'none';
      unlike.style.display = 'block';
    } else {
      like.style.display = 'block';
      unlike.style.display = 'none';
    }
    if (watching) {
      watch.style.display = 'none';
      unwatch.style.display = 'block';
    } else {
      watch.style.display = 'block';
      unwatch.style.display = 'none';
    }
    // Display comments
    cmtTitle.style.display = 'block';
    cmt.style.display = 'block';
    lockIcon.style.display = 'none';
  } else {
    cmtTitle.style.display = 'none';
    cmt.style.display = 'none';
    like.style.display = 'none';
    unlike.style.display = 'none';
    watch.style.display = 'none';
    unwatch.style.display = 'none';
    lockIcon.style.display = 'block';
  }
}

function handleLoadThreads() {
  let start = Number(localStorage.getItem('index'));
  if (start === 0 || (showLoadMore(start))) {
    threadsContainer.innerText = '';
  }
  fetchThreads(start)
  .then(threadIds => {
    const threadInfo = threadIds.map(id => fetchThreadDetails(id));
    Promise.all(threadInfo)
    .then(threads => {
      console.log(threads);
      threads.forEach(thread => {
        const threadBox = document.createElement('div');
        threadBox.classList.add('thread-box');
        
        // Populate thread box with thread details
        const title = document.createElement('div');
        title.classList.add('thread-title');
        title.innerText = thread.title;
        
        const info = document.createElement('div');
        const datePosted = dateFormatter(new Date(thread.createdAt));
        const likes = thread.likes.length;
        info.classList.add('thread-info');
        getUserName(thread.creatorId).then(author => {
          info.innerText = `Posted by ${author} on ${datePosted}. Likes: ${likes}`;
        }).catch(e => {
          showError(e);
        });
        
        threadBox.appendChild(title);
        threadBox.appendChild(info);
        threadsContainer.append(threadBox);
        
        // Add event listener to display thread details when clicked
        threadBox.addEventListener('click', function() {
          displayThread(thread.id);
        });
      });
      start += threadIds.length;
      localStorage.setItem('index', start);
      showLoadMore(start);
    });
  });
}

function showLoadMore(nextStart) {
  const loadBtn = document.getElementById('load-more-btn');
  let loadMore = true;
  fetchThreads(nextStart).then(threadIds => {
    loadMore = threadIds.length > 0;
    if (loadMore) {
      loadBtn.style.display = 'block';
      return true;
    } else {
      loadBtn.style.display = 'none';
      return false;
    }
  }).catch(e => console.log(e));
}

export { createThread, fetchThreads, fetchThreadDetails, displayThread, handleLoadThreads };
