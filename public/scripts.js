const documentBody = document.querySelector('body');
const resultsEl = document.querySelector('.results');
const searchForm = document.getElementById('search');
const table = document.querySelector('table');

const setError = (error) => {
  const errorsEl = document.querySelector('.errors');
  if (errorsEl) {
    errorsEl.style.display = error ? 'block' : 'none';
    errorsEl.innerHTML = error || '';
  }
};

const setMessage = (message) => {
  const messageEl = document.querySelector('.messages');
  if (messageEl) {
    messageEl.style.display = message ? 'block' : '';
    messageEl.innerHTML = message || '';
  }
};

const setResults = (data) => {
  resultsEl.style.display = 'block';
  const { urls } = data.results;
  urls.forEach((url) => {
    if (!url) return;
    const newRow = table.insertRow();
    newRow.insertCell(0).innerHTML = url.id;
    newRow.insertCell(1).innerHTML = url.parentId !== 0 ? url.parentId : '';
    newRow.insertCell(2).innerHTML = `<a href='${url.href}' target="_blank">${url.href.replace('https://en.wikipedia.org', '')}</a>`;
  });
};

const handleForm = (event) => {
  event.preventDefault();
  const formData = {
    start: document.querySelector('[name="start"]').value,
    end: document.querySelector('[name="end"]').value,
    exact: document.querySelector('[name="exact"]').checked,
  };
  resultsEl.style.display = 'none';
  documentBody.classList.add('loading');
  setError(null);
  setMessage(null);
  fetch('/crawl', {
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
  }).catch((e) => console.log(`error: ${e}`));
};

searchForm.addEventListener('submit', handleForm);

(() => {
  const socket = io.connect('http://localhost:3000');
  socket.on('error', (data) => setError(data.results.error));
  socket.on('message', (data) => setMessage(data.message));
  socket.on('results', (data) => {
    documentBody.classList.remove('loading');
    setResults(data);
  });
})();