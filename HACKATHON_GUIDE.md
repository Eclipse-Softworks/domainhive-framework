# DomainHive Framework - Hackathon Guide

**Build production-ready backends in minutes, not hours.**

This guide contains copy-paste ready code snippets for common hackathon scenarios. Just pick what you need, customize, and ship!

## 🏆 Why DomainHive for Hackathons?

- ⚡ **5-minute setup**: Get your backend running before the opening ceremony ends
- 🚀 **Pre-built common features**: Auth, chat, notifications, data storage
- 💪 **Production-ready**: Not a toy framework - use it beyond the hackathon
- 🔌 **All protocols**: REST, GraphQL, WebSocket, gRPC - whatever the judges prefer
- 📦 **Zero dependencies to manage**: Everything included in one package

## 🎯 Quick Start Patterns

### Pattern 1: Social Media Backend

Perfect for: Social networks, photo sharing, status updates

```javascript
const { 
  RESTModule, 
  WebSocketModule, 
  CacheModule, 
  AuthModule 
} = require('domainhive-framework');

async function socialMediaBackend() {
  // Initialize modules
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const auth = new AuthModule({ secretKey: 'social-secret' });
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // User registration
  rest.addRoute({
    method: 'POST',
    path: '/register',
    handler: async (req, res) => {
      const { username, email, password } = req.body;
      const user = await auth.register(username, email, password);
      res.json({ success: true, user });
    }
  });
  
  // User login
  rest.addRoute({
    method: 'POST',
    path: '/login',
    handler: async (req, res) => {
      const { username, password } = req.body;
      const result = await auth.login(username, password);
      res.json({ success: true, ...result });
    }
  });
  
  // Post status update
  rest.addRoute({
    method: 'POST',
    path: '/posts',
    handler: async (req, res) => {
      const { content, userId } = req.body;
      const post = {
        id: `post-${Date.now()}`,
        userId,
        content,
        timestamp: Date.now(),
        likes: 0
      };
      
      const posts = await cache.get('posts') || [];
      posts.unshift(post);
      await cache.set('posts', posts, 3600);
      
      // Notify followers in real-time
      ws.broadcast({ type: 'new-post', data: post });
      
      res.json({ success: true, post });
    }
  });
  
  // Get feed
  rest.addRoute({
    method: 'GET',
    path: '/feed',
    handler: async (req, res) => {
      const posts = await cache.get('posts') || [];
      res.json({ posts });
    }
  });
  
  // Like a post
  rest.addRoute({
    method: 'POST',
    path: '/posts/:postId/like',
    handler: async (req, res) => {
      const { postId } = req.params;
      const posts = await cache.get('posts') || [];
      const post = posts.find(p => p.id === postId);
      
      if (post) {
        post.likes++;
        await cache.set('posts', posts, 3600);
        ws.broadcast({ type: 'post-liked', data: { postId, likes: post.likes } });
        res.json({ success: true, likes: post.likes });
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    }
  });
  
  await rest.start();
  await ws.start();
  
  console.log('🚀 Social Media Backend Ready!');
  console.log('   REST API: http://localhost:3000');
  console.log('   WebSocket: ws://localhost:8080');
}

socialMediaBackend();
```

### Pattern 2: Real-Time Chat Application

Perfect for: Messaging apps, team collaboration, customer support

