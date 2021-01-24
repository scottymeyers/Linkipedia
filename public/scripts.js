/* eslint-disable no-console */
const documentBody = document.querySelector('body');
const searchForm = document.getElementById('search');

const table = document.querySelector('table');
const tbody = document.querySelector('table tbody');

const setLoadingStyles = (loading) => {
  documentBody.classList.toggle('loading', loading);
  table.parentNode.style.display = loading ? 'none' : 'block';

  // clear table
  if (loading) {
    while (tbody.children.length > 1) {
      tbody.removeChild(tbody.lastChild);
    }
  }
};

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

const setResults = (results) => {
  table.parentNode.style.display = 'block';
  const { urls } = results;
  urls.map((url) => {
    if (!url) return null;
    const newRow = table.insertRow();
    newRow.insertCell(0).innerHTML = url.id;
    newRow.insertCell(1).innerHTML = url.parentId !== 0 ? url.parentId : '';
    newRow.insertCell(2).innerHTML = `<a href='${url.href}' target="_blank">${url.href.replace('https://en.wikipedia.org', '')}</a>`;
    return newRow;
  });
};

const getInputValue = (name) => document.querySelector(`[name="${name}"]`).value;

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = {
    start: getInputValue('start'),
    end: getInputValue('end'),
    exact: getInputValue('exact') === 'true',
  };
  setLoadingStyles(true);
  setError(null);
  setMessage(null);
  fetch('/crawl', {
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }).catch((e) => console.log(`error: ${e}`));
});

(() => {
  // eslint-disable-next-line no-undef
  const socket = io.connect('http://localhost:3000');
  socket.on('error', (data) => setError(data.results.error));
  socket.on('message', (data) => setMessage(data.message));
  socket.on('results', (data) => {
    const { message, results } = data;
    setLoadingStyles(false);
    setMessage(message);
    setResults(results);
  });
})();
