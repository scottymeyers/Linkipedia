(function() {
  const socket = io.connect('http://localhost:3000');
  // listening for the connected event from the server
  socket.on('connected', (data) => {
    console.log('The server said: ' + data.message);
  });
  // sending a message event to the server
  socket.emit('message', { message: 'Hi!' });
})();

const searchForm = document.getElementById('search');

const handleForm = (event) => {
  event.preventDefault();
  const formData = {
    start: document.querySelector('[name="start"]').value,
    end: document.querySelector('[name="end"]').value,
    exact: document.querySelector('[name="exact"]').checked
  };

  console.log(formData);

  document.querySelector('.results').style.display = 'none';
  document.querySelector('body').classList.add('loading');

  fetch('/scrape', {
    body: JSON.stringify(formData),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
  }).then(res => {
    console.log('Request complete! response:', res);
  });

};

searchForm.addEventListener('submit', handleForm);
