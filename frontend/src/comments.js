import { BACKEND_PORT, PFP } from './config.js';
import { isThreadLocked, showError } from './helpers.js';
import { getUserDetails, handleUserProfile } from './user.js';

const url = 'http://localhost:' + BACKEND_PORT + '/comment';
const uId = localStorage.getItem('id');
let cLength = 0;

// Function to fetch comments for a specific thread
function fetchComments(threadId) {
  return fetch(url + 's?threadId=' + threadId, {
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

// Function to display comments on the page
function displayComments(comments) {
  const commentsContainer = document.getElementById('comments-container');
  commentsContainer.innerText = '';
  
  // Reverse the order of comments to display the latest ones first
  const reversedComments = comments.slice().reverse();
  const rootComments = reversedComments.filter(comment => comment.parentCommentId === null);
  
  rootComments.forEach(comment => {
    createComment(comment, reversedComments).then((commentBox) => {
      commentsContainer.appendChild(commentBox);
    });
  });
}

/// Function to create a comment element
function createComment(comment, commentsList) {
  const commentBox = document.createElement('div');
  commentBox.classList.add('comment');
  commentBox.id = comment.id;
  
  // Fetch user details and add profile picture
  return getUserDetails(comment.creatorId)
  .then(userDetails => {
    // Add commenter tag (name and profile picture)
    const pfp = document.createElement('img');
    pfp.src = userDetails.image || PFP;
    pfp.alt = 'Profile Picture';
    pfp.classList.add('pfp');
    const author = document.createElement('span');
    author.appendChild(pfp);
    const name = document.createElement('i');
    name.innerText = userDetails.name;
    author.appendChild(name);
    author.classList.add('user-link');
    author.setAttribute('data-toggle', 'modal');
    author.dataset.target = '#profile-modal';
    author.dataset.userId = comment.creatorId;
    author.addEventListener('click', () => handleUserProfile(comment.creatorId));
    // Append author element to comment details
    // Add comment text
    commentBox.appendChild(author);
    
    // Add comment text
    const textElement = document.createElement('p');
    textElement.innerText = comment.content;
    commentBox.appendChild(textElement);
    
    // Add number of likes
    const likesElement = document.createElement('p');
    likesElement.innerText = `Likes: ${comment.likes.length}`;
    likesElement.classList.add('thread-details');
    commentBox.appendChild(likesElement);
    
    // Add time since commented
    const timeElement = document.createElement('p');
    timeElement.innerText = formatTime(comment.createdAt);
    timeElement.classList.add('thread-details');
    commentBox.appendChild(timeElement);
    
    // Add "Reply" button only if thread is locked
    isThreadLocked(comment.threadId)
    .then(lock => {
      if (!lock) {
        const replyButton = document.createElement('button');
        replyButton.classList.add('btn', 'btn-link', 'reply-btn');
        replyButton.innerText = 'Reply';
        replyButton.id = comment.id + '-reply';
        replyButton.setAttribute('data-toggle', 'modal');
        replyButton.dataset.target = '#reply-modal';
        replyButton.addEventListener('click', () => showReplyModal(comment));
        commentBox.appendChild(replyButton);
      }
    }).then(() => {
      // Doing within promise so that the reply is after the reply-btn
      const firstReply = commentsList.filter(c => c.parentCommentId === comment.id);
      if (firstReply.length > 0) {
        const firstReplyBox = document.createElement('div');
        firstReplyBox.classList.add('reply-container');
        firstReply.forEach(reply => {
          createComment(reply, commentsList).then(r => {
            firstReplyBox.appendChild(r);
          });
        });
        commentBox.appendChild(firstReplyBox);
      }
    });
    
    // Add "Like" button
    const likeButton = document.createElement('button');
    likeButton.classList.add('btn', 'btn-link', 'like-btn');
    likeButton.innerText = comment.likes.includes(Number(uId)) ? 'Dislike' : 'Like';
    likeButton.addEventListener('click', () => handleLike(comment));
    commentBox.appendChild(likeButton);
    
    // Only creator of the comment or admin can edit
    if (userDetails.id === comment.creatorId || localStorage.getItem('admin')) {
      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'btn-link', 'edit-cmt-btn');
      editButton.innerText = 'Edit';
      editButton.dataset.target = '#edit-cmt-modal';
      editButton.setAttribute('data-toggle', 'modal');
      editButton.addEventListener('click', () => showEditModal(comment));
      commentBox.appendChild(editButton);
    }
    
    return commentBox; // Resolve with the comment element after all elements are added
  })
  .catch(error => {
    console.error(error);
    // Handle error fetching user details
    return commentBox; // Resolve with the comment element even if there's an error fetching user details
  });
}

// Function to format time since commented
function formatTime(createdAt) {
  const currentTime = new Date();
  const timeDifference = Math.abs(currentTime - new Date(createdAt));
  const minutes = Math.floor(timeDifference / 60000); // Number of minutes
  
  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute(s) ago`;
  } else if (minutes < 1440) {
    return `${Math.floor(minutes / 60)} hour(s) ago`;
  } else if (minutes < 10080) {
    return `${Math.floor(minutes / 1440)} day(s) ago`;
  } else {
    return `${Math.floor(minutes / 10080)} week(s) ago`;
  }
}

// Function to show edit modal
function showEditModal(comment) {
  const modal = document.getElementById('edit-cmt-modal');
  modal.style.display = 'block';
  const input = document.getElementById('edit-cmt');
  input.value = comment.content;
  const editButton = document.getElementById('edit-cmt-submit');
  editButton.addEventListener('click', () => {
    const content = input.value;
    handleEditComment(comment, content);
  });
}

// Function to show reply modal
function showReplyModal(parentComment) {
  const modal = document.getElementById('reply-modal');
  modal.style.display = 'block';
  const info = document.getElementById('replying-to');
  info.innerText = parentComment.content;
  const reply = document.getElementById('reply-content');
  const commentButton = document.getElementById('reply-submit');
  commentButton.addEventListener('click', () => {
    handleCreateComment(parentComment.threadId, reply.value, parentComment.id);
  });
}

// Function to add a comment to the thread
function handleCreateComment(threadId, content, parent) {
  if (content === '') {
    showError('Comment cannot be empty');
    return;
  }
  const requestBody = {
    commentId: cLength,
    content: content,
    threadId: threadId,
    parentCommentId: parent
  };
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(() => {
    handleDisplayComments(threadId);
    cLength++;
  })
  .catch(error => {
    console.error('Error adding comment:', error);
  });
}

function handleDisplayComments(threadId) {
  document.getElementById('comments-container').innerText = '';
  fetchComments(threadId)
  .then(comments => {
    cLength = comments.length;
    displayComments(comments);
  })
  .catch(error => {
    console.error(error);
    showError('Failed to fetch comments.');
  });
}

function handleEditComment(comment, content) {
  fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: comment.id, content: content })
  })
  .then(() => {
    handleDisplayComments(comment.threadId);
  })
  .catch(error => {
    console.error('Error adding comment:', error);
  });
}

// Function to handle liking/unliking a comment
function handleLike(comment) {
  // Check if the comment is already liked
  const isLiked = comment.likes.includes(uId);
  
  fetch(url + '/like', {
    method: 'PUT',
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: comment.id, turnon: !isLiked })
  })
  .then(response => {
    handleDisplayComments(comment.threadId);
  })
  .catch(error => {
    console.error('Error updating like status:', error);
  });
}

export { handleDisplayComments, handleCreateComment, fetchComments };
