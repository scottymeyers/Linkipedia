(function() {
  const socket = io.connect('http://localhost:3000');
  socket.on('connected', (data) => console.log(data.message));
  socket.on('results', (data) => displayResults(data));
})();

const searchForm = document.getElementById('search');

const displayResults= (data) => {
  console.log(data.results);
  document.querySelector('.results').style.display = 'block';
  document.querySelector('body').classList.remove('loading');
  const urls = data.results.urls;
  const table = document.querySelector('table');
  urls.map((url) => {
    const row = table.insertRow();
    const cellId = row.insertCell(0);
    cellId.innerHTML = url.id;
    const cellParentId = row.insertCell(1);
    cellParentId.innerHTML = url.parent;
    const cellHref = row.insertCell(2);
    cellHref.innerHTML = url.href;
  });
};

const handleForm = (event) => {
  event.preventDefault();
  const formData = {
    start: document.querySelector('[name="start"]').value,
    end: document.querySelector('[name="end"]').value,
    exact: document.querySelector('[name="exact"]').checked
  };
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
