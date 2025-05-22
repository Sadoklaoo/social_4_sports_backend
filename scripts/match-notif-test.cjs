// match-full-test.cjs
const { io } = require('socket.io-client');
const fetch  = require('node-fetch');

const API        = 'http://localhost:3000';
const INIT_JWT   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhhNWUyZThhMmUwODViZGVmNmRkZiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDc2ODg0NTcsImV4cCI6MTc0NzY5MjA1N30.6F7U4CQDw1i6N5NA2fppn2zTHpyY7YSMSUTQEbsytss';    // your initiator’s token
const OPP_JWT    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjhhNmYwZThhMmUwODViZGVmNmRlNSIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDc2ODg0NzgsImV4cCI6MTc0NzY5MjA3OH0._H0AKlgG1WRm_m-6pmb5YGkql3_s2gVWcz-rKmR2wYw';     // your opponent’s token
const OPP_ID     = '6828a6f0e8a2e085bdef6de5'; // the opponent’s userId

function client(name, token) {
  const s = io(API, { auth:{ token }, transports:['websocket'] });
  s.on('connect',      () => console.log(`✅ ${name} connected`));
  s.on('notification', n => console.log(`[${name} NOTIF]`, n.type, n.payload));
  return s;
}

(async () => {
  const initiator = client('Initiator', INIT_JWT);
  const opponent  = client('Opponent',  OPP_JWT);

  await new Promise(r => setTimeout(r, 500));

  // 1) Schedule a match
  console.log('\n→ POST /api/matches');
  let res = await fetch(`${API}/api/matches`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${INIT_JWT}`
    },
    body: JSON.stringify({
      opponent:    OPP_ID,
      location:    'Court A',
      scheduledFor: new Date(Date.now() + 3600000) // 1h from now
    })
  });
  const match = await res.json();
  console.log('Scheduled match _id=', match._id);
  await new Promise(r => setTimeout(r, 500));

  // 2) Opponent confirms the invite
  console.log('\n→ PUT /api/matches/:id/confirm');
  res = await fetch(`${API}/api/matches/${match._id}/confirm`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${OPP_JWT}` }
  });
  console.log('Confirm status:', res.status);
  await new Promise(r => setTimeout(r, 500));

  // 3) Initiator reschedules
  console.log('\n→ PUT /api/matches/:id/reschedule');
  res = await fetch(`${API}/api/matches/${match._id}/reschedule`, {
    method: 'PUT',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${INIT_JWT}`
    },
    body: JSON.stringify({
      scheduledFor: new Date(Date.now() + 7200000) // 2h from now
    })
  });
  console.log('Reschedule status:', res.status);
  await new Promise(r => setTimeout(r, 500));

  // 4) Opponent confirms the new date
  console.log('\n→ PUT /api/matches/:id/confirm (reschedule)');
  res = await fetch(`${API}/api/matches/${match._id}/confirm`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${OPP_JWT}` }
  });
  console.log('Re-confirm status:', res.status);
  await new Promise(r => setTimeout(r, 500));

  // 5) Initiator completes the match
  console.log('\n→ PUT /api/matches/:id/complete');
  res = await fetch(`${API}/api/matches/${match._id}/complete`, {
    method: 'PUT',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${INIT_JWT}`
    },
    body: JSON.stringify({
      score:  ['11-9','9-11','11-7'],
      result: 'Win'
    })
  });
  console.log('Complete status:', res.status);
  await new Promise(r => setTimeout(r, 500));

  // 6) Initiator schedules a second match for a decline test
  console.log('\n→ POST /api/matches (2nd match)');
  res = await fetch(`${API}/api/matches`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${INIT_JWT}`
    },
    body: JSON.stringify({
      opponent:    OPP_ID,
      location:    'Court B',
      scheduledFor: new Date(Date.now() + 3600000)
    })
  });
  const match2 = await res.json();
  console.log('Scheduled 2nd match id=', match2._id);
  await new Promise(r => setTimeout(r, 500));

  // 7) Opponent confirms the 2nd invite
  console.log('\n→ PUT /api/matches/:id/confirm (2nd match)');
  await fetch(`${API}/api/matches/${match2._id}/confirm`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${OPP_JWT}` }
  });
  await new Promise(r => setTimeout(r, 500));

  // 8) Opponent cancels (declines) the confirmed 2nd match
  console.log('\n→ DELETE /api/matches/:id (decline)');
  res = await fetch(`${API}/api/matches/${match2._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${OPP_JWT}` }
  });
  console.log('Decline status:', res.status);
  await new Promise(r => setTimeout(r, 500));

  // Tear down
  initiator.disconnect();
  opponent.disconnect();
  process.exit(0);
})();
