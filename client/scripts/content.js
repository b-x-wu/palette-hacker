/**
 *
 * @param {Node} node the node to iterate from
 * @param {Array(string)} selector the current selector of the node
 * @param {(Node, string) => void} cb the function to call on every node
 */
function iterateThroughDOMRec(node, selector, cb) {
  // recursive helper for iterateThroughDOMRec
  cb(node, selector.join('>'));

  // iterate through element children
  // TODO: there are probably certain tags I want to filter out
  //       ie script, style, noscript, etc
  const { children } = node;
  for (let i = 0, len = children.length; i < len; i++) {
    // get the tag, id (if it exists), and classes (if they exist)
    const child = children[i];
    const childId = child.id; // either the unique id or the empty string
    const childClasses = child.getAttribute('class'); // either null or space delimited classes
    const childTag = child.tagName;

    // check for qualities we don't want
    const childSelector = childTag
                          + (childId ? `#${childId}` : '')
                          + (childClasses ? `.${childClasses.trim().replace(/\s+/g, '.').replace(/:/g, '\\:')}` : '');
    // TODO: https://edstem.org/us/courses/27587/discussion/2104836

    const newSelectors = selector.slice();
    newSelectors.push(childSelector);

    try {
      document.querySelector(newSelectors.join('>'));
      iterateThroughDOMRec(child, newSelectors, cb);
    } catch {
      // we catch if the added selector made it an invalid selector
      // for now, we don't do anything with it.
      // I guess there's a lot of reasons why a query selector fails
      // TODO: figure out some reasons for why query selectors fail
      // current known reasons: colons, containers for google ad iframes
      console.log(`Invalid query selector found: ${newSelectors.join('>')}`);
    }
  }
}

/**
 *
 * @param {(node: Node, selector: String) => void} cb the function to run on every element node
 */
function iterateThroughDOM(cb) {
  // this function iterates through DOM body using inorder traversal
  // and passes the node and selector to a callback function at each node
  iterateThroughDOMRec(document.body, ['body'], cb);
}

// process messages received
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content.js');
  console.log('message:', message);
  console.log('sender:', sender);

  if (message.author === 'popup' && message.request === 'getDOM') {
    // message from popup to send back the dom

    const colorAttributes = [
      'background-color',
      'border-bottom-color',
      'border-left-color',
      'border-right-color',
      'border-top-color',
      'caret-color',
      'color',
      'column-rule-color',
      'outline-color',
      'text-decoration-color',
    ];

    // iterate through all the elements of the DOM
    // TODO: figure out what to do about alpha value
    const colorInfo = {};
    iterateThroughDOM((node, selector) => {
      // for each node in the dom, either add it to an
      // existing color or create a new color and add itself to it
      const style = getComputedStyle(node);
      colorAttributes.forEach((attribute) => {
        const color = style.getPropertyValue(attribute);
        const component = {
          selector,
          attribute,
        };
        if (Object.hasOwn(colorInfo, color)) {
          colorInfo[color].push(component);
        } else {
          colorInfo[color] = [component];
        }
      });
    });

    // transform into palette array
    const colors = Object.getOwnPropertyNames(colorInfo);
    const palette = [];
    for (let i = 0; i < colors.length; i++) {
      // get unique node/attribute properties
      const components = Array.from(
        colorInfo[colors[i]].reduce((curSet, e) => curSet.add(JSON.stringify(e)), new Set()),
      ).map((ele) => JSON.parse(ele));
      // add new color and unique components to palette
      palette.push({
        color: colors[i],
        components,
      });
    }

    console.log('returning DOM');
    const response = {
      status: 'success',
      data: {
        palette,
        url: window.location.href,
      },
    };
    // data: {
    //   palette: [
    //     {
    //       color: String,
    //       components: [
    //         {
    //           selector: String,
    //           attribute: String,
    //         }
    //       ]
    //     }
    //   ]
    // }
    sendResponse(response);
  } else if (message.author === 'popup' && message.request === 'changeColor') {
    // change the style of all the components to the new color
    let response;
    try {
      message.data.components.forEach((component) => {
        const elements = document.querySelectorAll(component.selector);
        elements.forEach((element) => {
          element.style.setProperty(component.attribute, message.data.newColor);
        });
      });
      response = {
        status: 'success',
        data: null,
      };
    } catch (e) {
      // catch any potential errors and respond with them
      response = {
        status: 'error',
        message: e.message,
      };
    } finally {
      sendResponse(response);
    }
  } else {
    // unknown author or request
    const response = {
      status: 'error',
      message: 'Invalid author or request',
    };
    sendResponse(response);
  }
});
