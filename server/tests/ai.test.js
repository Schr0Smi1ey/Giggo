import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret';

const { createApp } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { AIAnalysis } = await import('../src/models/AIAnalysis.js');
const { ClientProfile } = await import('../src/models/ClientProfile.js');
const { FreelancerProfile } = await import('../src/models/FreelancerProfile.js');
const { RefreshToken } = await import('../src/models/RefreshToken.js');
const { User } = await import('../src/models/User.js');

const app = createApp();

before(async () => connectDB());
beforeEach(async () => {
  await Promise.all([AIAnalysis.deleteMany({}), User.deleteMany({}), RefreshToken.deleteMany({}), FreelancerProfile.deleteMany({}), ClientProfile.deleteMany({})]);
});
after(async () => disconnectDB());

async function register(role, email) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: `${role} tester`, email, password: 'StrongPass1', role })
    .expect(201);
  return { token: response.body.data.accessToken, user: response.body.data.user };
}

const cvText = `
Alex Developer
alex@example.com | github.com/alex
Summary
Full-stack developer with 4 years of experience building web applications.
Skills
JavaScript, TypeScript, React, Node.js, Express, MongoDB, Docker, Git
Experience
Built 12 client projects and improved dashboard load time by 40%.
Education
Bachelor of Computer Science
`;

test('freelancers can analyze text, reuse cached results, and apply suggested skills', async () => {
  const { token } = await register('freelancer', 'ai.freelancer@example.com');
  await request(app).get('/api/profiles/me').set('Authorization', `Bearer ${token}`).expect(200);
  const first = await request(app).post('/api/ai/cv/analyze').set('Authorization', `Bearer ${token}`).send({ text: cvText }).expect(201);
  const analysis = first.body.data.analysis;
  assert.equal(analysis.provider, 'mock');
  assert.equal(analysis.result.seniority, 'mid');
  assert.ok(analysis.result.detectedSkills.includes('react'));

  const cached = await request(app).post('/api/ai/cv/analyze').set('Authorization', `Bearer ${token}`).send({ text: cvText }).expect(201);
  assert.equal(cached.body.data.analysis._id, analysis._id);

  const history = await request(app).get('/api/ai/cv/analyses?limit=10').set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(history.body.data.pagination.total, 1);

  const applied = await request(app).post(`/api/ai/cv/analyses/${analysis._id}/apply-skills`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.ok(applied.body.data.added.length > 0);
  assert.ok(applied.body.data.profile.skills.some((skill) => skill.toLowerCase() === 'react'));
});

test('uploaded text CVs can be analyzed and removed privately', async () => {
  const { token } = await register('freelancer', 'ai.upload@example.com');
  const upload = await request(app)
    .post('/api/profiles/me/cv')
    .set('Authorization', `Bearer ${token}`)
    .attach('document', Buffer.from(cvText), { filename: 'alex-cv.txt', contentType: 'text/plain' })
    .expect(200);
  assert.equal(upload.body.data.profile.cv.filename, 'alex-cv.txt');
  assert.equal('path' in upload.body.data.profile.cv, false);

  const analyzed = await request(app).post('/api/ai/cv/analyze').set('Authorization', `Bearer ${token}`).send({}).expect(201);
  assert.equal(analyzed.body.data.analysis.source.kind, 'cv_file');

  await request(app).delete('/api/profiles/me/cv').set('Authorization', `Bearer ${token}`).expect(200);
  const current = await request(app).get('/api/profiles/me').set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(current.body.data.profile.cv.filename, '');
});

test('clients cannot access freelancer-only AI or CV endpoints', async () => {
  const { token } = await register('client', 'ai.client@example.com');
  await request(app).post('/api/ai/cv/analyze').set('Authorization', `Bearer ${token}`).send({ text: cvText }).expect(403);
  await request(app).post('/api/profiles/me/cv').set('Authorization', `Bearer ${token}`).attach('document', Buffer.from(cvText), { filename: 'cv.txt', contentType: 'text/plain' }).expect(403);
});