```javascript
const { 
  RESTModule, 
  WebSocketModule, 
  CacheModule 
} = require('domainhive-framework');

async function chatBackend() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // Create/join a room
  rest.addRoute({
    method: 'POST',
    path: '/rooms',
    handler: async (req, res) => {
      const { roomName, userId } = req.body;
      const room = {
        id: `room-${Date.now()}`,
        name: roomName,
        createdBy: userId,
        createdAt: Date.now(),
        members: [userId]
      };
      
      const rooms = await cache.get('rooms') || [];
      rooms.push(room);
      await cache.set('rooms', rooms, 86400);
      
      res.json({ success: true, room });
    }
  });
  
  // Get all rooms
  rest.addRoute({
    method: 'GET',
    path: '/rooms',
    handler: async (req, res) => {
      const rooms = await cache.get('rooms') || [];
      res.json({ rooms });
    }
  });
  
  // Get room messages
  rest.addRoute({
    method: 'GET',
    path: '/rooms/:roomId/messages',
    handler: async (req, res) => {
      const { roomId } = req.params;
      const messages = await cache.get(`messages:${roomId}`) || [];
      res.json({ messages });
    }
  });
  
  // WebSocket: User joins room
  ws.onMessage('join', async (data, connectionId) => {
    const { roomId, username } = data;
    
    // Store user-room mapping
    await cache.set(`user:${connectionId}`, { roomId, username }, 3600);
    
    // Notify others
    ws.broadcast({
      type: 'user-joined',
      data: { roomId, username, connectionId }
    });
    
    ws.send(connectionId, {
      type: 'joined',
      data: { roomId, username }
    });
  });
  
  // WebSocket: Send message
  ws.onMessage('message', async (data, connectionId) => {
    const { roomId, message } = data;
    const userInfo = await cache.get(`user:${connectionId}`);
    
    const chatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      username: userInfo?.username || 'Anonymous',
      message,
      timestamp: Date.now()
    };
    
    // Store message
    const messages = await cache.get(`messages:${roomId}`) || [];
    messages.push(chatMessage);
    if (messages.length > 500) messages.shift(); // Keep last 500
    await cache.set(`messages:${roomId}`, messages, 86400);
    
    // Broadcast to room
    ws.broadcast({
      type: 'message',
      data: chatMessage
    });
  });
  
  // WebSocket: Typing indicator
  ws.onMessage('typing', (data, connectionId) => {
    ws.broadcast({
      type: 'typing',
      data: { ...data, connectionId }
    }, connectionId);
  });
  
  await rest.start();
  await ws.start();
  
  console.log('💬 Chat Backend Ready!');
  console.log('   REST API: http://localhost:3000');
  console.log('   WebSocket: ws://localhost:8080');
}

chatBackend();
```

### Pattern 3: Notification System

Perfect for: Alert systems, push notifications, real-time updates

```javascript
const { 
  RESTModule, 
  WebSocketModule, 
  CacheModule 
} = require('domainhive-framework');

async function notificationBackend() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // Track user connections
  const userConnections = new Map();
  
  ws.on('connection', ({ connectionId }) => {
    userConnections.set(connectionId, { connected: Date.now() });
  });
  
  ws.on('disconnection', ({ connectionId }) => {
    userConnections.delete(connectionId);
  });
  
  // Register device/user
  ws.onMessage('register', (data, connectionId) => {
    const { userId } = data;
    userConnections.set(connectionId, { userId, connected: Date.now() });
  });
  
  // Send notification to specific user
  rest.addRoute({
    method: 'POST',
    path: '/notify/user',
    handler: async (req, res) => {
      const { userId, title, message, type = 'info' } = req.body;
      
      const notification = {
        id: `notif-${Date.now()}`,
        userId,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false
      };
      
      // Store notification
      const userNotifs = await cache.get(`notifications:${userId}`) || [];
      userNotifs.push(notification);
      await cache.set(`notifications:${userId}`, userNotifs, 86400);
      
      // Send to connected user
      for (const [connId, info] of userConnections) {
        if (info.userId === userId) {
          ws.send(connId, { type: 'notification', data: notification });
        }
      }
      
      res.json({ success: true, notification });
    }
  });
  
  // Broadcast notification to all
  rest.addRoute({
    method: 'POST',
    path: '/notify/all',
    handler: async (req, res) => {
      const { title, message, type = 'info' } = req.body;
      
      const notification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        type,
        timestamp: Date.now()
      };
      
      // Broadcast to all connected users
      const count = ws.broadcast({ type: 'notification', data: notification });
      
      res.json({ success: true, notification, sentTo: count });
    }
  });
  
  // Get user notifications
  rest.addRoute({
    method: 'GET',
    path: '/notifications/:userId',
    handler: async (req, res) => {
      const { userId } = req.params;
      const notifications = await cache.get(`notifications:${userId}`) || [];
      res.json({ notifications });
    }
  });
  
  // Mark as read
  rest.addRoute({
    method: 'POST',
    path: '/notifications/:notifId/read',
    handler: async (req, res) => {
      const { notifId } = req.params;
      const { userId } = req.body;
      
      const notifications = await cache.get(`notifications:${userId}`) || [];
      const notif = notifications.find(n => n.id === notifId);
      
      if (notif) {
        notif.read = true;
        await cache.set(`notifications:${userId}`, notifications, 86400);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    }
  });
  
  await rest.start();
  await ws.start();
  
  console.log('🔔 Notification Backend Ready!');
  console.log('   REST API: http://localhost:3000');
  console.log('   WebSocket: ws://localhost:8080');
}

notificationBackend();
```

