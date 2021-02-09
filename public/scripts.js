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
  const { nodes, links } = results;
  console.log(results);

  /** Graph */
  // eslint-disable-next-line no-undef
  const Graph = ForceGraph3D()(document.getElementById('graph'));
  Graph.resetProps();
  Graph.graphData({
    nodes,
    links: [],
  })
    .nodeAutoColorBy('group')
    // .backgroundColor('rgba(37, 138, 216, 0.07)')
    .backgroundColor('orange')
    .height('1000')
    .width('1000')
    .nodeColor('red')
    .linkColor('orange')
    .nodeAutoColorBy('parentId')
    .nodeThreeObject((node) => {
      // eslint-disable-next-line no-undef
      const sprite = new SpriteText(node.id);
      sprite.material.depthWrite = false; // make sprite background transparent
      sprite.color = 'black';
    
      sprite.textHeight = 8;
      return sprite;
    });

  // Spread nodes a little wider
  Graph.d3Force('charge').strength(-120);

  /** TODO: Table */
  // urls.map((url) => {
  //   if (!url) return null;
  //   const newRow = table.insertRow();
  //   newRow.insertCell(0).innerHTML = url.id;
  //   newRow.insertCell(1).innerHTML = url.parentId !== 0 ? url.parentId : '';
  //   newRow.insertCell(2).innerHTML = `<a href='${url.href}' target="_blank">${url.href.replace('https://en.wikipedia.org', '')}</a>`;
  //   return newRow;
  // });
};

const getInputValue = (name) => document.querySelector(`[name="${name}"]`).value;

searchForm.addEventListener('submit',  async (event) => {
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
  }).then((response) => {
    return response.json();
  }).then((json) => {
    setMessage(json.data.message);
  });
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
