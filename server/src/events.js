// Server-Sent Events: every open home page keeps one connection to
// GET /api/events, and we push a message to all of them when a story is
// published. No extra infrastructure or dependency is needed.
const clients = new Set();

export function eventsHandler(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  // A comment line every 25 s stops proxies from closing an idle connection.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25_000);
  clients.add(res);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
}

export function broadcast(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(message);
}