### Pattern 4: Task/Todo Management

Perfect for: Project management, todo apps, kanban boards

```javascript
const { 
  RESTModule, 
  WebSocketModule, 
  CacheModule, 
  AuthModule 
} = require('domainhive-framework');

async function taskBackend() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const auth = new AuthModule({ secretKey: 'task-secret' });
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // Middleware for auth
  const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    try {
      const user = await auth.verifyAuth(token);
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  // Create task
  rest.addRoute({
    method: 'POST',
    path: '/tasks',
    middleware: [requireAuth],
    handler: async (req, res) => {
      const { title, description, priority = 'medium', dueDate } = req.body;
      
      const task = {
        id: `task-${Date.now()}`,
        title,
        description,
        priority,
        dueDate,
        status: 'todo',
        createdBy: req.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const tasks = await cache.get('tasks') || [];
      tasks.push(task);
      await cache.set('tasks', tasks, 86400);
      
      ws.broadcast({ type: 'task-created', data: task });
      
      res.json({ success: true, task });
    }
  });
  
  // Get all tasks
  rest.addRoute({
    method: 'GET',
    path: '/tasks',
    middleware: [requireAuth],
    handler: async (req, res) => {
      const tasks = await cache.get('tasks') || [];
      res.json({ tasks });
    }
  });
  
  // Update task status
  rest.addRoute({
    method: 'PATCH',
    path: '/tasks/:taskId/status',
    middleware: [requireAuth],
    handler: async (req, res) => {
      const { taskId } = req.params;
      const { status } = req.body;
      
      const tasks = await cache.get('tasks') || [];
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        task.status = status;
        task.updatedAt = Date.now();
        await cache.set('tasks', tasks, 86400);
        
        ws.broadcast({ type: 'task-updated', data: task });
        
        res.json({ success: true, task });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    }
  });
  
  // Delete task
  rest.addRoute({
    method: 'DELETE',
    path: '/tasks/:taskId',
    middleware: [requireAuth],
    handler: async (req, res) => {
      const { taskId } = req.params;
      
      let tasks = await cache.get('tasks') || [];
      const initialLength = tasks.length;
      tasks = tasks.filter(t => t.id !== taskId);
      
      if (tasks.length < initialLength) {
        await cache.set('tasks', tasks, 86400);
        ws.broadcast({ type: 'task-deleted', data: { taskId } });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    }
  });
  
  await rest.start();
  await ws.start();
  
  console.log('✅ Task Management Backend Ready!');
  console.log('   REST API: http://localhost:3000');
  console.log('   WebSocket: ws://localhost:8080');
}

taskBackend();
```

### Pattern 5: IoT Data Dashboard

Perfect for: Sensor monitoring, IoT projects, real-time dashboards

