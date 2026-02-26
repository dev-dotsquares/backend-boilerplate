import supertest from 'supertest';
import { app } from '../src/app';

const request = supertest(app);

describe('Health Check', () => {
  it('GET /health should return 200 with success response', async () => {
    const res = await request.get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Service is healthy',
    });
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('should include x-request-id header in response', async () => {
    const res = await request.get('/health');

    expect(res.headers).toHaveProperty('x-request-id');
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('should echo back provided x-request-id', async () => {
    const customId = 'test-request-id-123';
    const res = await request.get('/health').set('x-request-id', customId);

    expect(res.headers['x-request-id']).toBe(customId);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request.get('/api/v1/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
    });
  });
});

describe('User API - Validation', () => {
  it('POST /api/v1/users should reject missing fields', async () => {
    const res = await request.post('/api/v1/users').send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('POST /api/v1/users should reject invalid email', async () => {
    const res = await request
      .post('/api/v1/users')
      .send({ email: 'not-an-email', name: 'Test', password: 'password123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/users should reject short password', async () => {
    const res = await request
      .post('/api/v1/users')
      .send({ email: 'test@example.com', name: 'Test', password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth API - Validation', () => {
  it('POST /api/v1/auth/register should reject missing fields', async () => {
    const res = await request.post('/api/v1/auth/register').send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login should reject missing password', async () => {
    const res = await request.post('/api/v1/auth/login').send({ email: 'test@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should reject unauthenticated request', async () => {
    const res = await request.get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
