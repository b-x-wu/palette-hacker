const button = document.querySelector('button');
const display = document.querySelector('#display');
const swatchContainer = document.querySelector('#swatches');

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
    // TODO: change to a port based conversation
    //       https://developer.chrome.com/docs/extensions/mv3/messaging/
    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (response.status === 'success') {
        display.textContent = 'Got DOM. View data in console.';
        // display the color palette out to the user
        // we probably don't want to display all the colors, maybe the most popular ones
        const { palette } = response.data;
        palette.sort((color1, color2) => color2.components.length - color1.components.length);
        palette.slice(0, 10).forEach((color) => {
          const swatch = document.createElement('div');
          swatch.style.backgroundColor = color.color;
          swatch.style.height = '20px';
          swatch.style.width = '20px';
          swatch.style.display = 'inline-block';
          swatchContainer.appendChild(swatch);
        });
      } else {
        display.textContent = 'Error. View console for more information.';
        console.log(response.data);
      }
    });
  });
});
