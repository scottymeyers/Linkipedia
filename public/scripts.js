(() => {
  const socket = io.connect('http://localhost:3000');
  socket.on('connected', (data) => console.log(data.message));
  socket.on('error', (data) => displayErrors(data));
  socket.on('results', (data) => displayResults(data));
})();

const searchForm = document.getElementById('search');

const displayErrors = (data) => {
  document.querySelector('.error').style.display = 'block';
  document.querySelector('.error').innerHTML = `Error: ${data.results.error}`;
  document.querySelector('body').classList.remove('loading');
};

const displayResults = (data) => {
  console.log(data);
  document.querySelector('.results').style.display = 'block';
  document.querySelector('body').classList.remove('loading');
  const urls = data.results.urls;
  const table = document.querySelector('table');
  urls.map((url) => {
    if (!url) return;
    const row = table.insertRow();
    const cellId = row.insertCell(0);
    cellId.innerHTML = url.id;
    const cellParentId = row.insertCell(1);
    cellParentId.innerHTML = url.parent;
    const cellHref = row.insertCell(2);
    cellHref.innerHTML = `<a href='${url.href}' target="_blank">${url.href.replace('https://en.wikipedia.org', '')}</a>`;
  });
};

const handleForm = (event) => {
  event.preventDefault();
  const formData = {
    start: document.querySelector('[name="start"]').value,
    end: document.querySelector('[name="end"]').value,
    exact: document.querySelector('[name="exact"]').checked
  };
  document.querySelector('.error').style.display = 'none';
  document.querySelector('.results').style.display = 'none';
  document.querySelector('body').classList.add('loading');
  fetch('/scrape', {
    body: JSON.stringify(formData),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
  }).then(() => console.log('Scanning Wikipedia'));
};

searchForm.addEventListener('submit', handleForm);
