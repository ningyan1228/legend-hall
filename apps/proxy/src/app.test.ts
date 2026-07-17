import { beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

beforeAll(() => { process.env.USE_MOCK_DATA = 'true'; });

describe('proxy API', () => {
  it('returns people with a unified response', async () => {
    const app = await buildApp();
    const response = await app.inject('/api/v1/people?pageSize=2');
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBeGreaterThan(10);
    await app.close();
  });

  it('returns an aggregate person detail payload', async () => {
    const app = await buildApp();
    const response = await app.inject('/api/v1/people/lionel-messi/detail');
    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.data.person.slug).toBe('lionel-messi');
    expect(body.data.timeline.length).toBeGreaterThan(0);
    await app.close();
  });

  it('serves a local silhouette when Notion media is unavailable', async () => {
    const app = await buildApp();
    const response = await app.inject('/api/v1/media/people/lionel-messi/hero');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.body).toContain('<svg');
    await app.close();
  });
});
