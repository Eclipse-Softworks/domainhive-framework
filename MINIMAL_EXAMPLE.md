# Minimal Example - Get Started in 60 Seconds

## The Absolute Minimum to Get Running

Create a file `server.js`:

```javascript
const { RESTModule } = require('domainhive-framework');

async function start() {
  const rest = new RESTModule({ port: 3000 });
  
  rest.addRoute({
    method: 'GET',
    path: '/hello',
    handler: (req, res) => res.json({ message: 'Hello from DomainHive!' })
  });
  
  await rest.start();
  console.log('🚀 Server ready at http://localhost:3000');
}

start();
```

Run it:
```bash
node server.js
```

Test it:
```bash
curl http://localhost:3000/hello
# Response: {"message":"Hello from DomainHive!"}
```

## Add Auth (30 more seconds)

```javascript
const { RESTModule, AuthModule } = require('domainhive-framework');

async function start() {
  const rest = new RESTModule({ port: 3000 });
  const auth = new AuthModule({ secretKey: 'my-secret' });
  
  // Create a test user
  await auth.register('user', 'user@test.com', 'pass123');
  
  // Login endpoint
  rest.addRoute({
    method: 'POST',
    path: '/login',
    handler: async (req, res) => {
      const result = await auth.login(req.body.username, req.body.password);
      res.json(result);
    }
  });
  
  await rest.start();
  console.log('🚀 Server with Auth ready at http://localhost:3000');
}

start();
```

Test login:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass123"}'
```

## Add Real-Time Chat (30 more seconds)

```javascript
const { RESTModule, WebSocketModule } = require('domainhive-framework');

async function start() {
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // REST endpoint
  rest.addRoute({
    method: 'GET',
    path: '/hello',
    handler: (req, res) => res.json({ message: 'Hello!' })
  });
  
  // WebSocket chat
  ws.onMessage('chat', (data, connectionId) => {
    ws.broadcast({ type: 'chat', data });
  });
  
  await rest.start();
  await ws.start();
  
  console.log('🚀 REST API: http://localhost:3000');
  console.log('💬 WebSocket: ws://localhost:8080');
}

start();
```

Test WebSocket from browser console:
```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'chat', data: { message: 'Hello!' } }));
```

---

## That's It! 🎉

You now have a working backend. For more advanced features, see:
- [Full Example Server](./src/examples/backend-server.ts) - Complete backend with 15+ endpoints
- [Hackathon Guide](./HACKATHON_GUIDE.md) - Copy-paste patterns for common projects
- [Usage Guide](./USAGE_GUIDE.md) - Complete API documentation
