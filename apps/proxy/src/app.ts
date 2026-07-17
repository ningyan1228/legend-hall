import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { cached } from './cache.js';
import { careers, honors, news, people as mockPeople, statistics, timeline } from './mock.js';
import { MediaService, defaultSilhouette } from './media-service.js';
import {
  queryCareers,
  queryHonors,
  queryPeople,
  queryStatistics,
  queryTimeline,
} from './notion.js';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  nationality: z.string().optional(),
  keyword: z.string().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

export async function buildApp() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' }, bodyLimit: 64 * 1024 });
  await app.register(helmet);
  await app.register(cors, {
    origin: (origin, callback) => {
      const allowed = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4321').split(',');
      callback(null, !origin || allowed.includes(origin));
    },
  });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 300) * 1_000;
  const useMock = process.env.USE_MOCK_DATA !== 'false';
  const dataSource = async <T>(key: string, fallback: T[], loader: () => Promise<T[]>) => {
    if (useMock) return { value: fallback, cached: true, stale: false };
    try {
      return await cached(key, ttl, loader);
    } catch (error) {
      app.log.warn({ err: error, key }, 'Notion unavailable; using explicit mock fallback');
      return { value: fallback, cached: false, stale: true };
    }
  };

  const getPeople = () => dataSource('people:v2', mockPeople, queryPeople);
  const getCareers = () => dataSource('careers:v2', careers, queryCareers);
  const getStatistics = () => dataSource('statistics:v2', statistics, queryStatistics);
  const getHonors = () => dataSource('honors:v2', honors, queryHonors);
  const getTimeline = () => dataSource('timeline:v2', timeline, queryTimeline);
  const media = new MediaService();

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
  app.get('/api/v1/config', async () => ({
    success: true,
    data: { mock: useMock, notionVersion: process.env.NOTION_VERSION ?? '2025-09-03' },
    meta: { cached: false },
  }));

  app.get('/api/v1/people', async (request, reply) => {
    const query = querySchema.safeParse(request.query);
    if (!query.success) return reply.code(400).send({ success: false, data: null, error: { code: 'INVALID_QUERY', message: '查询参数无效' } });
    const hit = await getPeople();
    let items = hit.value.filter((person) =>
      (!query.data.category || person.category === query.data.category) &&
      (!query.data.nationality || person.nationality === query.data.nationality) &&
      (!query.data.featured || person.featured === (query.data.featured === 'true')));
    if (query.data.keyword) {
      const keyword = query.data.keyword.toLowerCase();
      items = items.filter((person) =>
        [person.nameZh, person.nameEn, person.slug, person.nickname, person.nationality]
          .some((value) => value.toLowerCase().includes(keyword)));
    }
    const total = items.length;
    const start = (query.data.page - 1) * query.data.pageSize;
    return { success: true, data: items.slice(start, start + query.data.pageSize), meta: { page: query.data.page, pageSize: query.data.pageSize, total, cached: hit.cached, stale: hit.stale } };
  });

  app.get('/api/v1/search', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const query = z.object({ keyword: z.string().min(1).max(100) }).safeParse(request.query);
    if (!query.success) return reply.code(400).send({ success: false, data: null, error: { code: 'INVALID_QUERY', message: '请输入搜索词' } });
    const all = (await getPeople()).value;
    const keyword = query.data.keyword.toLowerCase();
    const score = (person: typeof all[number]) => person.nameZh === query.data.keyword ? 0 : person.nameEn.toLowerCase() === keyword ? 1 : person.slug === keyword ? 2 : person.nickname.includes(query.data.keyword) ? 3 : person.nameZh.includes(query.data.keyword) ? 4 : person.nameEn.toLowerCase().includes(keyword) ? 5 : 6;
    const data = all.filter((person) => score(person) < 6 || person.nationality.includes(query.data.keyword) || person.category === keyword).sort((a, b) => score(a) - score(b));
    return { success: true, data, meta: { total: data.length, cached: true } };
  });

  app.get('/api/v1/people/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const hit = await getPeople();
    const person = hit.value.find((item) => item.slug === slug);
    return person ? { success: true, data: person, meta: { cached: hit.cached, stale: hit.stale } } : reply.code(404).send({ success: false, data: null, error: { code: 'NOT_FOUND', message: '未找到该人物' } });
  });

  app.get('/api/v1/people/:slug/career', async (request) => {
    const { slug } = request.params as { slug: string };
    const hit = await getCareers();
    return { success: true, data: hit.value.filter((item) => item.personSlug === slug), meta: { cached: hit.cached, stale: hit.stale } };
  });
  app.get('/api/v1/people/:slug/statistics', async (request) => {
    const { slug } = request.params as { slug: string };
    const hit = await getStatistics();
    return { success: true, data: hit.value.filter((item) => item.personSlug === slug), meta: { cached: hit.cached, stale: hit.stale } };
  });
  app.get('/api/v1/people/:slug/honors', async (request) => {
    const { slug } = request.params as { slug: string };
    const hit = await getHonors();
    return { success: true, data: hit.value.filter((item) => item.personSlug === slug), meta: { cached: hit.cached, stale: hit.stale } };
  });
  app.get('/api/v1/people/:slug/timeline', async (request) => {
    const { slug } = request.params as { slug: string };
    const hit = await getTimeline();
    return { success: true, data: hit.value.filter((item) => item.personSlug === slug), meta: { cached: hit.cached, stale: hit.stale } };
  });

  app.get('/api/v1/people/:slug/detail', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const [peopleHit, careerHit, statisticsHit, honorsHit, timelineHit] = await Promise.all([
      getPeople(), getCareers(), getStatistics(), getHonors(), getTimeline(),
    ]);
    const person = peopleHit.value.find((item) => item.slug === slug);
    if (!person) return reply.code(404).send({ success: false, data: null, error: { code: 'NOT_FOUND', message: '未找到该人物' } });
    return {
      success: true,
      data: {
        person,
        career: careerHit.value.filter((item) => item.personSlug === slug),
        statistics: statisticsHit.value.filter((item) => item.personSlug === slug),
        honors: honorsHit.value.filter((item) => item.personSlug === slug),
        timeline: timelineHit.value.filter((item) => item.personSlug === slug),
      },
      meta: { cached: [peopleHit, careerHit, statisticsHit, honorsHit, timelineHit].every((hit) => hit.cached), stale: [peopleHit, careerHit, statisticsHit, honorsHit, timelineHit].some((hit) => hit.stale) },
    };
  });

  app.get('/api/v1/people/:slug/news', async (request) => {
    const { slug } = request.params as { slug: string };
    return { success: true, data: news.filter((item) => item.person === slug), meta: { cached: true } };
  });
  app.get('/api/v1/news', async () => ({ success: true, data: news, meta: { cached: true } }));
  app.get('/api/v1/news/latest', async () => ({ success: true, data: news, meta: { cached: true } }));
  app.get('/api/v1/people/:slug/media', async () => ({ success: true, data: [], meta: { cached: true } }));
  app.get('/api/v1/people/:slug/related', async () => ({ success: true, data: [], meta: { cached: true } }));

  const redirectOrFallback = async (reply: any, resolver: () => Promise<{ url: string }>) => {
    try {
      const resolved = await resolver();
      return reply.code(302).header('location', resolved.url).header('cache-control', 'public, max-age=300').send();
    } catch (error) {
      app.log.warn({ err: error }, 'Media resolution failed; serving local silhouette');
      return reply.code(200).type('image/svg+xml').header('cache-control', 'public, max-age=300').send(defaultSilhouette);
    }
  };
  app.get('/api/v1/media/people/:slug/:kind', async (request, reply) => {
    const parsed = z.object({ slug: z.string(), kind: z.enum(['avatar', 'hero', 'card']) }).safeParse(request.params);
    if (!parsed.success) return reply.code(404).send();
    return redirectOrFallback(reply, () => media.person(parsed.data.slug, parsed.data.kind));
  });
  for (const collection of ['timeline', 'honors', 'news'] as const) {
    app.get(`/api/v1/media/${collection}/:id`, async (request, reply) => {
      const { id } = request.params as { id: string };
      return redirectOrFallback(reply, () => media.item(collection, id));
    });
  }

  app.get('/api/v1/categories/:category', async (request) => {
    const { category } = request.params as { category: string };
    const hit = await getPeople();
    const data = hit.value.filter((person) => person.category === category);
    return { success: true, data, meta: { total: data.length, cached: hit.cached, stale: hit.stale } };
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'request failed');
    reply.code(502).send({ success: false, data: null, error: { code: 'UPSTREAM_REQUEST_FAILED', message: '人物数据暂时无法获取' } });
  });
  return app;
}
