const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'OK', data: { status: 'healthy' } }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
const port = 3001;
server.listen(port, () => {
  console.log(`Fake backend health server listening on http://localhost:${port}/api/health`);
});