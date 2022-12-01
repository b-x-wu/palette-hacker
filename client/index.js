const baseEndpoint = 'http://localhost:3001'; // TODO: set this programatically
// const baseEndpoint = 'https://palette-hacker.herokuapp.com';
const successDisplay = document.querySelector('#success-display');
const failDisplay = document.querySelector('#fail-display');
const loadingDisplay = document.querySelector('#loading-display');
const swatchContainer = document.querySelector('#swatches');

// ----------------------- UTILITY FUNCTIONS ----------------------------

/**
 * Converts a string from rgba(*, *, *, *) to hex (#******)
 * @param {String} rgba the rgba string to convert to hex
 * @returns the hex color
 */
function rgbaToHex(rgba) {
  const [, red, green, blue] = rgba.match(/rgba*\((\d+), (\d+), (\d+)(?:, \d*\.?\d*)?\)/);
  const redString = parseInt(red, 10).toString(16).padStart(2, '0');
  const greenString = parseInt(green, 10).toString(16).padStart(2, '0');
  const blueString = parseInt(blue, 10).toString(16).padStart(2, '0');
  const hex = `#${redString}${greenString}${blueString}`;
  return hex;
}

/**
 * Converts color object from backend to rgb representation used by front-end
 * @param {Color} colorObj object representation of color as {red, green, blue}
 * @returns the color in string representation rgb(R, G, B)
 */
function colorObjectToRGB(colorObj) {
  return `rgb(${colorObj.red}, ${colorObj.green}, ${colorObj.blue})`;
}

/**
 * Clears the success response and displays a failure message in the relevant div
 * @param {string} message the failure message to display
 */
function displayFailMessage(message) {
  loadingDisplay.classList.add('hidden');
  successDisplay.classList.add('hidden');
  failDisplay.classList.remove('hidden');
  failDisplay.textContent = message;
}

/**
 * Clears the failure response and displays a success message in the relevant div
 * @param {string} message the success message to display
 */
function displaySucessMessage(message) {
  loadingDisplay.classList.add('hidden');
  failDisplay.classList.add('hidden');
  successDisplay.classList.remove('hidden');
  successDisplay.textContent = message;
}

/**
 * Display a loading message
 * @param {string} message the message to display
 */
function displayLoadingMessage(message) {
  successDisplay.classList.add('hidden');
  failDisplay.classList.add('hidden');
  loadingDisplay.classList.remove('hidden');
  loadingDisplay.textContent = message;
}

// ----------------------- EVENT LISTENERS ----------------------------

/**
 * handles changing colors by passing a message to content.js
 * @param {Event} e the event
 * @param {number} idx the index of the current color
 * @param {any} components the list of selectors/attributes of elements being affected
 * @param {any[]} palette the current palette to be modifying. likely the abridged one
 */
function handleColorInput(e, components) {
  e.preventDefault();
  // TODO: maybe only display submission form after a color has been changed
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
}

function handleSubmitPalette(e, url) {
  e.preventDefault();
  displayLoadingMessage('Submitting palette...');

  // get the palette again
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // prepare message
    const message = {
      author: 'popup',
      request: 'getDOM',
    };

    // get name and website
    const paletteName = document.querySelector('#palette-name').value;
    document.querySelector('#palette-name').value = '';
    // TODO: figure out what we want for the website.

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
          body: JSON.stringify({
            palette,
            name: paletteName,
            website: url,
          }),
        });
        const apiResponse = await rawAPIResponse.json();

        // send message out to user
        if (apiResponse.status === 'success') {
          displaySucessMessage('Successfully submitted palette.');
          console.log(apiResponse.data);
        } else if (apiResponse.status === 'error') {
          displayFailMessage(`Error: ${apiResponse.message}`);
        }
      } else {
        displayFailMessage(`Error: ${chromeResponse.message}`);
      }
    });
  });
}

async function handleGetPalette() {
  // TODO: I don't know if this should count as a success message
  displayLoadingMessage('Loading palette for current website...');

  // send a message to content.js
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // prepare message
    // TODO: create documentation for what different requests are and do
    const message = {
      author: 'popup',
      request: 'getDOM',
    };

    // send message
    // TODO: change to a port based conversation
    //       https://developer.chrome.com/docs/extensions/mv3/messaging/
    chrome.tabs.sendMessage(tabs[0].id, message, getPaletteMessageListener);
  });
}