```javascript
const { 
  RESTModule, 
  WebSocketModule, 
  CacheModule,
  mqttBroker,
  brokerReady
} = require('domainhive-framework');

async function iotBackend() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // Wait for MQTT broker to be ready
  await brokerReady;
  
  // Subscribe to sensor data
  mqttBroker.subscribe('sensors/+/data', async (packet) => {
    const sensorId = packet.topic.split('/')[1];
    const data = JSON.parse(packet.payload.toString());
    
    const reading = {
      sensorId,
      ...data,
      timestamp: Date.now()
    };
    
    // Store recent readings
    const readings = await cache.get(`sensor:${sensorId}`) || [];
    readings.push(reading);
    if (readings.length > 100) readings.shift(); // Keep last 100
    await cache.set(`sensor:${sensorId}`, readings, 3600);
    
    // Broadcast to connected dashboards
    ws.broadcast({ type: 'sensor-data', data: reading });
  });
  
  // Get sensor data
  rest.addRoute({
    method: 'GET',
    path: '/sensors/:sensorId/data',
    handler: async (req, res) => {
      const { sensorId } = req.params;
      const readings = await cache.get(`sensor:${sensorId}`) || [];
      res.json({ sensorId, readings });
    }
  });
  
  // Get all active sensors
  rest.addRoute({
    method: 'GET',
    path: '/sensors',
    handler: async (req, res) => {
      const keys = await cache.get('sensor-keys') || [];
      const sensors = [];
      
      for (const key of keys) {
        const readings = await cache.get(`sensor:${key}`) || [];
        if (readings.length > 0) {
          sensors.push({
            id: key,
            lastReading: readings[readings.length - 1],
            totalReadings: readings.length
          });
        }
      }
      
      res.json({ sensors });
    }
  });
  
  // Send command to device
  rest.addRoute({
    method: 'POST',
    path: '/sensors/:sensorId/command',
    handler: async (req, res) => {
      const { sensorId } = req.params;
      const { command, params } = req.body;
      
      mqttBroker.publish({
        topic: `sensors/${sensorId}/commands`,
        payload: JSON.stringify({ command, params, timestamp: Date.now() }),
        qos: 1
      });
      
      res.json({ success: true, message: 'Command sent' });
    }
  });
  
  await rest.start();
  await ws.start();
  
  console.log('📊 IoT Dashboard Backend Ready!');
  console.log('   REST API: http://localhost:3000');
  console.log('   WebSocket: ws://localhost:8080');
  console.log('   MQTT Broker: mqtt://localhost:1883');
}

iotBackend();
```

## 🎨 Quick Customization Tips

### Adding CORS for Your Frontend

```javascript
const rest = new RESTModule({
  port: 3000,
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
  }
});
```

### Adding Rate Limiting

```javascript
const rest = new RESTModule({
  port: 3000,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
  }
});
```

### Using Real Database (PostgreSQL)

```javascript
const { DatabaseModule } = require('domainhive-framework');

const db = new DatabaseModule({
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'hackathon_db',
  username: 'postgres',
  password: 'password'
});

await db.connect();

// Query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Using Redis Cache

```javascript
const cache = new CacheModule({
  type: 'redis',
  redis: {
    host: 'localhost',
    port: 6379
  }
});

await cache.connect();
```

## 🏅 Pro Tips for Hackathons

1. **Start with the example server**: Run `npm run server` and customize from there
2. **Use in-memory cache**: Perfect for demos, no Redis setup needed
3. **Test users**: Create demo users during initialization for quick testing
4. **WebSocket for wow factor**: Real-time updates impress judges
5. **GraphQL for flexibility**: Judges love seeing GraphQL in action
6. **Keep it simple**: Use memory cache and simple auth for the hackathon
7. **Focus on features**: Let DomainHive handle the infrastructure
8. **Document your API**: Use the built-in endpoint logging
9. **Error handling**: Framework handles errors - you focus on logic
10. **Deploy ready**: Works with Heroku, Render, Railway out of the box

## 📚 Additional Resources

- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Usage Guide](./USAGE_GUIDE.md) - Complete API documentation
- [Features List](./FEATURES.md) - All available features
- [Examples](./src/examples/) - Working code examples

## 🆘 Common Issues

### Port already in use?

```javascript
const rest = new RESTModule({ port: 3001 }); // Try different port
const ws = new WebSocketModule({ port: 8081 });
```

### Need to clear cache?

```javascript
await cache.clear(); // Clear all cached data
```

### WebSocket not connecting?

Make sure to use the correct protocol:
- Browser: `ws://localhost:8080/ws`
- With HTTPS: `wss://yourdomain.com/ws`

## 🎉 Good Luck!

With DomainHive, you can focus on building unique features that win hackathons instead of wasting time on boilerplate code. Happy hacking! 🚀
