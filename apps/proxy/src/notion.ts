import {
  careerSchema,
  honorSchema,
  personSchema,
  statisticSchema,
  timelineSchema,
  type CareerRecord,
  type Honor,
  type Person,
  type Statistic,
  type TimelineEvent,
} from '@legend/shared';

const notionVersion = () => process.env.NOTION_VERSION ?? '2025-09-03';
const requestTimeout = () => Number(process.env.REQUEST_TIMEOUT_MS ?? 10_000);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const richText = (property: any) =>
  property?.rich_text?.map((item: any) => item.plain_text).join('') ?? '';
const title = (property: any) =>
  property?.title?.map((item: any) => item.plain_text).join('') ?? '';
const plainText = (property: any) => richText(property) || title(property);
const number = (property: any) => property?.number ?? undefined;
const select = (property: any) => property?.select?.name ?? '';

export async function notionRequest(path: string, init: RequestInit = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN is not configured');

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`https://api.notion.com/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': notionVersion(),
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(requestTimeout()),
    });

    if (response.ok) return response.json() as Promise<any>;

    if (response.status !== 429 || attempt === 3) {
      throw new Error(`Notion request failed: ${response.status}`);
    }

    const retryAfter = Number(response.headers.get('retry-after') ?? 2);
    await sleep(retryAfter * 1_000 * 2 ** attempt);
  }

  throw new Error('Notion request exhausted retries');
}

export async function queryDataSource(dataSourceId: string, filter?: unknown) {
  if (!dataSourceId) throw new Error('Notion data source id is not configured');
  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const result = await notionRequest(`/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: JSON.stringify({ ...(filter ? { filter } : {}), ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    results.push(...(result.results ?? []));
    cursor = result.has_more ? result.next_cursor : undefined;
  } while (cursor);

  return results;
}

export function mapNotionPerson(page: any): Person {
  const properties = page.properties ?? {};
  const slug = plainText(properties.Slug);
  return personSchema.parse({
    id: page.id,
    slug,
    nameZh: plainText(properties.NameZh) || title(properties.Name),
    nameEn: plainText(properties.NameEn),
    nickname: plainText(properties.Nickname),
    category: select(properties.Category) || 'football',
    nationality: select(properties.Nationality) || plainText(properties.Nationality),
    birthDate: properties.BirthDate?.date?.start ?? '',
    deathDate: properties.DeathDate?.date?.start ?? undefined,
    birthPlace: plainText(properties.BirthPlace),
    summary: plainText(properties.Summary),
    biography: plainText(properties.Biography),
    avatarUrl: `/api/v1/media/people/${slug}/avatar`,
    coverUrl: `/api/v1/media/people/${slug}/hero`,
    status: select(properties.Status) || 'active',
    featured: properties.Featured?.checkbox ?? false,
    keywords: properties.Keywords?.multi_select?.map((item: any) => item.name) ?? [],
    views: number(properties.Views) ?? 0,
  });
}

export function mapNotionCareer(page: any): CareerRecord {
  const p = page.properties ?? {};
  return careerSchema.parse({
    id: plainText(p.Id) || page.id,
    personSlug: plainText(p.PersonSlug),
    organization: plainText(p.Organization),
    role: plainText(p.Role),
    startDate: p.StartDate?.date?.start ?? '',
    endDate: p.EndDate?.date?.start ?? undefined,
    appearances: number(p.Appearances),
    goals: number(p.Goals),
    assists: number(p.Assists),
    description: plainText(p.Description),
  });
}

export function mapNotionStatistic(page: any): Statistic {
  const p = page.properties ?? {};
  const extraText = plainText(p.Extra);
  let extra: Record<string, unknown> = {};
  try { extra = extraText ? JSON.parse(extraText) : {}; } catch { extra = { note: extraText }; }
  return statisticSchema.parse({
    id: plainText(p.Id) || page.id,
    personSlug: plainText(p.PersonSlug),
    season: plainText(p.Season),
    team: plainText(p.Team),
    competition: plainText(p.Competition),
    appearances: number(p.Appearances) ?? 0,
    goals: number(p.Goals) ?? 0,
    assists: number(p.Assists) ?? 0,
    extra,
  });
}

export function mapNotionHonor(page: any): Honor {
  const p = page.properties ?? {};
  return honorSchema.parse({
    id: plainText(p.Id) || page.id,
    personSlug: plainText(p.PersonSlug),
    year: number(p.Year) ?? (Number(plainText(p.Year)) || 0),
    category: plainText(p.Category) || select(p.Category),
    organization: plainText(p.Organization),
    count: number(p.Count) ?? 1,
    description: plainText(p.Description),
    featured: p.Featured?.checkbox ?? false,
  });
}

export function mapNotionTimeline(page: any): TimelineEvent {
  const p = page.properties ?? {};
  const eventDate = p.EventDate?.date?.start ?? '';
  const id = plainText(p.Id) || page.id;
  return timelineSchema.parse({
    id,
    personSlug: plainText(p.PersonSlug),
    eventDate,
    year: number(p.Year) ?? (Number(eventDate.slice(0, 4)) || 0),
    eventType: plainText(p.EventType) || select(p.EventType),
    title: plainText(p.Title) || title(p.Name),
    description: plainText(p.Description),
    imageUrl: `/api/v1/media/timeline/${id}`,
    relatedUrl: p.SourceUrl?.url ?? undefined,
  });
}

const publishedFilter = { property: 'Published', checkbox: { equals: true } };
export const queryPeople = async () =>
  (await queryDataSource(process.env.NOTION_PEOPLE_DATA_SOURCE_ID ?? '', publishedFilter)).map(mapNotionPerson);
export const queryCareers = async () =>
  (await queryDataSource(process.env.NOTION_CAREER_DATA_SOURCE_ID ?? '')).map(mapNotionCareer);
export const queryStatistics = async () =>
  (await queryDataSource(process.env.NOTION_STATISTICS_DATA_SOURCE_ID ?? '')).map(mapNotionStatistic);
export const queryHonors = async () =>
  (await queryDataSource(process.env.NOTION_HONORS_DATA_SOURCE_ID ?? '')).map(mapNotionHonor);
export const queryTimeline = async () =>
  (await queryDataSource(process.env.NOTION_TIMELINE_DATA_SOURCE_ID ?? '')).map(mapNotionTimeline);
