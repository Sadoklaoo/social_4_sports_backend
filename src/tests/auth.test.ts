// src/tests/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app';
import User from '../models/User';

dotenv.config();
const API = request(app);
const TEST_URI = process.env.MONGODB_URI_TEST!;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  if (mongoose.connection.db) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch {
      /* ignore auth errors */
    }
  }
  await mongoose.disconnect();
});

describe('Auth API', () => {
  // fullName plus proper GeoJSON location
  const userData = {
    email: 'alice@test.com',
    password: 'Secret123!',
    fullName: 'Alice Anderson',
    location: {
      type: 'Point',
      // [longitude, latitude]
      coordinates: [ -71.456, 45.123 ]
    }
  };

  it('should signup a new user', async () => {
    const res = await API
      .post('/api/auth/signup')
      .send(userData)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', userData.email);
    expect(res.body).toHaveProperty('fullName', userData.fullName);
    // location should echo back GeoJSON
    expect(res.body).toHaveProperty('location.type', 'Point');
    expect(res.body).toHaveProperty('location.coordinates');
    expect(res.body.location.coordinates).toEqual(
      expect.arrayContaining(userData.location.coordinates)
    );
  });

  it('should not allow duplicate signup', async () => {
    await API.post('/api/auth/signup').send(userData).expect(201);

    const res = await API
      .post('/api/auth/signup')
      .send(userData)
      .expect(409);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('message');
  });

  it('should login with correct credentials', async () => {
    await API.post('/api/auth/signup').send(userData).expect(201);

    const res = await API
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    await API.post('/api/auth/signup').send(userData).expect(201);

    await API
      .post('/api/auth/login')
      .send({ email: userData.email, password: 'WrongPass!' })
      .expect(401);
  });

  it('should reject /me without token', async () => {
    await API.get('/api/auth/me').expect(401);
  });

  it('should return current user with valid token', async () => {
    await API.post('/api/auth/signup').send(userData).expect(201);
    const login = await API
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const res = await API
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', userData.email);
    expect(res.body).toHaveProperty('fullName', userData.fullName);
  });
});
