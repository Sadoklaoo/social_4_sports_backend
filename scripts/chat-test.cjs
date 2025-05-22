// chat-test.cjs
const { io }     = require('socket.io-client');
const fetch      = global.fetch || require('node-fetch');
const API_URL    = 'http://localhost:3000';
const ADMIN_JWT  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhhNWUyZThhMmUwODViZGVmNmRkZiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDc3NjI2ODgsImV4cCI6MTc0Nzc2NjI4OH0.o9OQn6h84aIpVLBxy8a30WJvVuKevZyDrjeURmGUoYg';
const ALICE_JWT  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhhNmYwZThhMmUwODViZGVmNmRlNSIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDc3NjQ4NTMsImV4cCI6MTc0Nzc2ODQ1M30.9y5AFZEHphySbZX6wbk78MRmiXGTCrrWT8ps1axXP6s';
const ALICE_ID   = '6828a6f0e8a2e085bdef6de5';

function startClient(name, token) {
  const socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 2,
    timeout: 2000,
  });

  socket.on('connect', () => console.log(`✅ ${name} connected`));
  socket.on('connect_error', err => console.error(`❌ ${name} connect_error:`, err.message));
  socket.on('new_message', msg => console.log(`[${name} RECEIVED new_message]`, msg));
  socket.on('typing', data => console.log(`[${name} RECEIVED typing] from ${data.from}`));
  socket.on('stop_typing', data => console.log(`[${name} RECEIVED stop_typing] from ${data.from}`));
  socket.on('message_read', info => console.log(`[${name} RECEIVED message_read]`, info));
  socket.on('disconnect', reason => console.log(`⚠️  ${name} disconnected: ${reason}`));

  return socket;
}

(async () => {
  // 1) Connect both clients
  const admin = startClient('Admin', ADMIN_JWT);
  const alice = startClient('Alice', ALICE_JWT);

  // wait for them to connect
  await new Promise(r => setTimeout(r, 1000));

  // 2) Admin "typing" → "stop_typing"
  console.log('[Admin EMIT typing]');
  admin.emit('typing', ALICE_ID);
  await new Promise(r => setTimeout(r, 500));
  console.log('[Admin EMIT stop_typing]');
  admin.emit('stop_typing', ALICE_ID);

  // 3) Admin sends a message to Alice
  console.log('[Admin EMIT private_message] Hello Alice!');
  admin.emit('private_message', { to: ALICE_ID, content: 'Hello Alice!' });

  
  // wait for message round-trip
  await new Promise(r => setTimeout(r, 1000));

  // 4) Admin marks conversation as read
  console.log('[Alice EMIT mark_read]');
  alice.emit('mark_read', { peerId: ALICE_ID });

  // wait for receipt event
  await new Promise(r => setTimeout(r, 500));

  // 5) Fetch conversation via REST (latest)
  console.log('\n📝 Fetching full conversation (REST)...');
  let res = await fetch(`${API_URL}/api/messages/${ALICE_ID}`, {
    headers: { Authorization: `Bearer ${ADMIN_JWT}` }
  });
  let data = await res.json();
  console.log(data);

  if (data.length > 0) {
    // 6) Test pagination: messages before the first item’s createdAt
    const before = data[0].createdAt;
    console.log(`\n📝 Fetching paginated (before=${before}, limit=1)`);
    res = await fetch(`${API_URL}/api/messages/${ALICE_ID}?before=${encodeURIComponent(before)}&limit=1`, {
      headers: { Authorization: `Bearer ${ADMIN_JWT}` }
    });
    const page = await res.json();
    console.log(page);
  }

  // 7) Tear down
  setTimeout(() => {
    admin.disconnect();
    alice.disconnect();
    process.exit(0);
  }, 1000);
})();
