import { fetchThreadDetails, fetchThreads } from './threads.js';
import { getUserDetails } from './user.js';

/**
* Given a js file object representing a jpg or png image, such as one taken
* from a html file input element, return a promise which resolves to the file
* data as a data url.
* More info:
*   https://developer.mozilla.org/en-US/docs/Web/API/File
*   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
*   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
*
* Example Usage:
*   const file = document.querySelector('input[type="file"]').files[0];
*   console.log(fileToDataUrl(file));
* @param {File} file The file to be read.
* @return {Promise<string>} Promise which resolves to the file as a data url.
*/
function fileToDataUrl(file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

// Function to show the error popup with a message
function showError(message) {
  const errorPopup = document.getElementById('error-popup');
  const errorMessage = document.getElementById('error-message');

  // Set the error message
  errorMessage.innerText = message;

  // Show the error popup
  errorPopup.style.display = 'block';
}

// Function to hide the error popup
function hideError() {
  const errorPopup = document.getElementById('error-popup');
  errorPopup.style.display = 'none';
}

function dateFormatter(date) {
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  return dd + '/' + mm + '/' + yyyy;
}

function isAdmin(uId) {
  return getUserDetails(uId)
    .then(data => data.admin)
    .catch(error => {
      console.log(error);
      return false;
    });
}

function isThreadLocked(threadId) {
  return fetchThreadDetails(threadId).then(data => data.lock)
    .catch(e => {
      showError(e);
      return false;
    });
}

function getLatestThread() {
  const start = 0;
  return fetchThreads(start)
    .then(threads => {
      return threads[0];
    })
    .catch(e => console.log(error));
}

function getAllThreads() {
  let start = 0;
  let more = true;
  const allThreads = [];

  // Define a recursive function to fetch threads until there are no more threads left
  function fetchNextThreads() {
    if (!more) {
      return Promise.resolve(); // Resolve the promise if there are no more threads
    }

    // Fetch threads starting from the current index
    return fetchThreads(start)
      .then(threads => {
        threads.forEach(threadId => {
          allThreads.push(threadId);
        });
        start += threads.length; // Increment start for the next fetch
        if (threads.length === 0 || threads.length < 5) {
          more = false;
          return;
        }
        return fetchNextThreads(); // Recursively fetch the next batch of threads
      })
      .catch(error => {
        console.log(error); // Handle any errors that occur during fetching
        more = false; // Exit the loop in case of an error
      });
  }

  // Start fetching threads
  return fetchNextThreads().then(() => allThreads);
}

export { fileToDataUrl, showError, hideError, dateFormatter, isAdmin, isThreadLocked, getLatestThread, getAllThreads };
