// friend-notif-test.cjs
const { io }      = require('socket.io-client');
const fetch       = global.fetch || require('node-fetch');
const API_URL     = 'http://localhost:3000';
const ADMIN_JWT   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhhNWUyZThhMmUwODViZGVmNmRkZiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDc2ODE4NjIsImV4cCI6MTc0NzY4NTQ2Mn0.frSJjL5AWDIUMZBrhbpH3qvruxCm2ZbNkwneOmJIxwA';   // the user who will send the request
const ALICE_JWT   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhhNmYwZThhMmUwODViZGVmNmRlNSIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDc2ODE4MjgsImV4cCI6MTc0NzY4NTQyOH0.Z4TuBUlD3Sihm_Ovv_mXj26MOWjFpMMwrbXO7x6yLJI';   // the recipient
const ALICE_ID    = '6828a6f0e8a2e085bdef6de5';
const FRIENDS_ADD_URL     = `${API_URL}/api/friends/requests`;
const FRIENDS_RESPOND_URL = (requestId) => `${API_URL}/api/friends/requests/${requestId}`;

function startClient(name, token) {
  const socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  socket.on('connect',       () => console.log(`✅ ${name} connected`));
  socket.on('notification',  n => console.log(`[${name} NOTIFICATION]`, n));
  socket.on('disconnect',    () => console.log(`⚠️ ${name} disconnected`));
  return socket;
}

(async () => {
  // 1) Spin up both sockets
  const admin = startClient('Admin', ADMIN_JWT);
  let aliceReqId = null;
  const alice = io(API_URL, {
    auth: { token: ALICE_JWT },
    transports: ['websocket'],
  });
  alice.on('connect',       () => console.log(`✅ Alice connected`));
  alice.on('notification',  notif => {
    console.log(`[Alice NOTIFICATION]`, notif);
    if (notif.type === 'FriendRequest') {
      aliceReqId = notif.payload.requestId;
    }
  });

  // 2) Wait for connections
  await new Promise(r => setTimeout(r, 500));

  // 3) Admin → send friend request to Alice
  console.log('\n[Admin → POST /api/friends/requests]');
  console.log('→ URL:', FRIENDS_ADD_URL);
  let res = await fetch(FRIENDS_ADD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_JWT}`
    },
    body: JSON.stringify({ recipientId: ALICE_ID })
  });
  console.log('→ HTTP status:', res.status);

  // 4) Wait for Alice’s notification
  console.log('\n[Waiting for Alice to get the FriendRequest notification…]');
  await new Promise(r => setTimeout(r, 1000));

  // 5) Alice accepts the request via REST
  if (aliceReqId) {
    console.log(`\n[Alice → PUT ${FRIENDS_RESPOND_URL(aliceReqId)}]`);
    res = await fetch(FRIENDS_RESPOND_URL(aliceReqId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ALICE_JWT}`
      },
      body: JSON.stringify({ accept: true })
    });
    console.log('→ HTTP status:', res.status);
  } else {
    console.error('❌ No requestId captured from notification!');
  }

  // 6) Wait for Alice’s acceptance notification
  console.log('\n[Waiting for Admin to get the FriendRequestAccepted notification…]');
  await new Promise(r => setTimeout(r, 1000));

  // 7) Tear down
  admin.disconnect();
  alice.disconnect();
  process.exit(0);
})();
