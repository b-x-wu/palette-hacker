const baseEndpoint = 'http://localhost:3001';
const submitButton = document.querySelector('#submit-registration');

async function handleRegistrationSubmit() {
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  // fetch the response from the backend
  const rawResponse = await fetch(`${baseEndpoint}/register`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  const response = await rawResponse.json();

  // check response status
  if (response.status === 'success') {
    // do something on success
    // TODO: redirect to home with some info about the user
  } else if (response.status === 'fail') {
    // display error message on fail/error
    const fail = document.querySelector('#fail');
    fail.textContent = response.data.reason;
  } else if (response.status === 'error') {
    const error = document.querySelector('#error');
    error.textContent = response.message;
  }
}

submitButton.addEventListener('click', handleRegistrationSubmit);
