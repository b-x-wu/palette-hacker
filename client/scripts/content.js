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
  const children = Array.prototype.filter.call(
    node.childNodes,
    (n) => n.nodeType === Node.ELEMENT_NODE,
  );
  for (let i = 0, len = children.length; i < len; i++) {
    // get the tag, id (if it exists), and classes (if they exist)
    const child = children[i];
    const childId = child.id; // either the unique id or the empty string
    const childClasses = child.getAttribute('class'); // either null or space delimited classes
    const childTag = child.tagName;
    const childSelector = `${childTag}${(childId ? `#${childId}` : '')}${childClasses ? `.${childClasses.replace(' ', '.')}` : ''}`;

    const newSelectors = selector.slice();
    newSelectors.push(childSelector);
    iterateThroughDOMRec(child, newSelectors, cb);
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
    // TODO: compile a palette from the DOM

    // iterate through all the elements of the DOM
    const selectors = [];
    iterateThroughDOM((node, selector) => {
      // return the selectors
      const style = getComputedStyle(node);
      const { backgroundColor } = style;
      selectors.push({
        color: backgroundColor,
        selector,
        attribute: 'backgroundColor',
      });
    });

    console.log('returning DOM');
    const response = {
      status: 'OK',
      data: { selectors },
    };
    // data: {
    //   palette: [
    //     {
    //       color: String,
    //       nodeProperties: [
    //         {
    //           selector: String,
    //           attribute: String,
    //         }
    //       ]
    //     }
    //   ]
    // }
    sendResponse(response);
  } else {
    // unknown author or request
    const response = {
      status: 'ERR',
      data: 'Invalid author or request',
    };
    sendResponse(response);
  }
});
