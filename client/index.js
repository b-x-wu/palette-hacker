const baseEndpoint = 'http://localhost:3001'; // TODO: set this programatically
const getPaletteButton = document.querySelector('#get-palette');
const display = document.querySelector('#display');
const swatchContainer = document.querySelector('#swatches');

/**
 * Converts a string from rgba(*, *, *, *) to hex (#******)
 * @param {String} rgba the rgba string to convert to hex
 * @returns the hex color
 */
const rgbaToHex = (rgba) => {
  const [, red, green, blue] = rgba.match(/rgba*\((\d+), (\d+), (\d+)(?:, \d*\.?\d*)?\)/);
  // TODO: figure out what to do about alpha values
  const redString = parseInt(red, 10).toString(16).padStart(2, '0');
  const greenString = parseInt(green, 10).toString(16).padStart(2, '0');
  const blueString = parseInt(blue, 10).toString(16).padStart(2, '0');
  const hex = `#${redString}${greenString}${blueString}`;
  return hex;
};

/**
 * handles changing colors by passing a message to content.js
 * @param {Event} e the event
 * @param {number} idx the index of the current color
 * @param {any} components the list of selectors/attributes of elements being affected
 * @param {any[]} palette the current palette to be modifying. likely the abridged one
 */
const handleColorInput = (e, components) => {
  e.preventDefault();
  // send a message to content.js with component information
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const message = {
      author: 'popup',
      request: 'changeColor',
      data: {
        newColor: e.target.value,
        components,
      },
    };

    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      console.log(response);
    });
  });
};

const handleSubmitPalette = (e) => {
  e.preventDefault();
  // get the palette again
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // prepare message
    const message = {
      author: 'popup',
      request: 'getDOM',
    };

    // retrieving the palette from content.js
    chrome.tabs.sendMessage(tabs[0].id, message, async (chromeResponse) => {
      if (chromeResponse.status === 'success') {
        const { palette } = chromeResponse.data;

        // send the palette to api
        const rawAPIResponse = await fetch(`${baseEndpoint}/add_palette`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ palette }),
        });
        const apiResponse = await rawAPIResponse.json();

        // send message out to user
        if (apiResponse.status === 'success') {
          display.textContent = 'Successfully submitted palette.';
          console.log(apiResponse.data);
        } else if (apiResponse.status === 'error') {
          display.textContent = 'Error. View console for more information.';
          console.log(apiResponse.message);
        }
      } else {
        display.textContent = 'Error. View console for more information.';
        console.log(chromeResponse.message);
      }
    });
  });
  console.log('submitting palette');
  // body should be of the form
  // {
  //   palette: [
  //     {
  //       color: String,
  //       components: [{
  //         selector: String,
  //         attribute: String,
  //       }]
  //     }
  //   ]
  // }
};

getPaletteButton.addEventListener('click', () => {
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
        // TODO: sorting by the number of components often will not give the components that cover
        //       the majority of the screen. is there a better way to sort?
        console.log(palette);

        const abridgedPalette = palette.slice(0, 10);
        abridgedPalette.forEach((color) => {
          const swatch = document.createElement('input');
          swatch.type = 'color';
          swatch.value = rgbaToHex(color.color);
          swatch.addEventListener('input', (e) => handleColorInput(e, color.components));
          swatchContainer.appendChild(swatch);
        });

        // create form submitting elemenets
        // TODO: can we do this with a template? or unhidden div?
        const paletteNameInput = document.createElement('input');
        paletteNameInput.type = 'text';
        paletteNameInput.id = 'palette-name';
        paletteNameInput.placeholder = 'Palette Name';
        document.body.appendChild(paletteNameInput);

        const submitPaletteButton = document.createElement('button');
        submitPaletteButton.id = 'submit-palette';
        submitPaletteButton.textContent = 'Submit Palette';
        submitPaletteButton.addEventListener('click', handleSubmitPalette);
        document.body.appendChild(submitPaletteButton);
      } else {
        display.textContent = 'Error. View console for more information.';
        console.log(response.message);
      }
    });
  });
});

// when we want to send the newest palette to the db, just get the dom again
