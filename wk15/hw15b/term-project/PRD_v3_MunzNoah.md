# PRD v3 — Hana Hideaway B&B
**Student:** Noah Munz | **Island:** Maui | **Date:** May 1, 2026

> Full formatted PRD available as PRD_v3_MunzNoah.pdf in this folder.
> This Markdown file serves as the editable source reference.

## Key Sections
- §1 Problem Statement & Target User
- §2 Functional Requirements (R1–R10)
- §3 Technical Architecture
- §4 Authentication & Security (7 questions + OWASP mapping)
- §5 Acceptance Criteria (8 AC in GWT format + 3 Jest tests)
- §6 Progress Weeks 10–16
- §7 AI Attribution — Claude (Anthropic)

## Jest Test Results

## Test Scripts (tests/auth.test.js)


```javascript
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


```

![Jest Test Output]
<img width="657" height="367" alt="Screenshot 2026-05-01 at 5 40 05 PM" src="https://github.com/user-attachments/assets/66eb3de2-c43c-4f8b-9441-4da915824bad" />
