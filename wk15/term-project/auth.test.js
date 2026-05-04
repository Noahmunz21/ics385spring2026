const request = require('supertest');
const app = require('../server');

test('AC-6: GET /admin/dashboard redirects unauthenticated to /admin/login', async () => {
  const res = await request(app).get('/admin/dashboard');
  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe('/admin/login');
});

test('AC-4: POST /admin/login with wrong password redirects back to login', async () => {
  const res = await request(app)
    .post('/admin/login')
    .send({ email: 'admin@hanahideaway.com', password: 'wrongpassword' });
  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toContain('/admin/login');
});

test('AC-8: GET /admin/dashboard does not expose admin content when unauthenticated', async () => {
  const res = await request(app).get('/admin/dashboard');
  expect(res.statusCode).toBe(302);
  expect(res.text).not.toContain('Admin Dashboard');
});
