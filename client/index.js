const button = document.querySelector('button');
const display = document.querySelector('#display');

button.addEventListener('click', () => {
  // sanity check to show that button was clicked
  display.textContent = 'loading';

  // send a message to content.js
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // prepare message
    const message = {
      author: 'popup',
      request: 'getDOM',
    };

    // send message
    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (response.status === 'OK') {
        display.textContent = 'Got the DOM';
        console.log(response.data);
      } else {
        display.textContent = 'Error. View console for more information.';
        console.log(response.data);
      }
    });
  });
});
