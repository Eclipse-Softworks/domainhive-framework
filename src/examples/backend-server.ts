import {
  DomainHive,
  RESTModule,
  GraphQLModule,
  WebSocketModule,
  DatabaseModule,
  CacheModule,
  AuthModule,
  logger
} from '../index';
import { GraphQLString, GraphQLObjectType, GraphQLList } from 'graphql';

async function main() {
  logger.info('Starting DomainHive Backend Server Example');

  const hive = DomainHive.getInstance();
  hive.setConfig({
    app: {
      name: 'DomainHive Backend',
      version: '1.0.0',
      environment: 'development'
    }
  });

  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  hive.registerModule('cache', cache);
  logger.info('Cache module initialized');

  const auth = new AuthModule({
    secretKey: 'demo-secret-key',
    tokenExpiration: 3600
  });
  hive.registerModule('auth', auth);
  logger.info('Auth module initialized');

  await auth.register('admin', 'admin@example.com', 'admin123', ['admin', 'user']);
  await auth.register('user', 'user@example.com', 'user123', ['user']);
  logger.info('Demo users created');

  const rest = new RESTModule({
    port: 3000,
    cors: { origin: '*' },
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
  });
  hive.registerModule('rest', rest);

  rest.on('request', (info) => {
    logger.info('REST Request', info);
  });

  rest.addRoute({
    method: 'GET',
    path: '/health',
    handler: (req, res) => {
      res.json({ status: 'healthy', timestamp: Date.now() });
    }
  });

  rest.addRoute({
    method: 'POST',
    path: '/auth/login',
    handler: async (req, res) => {
      try {
        const { username, password } = req.body;
        const result = await auth.login(username, password);
        res.json({ success: true, ...result });
      } catch (error: any) {
        res.status(401).json({ success: false, error: error.message });
      }
    }
  });

  rest.addRoute({
    method: 'GET',
    path: '/auth/verify',
    handler: async (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }
        const user = await auth.verifyAuth(token);
        res.json({ valid: true, user });
      } catch (error: any) {
        res.status(401).json({ valid: false, error: error.message });
      }
    }
  });

  const apiRouter = rest.createRouter({ prefix: '/api' });

  apiRouter.get('/users', async (req, res) => {
    const cachedUsers = await cache.get('users');
    if (cachedUsers) {
      return res.json({ users: cachedUsers, source: 'cache' });
    }

    const users = [
      { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: '2', name: 'Regular User', email: 'user@example.com', role: 'user' }
    ];

    await cache.set('users', users, 60);
    res.json({ users, source: 'fresh' });
  });

  apiRouter.post('/data', async (req, res) => {
    const data = req.body;
    await cache.set(`data:${Date.now()}`, data, 3600);
    res.status(201).json({ success: true, data });
  });

  const graphql = new GraphQLModule({ graphiql: true });

  const UserType = graphql.addType({
    name: 'User',
    fields: {
      id: { type: GraphQLString },
      username: { type: GraphQLString },
      email: { type: GraphQLString },
      roles: { type: new GraphQLList(GraphQLString) }
    }
  });

  graphql.addQuery('users', {
    type: new GraphQLList(UserType),
    resolve: async () => {
      return [
        { id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin', 'user'] },
        { id: '2', username: 'user', email: 'user@example.com', roles: ['user'] }
      ];
    }
  });

  graphql.addQuery('user', {
    type: UserType,
    args: {
      username: { type: GraphQLString }
    },
    resolve: async (parent: any, args: any) => {
      const user = auth.getUserByUsername(args.username);
      return user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      } : null;
    }
  });

  rest.useAt('/graphql', graphql.getMiddleware());
  logger.info('GraphQL endpoint configured at /graphql');

  const ws = new WebSocketModule({
    port: 8080,
    path: '/ws'
  });
  hive.registerModule('websocket', ws);

  ws.on('connection', ({ connectionId, info }) => {
    logger.info(`WebSocket client connected: ${connectionId}`);
    ws.send(connectionId, {
      type: 'welcome',
      data: { message: 'Connected to DomainHive WebSocket server', connectionId }
    });
  });

  ws.onMessage('ping', (data, connectionId) => {
    ws.send(connectionId, { type: 'pong', data: { timestamp: Date.now() } });
  });

  ws.onMessage('broadcast', (data, connectionId) => {
    const messageCount = ws.broadcast({
      type: 'message',
      data: { ...data, from: connectionId }
    }, connectionId);
    logger.info(`Broadcast message to ${messageCount} clients`);
  });

  ws.on('disconnection', ({ connectionId }) => {
    logger.info(`WebSocket client disconnected: ${connectionId}`);
  });

  await rest.start();
  logger.info('REST API server started on http://0.0.0.0:3000');
  logger.info('GraphQL endpoint available at http://0.0.0.0:3000/graphql');

  await ws.start();
  logger.info('WebSocket server started on ws://0.0.0.0:8080/ws');

  logger.info('=== Backend Server Ready ===');
  logger.info('REST API: http://localhost:3000');
  logger.info('  - GET  /health');
  logger.info('  - POST /auth/login');
  logger.info('  - GET  /auth/verify');
  logger.info('  - GET  /api/users');
  logger.info('  - POST /api/data');
  logger.info('GraphQL: http://localhost:3000/graphql');
  logger.info('WebSocket: ws://localhost:8080/ws');
  logger.info('');
  logger.info('Test credentials:');
  logger.info('  Username: admin, Password: admin123');
  logger.info('  Username: user, Password: user123');
}

main().catch(error => {
  logger.error('Failed to start backend server', { error });
  process.exit(1);
});
