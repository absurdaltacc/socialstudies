const postMessage = MessagePort.prototype.postMessage;
let transport;
let transportName = '';

function sendError(port, error, operation) {
  console.error(`BareMux ${operation} failed`, error);
  postMessage.call(port, { type: 'error', error: String(error?.message || error) });
}

async function handleFetch(message, port) {
  if (!transport) throw new Error('No BareMux transport configured.');
  if (typeof transport.init === 'function') await transport.init();
  const request = message.fetch;
  const response = await transport.request(
    new URL(request.remote),
    request.method,
    request.body,
    request.headers,
    null,
  );
  if (response.body instanceof ReadableStream) {
    const body = await new Response(response.body).arrayBuffer();
    response.body = body;
    postMessage.call(port, { type: 'fetch', fetch: response }, [body]);
    return;
  }
  postMessage.call(port, { type: 'fetch', fetch: response });
}

function connect(port) {
  port.onmessage = async ({ data }) => {
    const message = data.message;
    if (message.type === 'ping') {
      postMessage.call(data.port, { type: 'pong' });
      return;
    }
    if (message.type === 'set') {
      try {
        if (message.client.function === 'bare-mux-remote') {
          transport = message.client.args[0];
          transportName = `bare-mux-remote (${message.client.args[1]})`;
        } else {
          const factory = new Function(`return (${message.client.function})`)();
          const [Transport, name] = await factory();
          transport = new Transport(...message.client.args);
          transportName = name;
        }
        postMessage.call(data.port, { type: 'set' });
      } catch (error) {
        sendError(data.port, error, 'set');
      }
      return;
    }
    if (message.type === 'get') {
      data.port.postMessage({ type: 'get', name: transportName });
      return;
    }
    if (message.type === 'fetch') {
      try { await handleFetch(message, data.port); } catch (error) { sendError(data.port, error, 'fetch'); }
      return;
    }
    if (message.type === 'websocket') {
      sendError(data.port, new Error('WebSocket transport is not available in the local fallback worker.'), 'websocket');
    }
  };
}

new BroadcastChannel('bare-mux').postMessage({ type: 'refreshPort' });
self.onconnect = (event) => connect(event.ports[0]);
