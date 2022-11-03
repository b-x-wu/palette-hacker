// process messages received
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content.js');
  console.log('message:', message);
  console.log('sender:', sender);

  if (message.author === 'popup' && message.request === 'getDOM') {
    // message from popup to send back the dom
    console.log('returning DOM');
    const response = {
      status: 'OK',
      data: document,
    };
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