async function handleApplyPalette(event, id) {
  event.preventDefault();

  // make fetch request for the palette
  displayLoadingMessage('Applying palette...');
  try {
    const fetchResponse = await fetch(`${baseEndpoint}/get_palette?${new URLSearchParams({
      objectId: id,
    })}`);
    const response = await fetchResponse.json();

    // check for errors
    if (fetchResponse.status === 400) {
      throw new Error(response.data.reason);
    } else if (fetchResponse.status === 500) {
      throw new Error(response.message);
    }

    const { palette } = response.data;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const message = {
        author: 'popup',
        request: 'applyPalette',
        data: {
          swatches: palette.swatches,
        },
      };

      // TODO: if we want more info, we have to make a custom response listener
      // chrome.tabs.sendMessage(tabs[0].id, message, (handleGetPalette));
      chrome.tabs.sendMessage(tabs[0].id, message, (chromeResponse) => {
        if (chromeResponse.status === 'success') {
          displaySucessMessage(chromeResponse.status);
        } else {
          displayFailMessage(chromeResponse.message);
        }
      });
    });
  } catch (e) {
    displayFailMessage(`Error: ${e.message}`);
  }
}

async function handleRetrieveWebsitePalettes() {
  // get the url of the page
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const message = {
      author: 'popup',
      request: 'getUrl',
    };
    try {
      const chromeResponse = await chrome.tabs.sendMessage(tabs[0].id, message);
      const { url } = chromeResponse.data;

      const fetchResponse = await fetch(`${baseEndpoint}/get_website_palettes?${new URLSearchParams({
        website: url,
      })}`);

      const fetchResponseBody = await fetchResponse.json();

      if (fetchResponse.status === 200) {
        const { palettes } = fetchResponseBody.data;
        const retrievedPalettesContainer = document.querySelector('#retrieved-palettes');
        const retrievedPaletteTemplate = document.querySelector('#retrieved-palette-template');

        palettes.forEach((palette) => {
          console.log(palette);
          const retrievedPalette = retrievedPaletteTemplate.content.cloneNode(true);
          // retrievedPalette.querySelector('.retrieved-palette').id = `ID-${palette.objectId}`;
          retrievedPalette.querySelector('.palette-name').textContent = palette.name;
          retrievedPalette.querySelector('.palette-relevance').textContent = palette.relevance;
          retrievedPalette.querySelector('.apply-palette').addEventListener('click', (e) => handleApplyPalette(e, palette.objectId));

          const palettePreview = retrievedPalette.querySelector('.palette-preview');
          palette.colors.slice(0, 5).forEach((color) => {
            const colorSquare = document.createElement('div');
            colorSquare.classList.add('retrieved-palette-color-square');
            colorSquare.style.backgroundColor = colorObjectToRGB(color);
            palettePreview.appendChild(colorSquare);
          });

          retrievedPalettesContainer.appendChild(retrievedPalette);
        });
      } else if (fetchResponse.status === 400) {
        displayFailMessage(`Error retrieving palettes: ${fetchResponseBody.data.reason}`);
      } else if (fetchResponse.status === 500) {
        displayFailMessage(`Error retrieving palettes: ${fetchResponseBody.message}`);
      }
    } catch (e) {
      displayFailMessage(`Error retrieving palettes: ${e.message}`);
    }
  });
}

// ----------------------- CHROME MESSAGE LISTENERS --------------------------

function getPaletteMessageListener(response) {
  if (response.status === 'success') {
    // display the color palette out to the user
    // we probably don't want to display all the colors, maybe the most popular ones
    const { palette, url } = response.data;
    console.log(palette);
    palette.sort((color1, color2) => color2.components.length - color1.components.length);
    // TODO: sorting by the number of components often will not give the components that cover
    //       the majority of the screen. is there a better way to sort?
    //       or we could also allow the user to paginate through all the colors. that doesn't
    //       take care of sorting, but it does give the user more power.

    // TODO: how much of the palette do we actually want to save? right now it's all of it

    const abridgedPalette = palette.slice(0, 8);
    abridgedPalette.forEach((color) => {
      const swatch = document.createElement('input');
      swatch.classList.add('swatch');
      // swatch.classList.add('col-md-2');
      swatch.type = 'color';
      swatch.value = rgbaToHex(`rgb(${color.color.red}, ${color.color.green}, ${color.color.blue})`);
      swatch.addEventListener('input', (e) => handleColorInput(e, color.components));
      // TODO: add a feature to flash the elements associated with a certain color on click
      swatchContainer.appendChild(swatch);
    });

    // show the form to submit palette
    document.querySelector('#submit-palette-form').style.display = 'block';
    document.querySelector('#submit-palette').addEventListener('click', (e) => handleSubmitPalette(e, url));
    displaySucessMessage('Retrieved website palette');
  } else {
    displayFailMessage(`Error: ${response.message}`);
  }
}

// ------------------------ MAIN --------------------------------------

function main() {
  document.querySelector('#submit-palette-form').style.display = 'none';
  handleRetrieveWebsitePalettes();
  handleGetPalette();
}

document.addEventListener('DOMContentLoaded', main);

// TODO: this typing is make me very very nervous...
//       get typescript and webpack up and running
