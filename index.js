const dataSources = {
  location: 'https://coronadatascraper.com/timeseries-byLocation.json',
  date: 'https://coronadatascraper.com/timeseries.json',
  current: '',
};

function getQueryVariable(request, variable, array) {
  const url = new URL(request.url);
  const query = url.search.slice(1);
  const vars = query.split('&');
  const results = [];
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      results.push(pair[1]);
    }
  }
  if (array) {
    return results;
  }
  return results[0] || null;
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const group = getQueryVariable(request, 'group') || 'location';
  if (!dataSources[group]) {
    return new Response('Group not found', {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
  const dataSourceResponse = await fetch(dataSources[group]);
  const filters = getQueryVariable(request, 'filter', true);
  let content;
  if (filters.length) {
    const text = await dataSourceResponse.text();
    if (filters.length) {
      const parts = filters.map(filter => text.match(new RegExp(`\\n\\s\\s"${filter}":[\\s\\S]+?\\n\\s\\s}`)));
      content = `{${parts.join(',\n')}\n}`;
    }
  } else {
    content = await dataSourceResponse.arrayBuffer();
  }
  return new Response(content, {
    headers: {
      'content-type': 'application/json',
      // Set CORS headers
      'Access-Control-Allow-Origin': request.headers.get('Origin'),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',

      // Append to/Add Vary header so browser will cache response correctly
      Vary: 'Origin',
    },
  });
}

this.addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(event.request));
});
