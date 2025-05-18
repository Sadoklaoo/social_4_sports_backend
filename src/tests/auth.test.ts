import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index'; // assume you export your Express app (not server.listen)
import User from '../models/User'; // adjust the path to your User model
describe('Auth API', () => {
  const api = request(app);

  beforeAll(async () => {
    // Connect to test DB
    await mongoose.connect(process.env.MONGODB_URI_TEST!);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  const userData = {
    email: 'testuser@example.com',
    password: 'SecurePass123!',
    avatar: 'https://example.com/avatar.png',
    skillLevel: 'intermediate',
    location: { type: 'Point', coordinates: [19.040236, 47.497912] }
  };

  it('should signup a new user', async () => {
    const res = await api
      .post('/api/auth/signup')
      .send(userData)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', userData.email);
  });

  it('should not signup with duplicate email', async () => {
    await api.post('/api/auth/signup').send(userData);
    const res = await api
      .post('/api/auth/signup')
      .send(userData)
      .expect(409);

    expect(res.body.error).toHaveProperty('message');
  });

  it('should login an existing user', async () => {
    // First sign up
    await api.post('/api/auth/signup').send(userData);

    const res = await api
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    await api.post('/api/auth/signup').send(userData);

    const res = await api
      .post('/api/auth/login')
      .send({ email: userData.email, password: 'WrongPass' })
      .expect(401);

    expect(res.body.error).toHaveProperty('message');
  });

  it('should get current user profile with valid token', async () => {
    await api.post('/api/auth/signup').send(userData);
    const loginRes = await api.post('/api/auth/login').send({ email: userData.email, password: userData.password });
    const token = loginRes.body.accessToken;

    const res = await api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', userData.email);
  });

  it('should reject /me without token', async () => {
    await api.get('/api/auth/me').expect(401);
  });
});
