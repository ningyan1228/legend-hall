import { queryDataSource } from './notion.js';

type MediaKind = 'avatar' | 'hero' | 'card';
type ResolvedMedia = {
  url: string;
  expiresAt: number;
  contentType: string;
  lastFetchedAt: number;
};

const FIVE_MINUTES = 5 * 60 * 1_000;
const EXTERNAL_TTL = 30 * 60 * 1_000;

const contentTypeFromUrl = (url: string) => {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.gif')) return 'image/gif';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
};

const firstFile = (page: any, propertyName: string) => page?.properties?.[propertyName]?.files?.[0];

export class MediaService {
  private cache = new Map<string, ResolvedMedia>();
  private pending = new Map<string, Promise<ResolvedMedia>>();

  private async resolve(key: string, loader: () => Promise<any>): Promise<ResolvedMedia> {
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt - FIVE_MINUTES > now) return cached;

    const active = this.pending.get(key);
    if (active) return active;

    const request = loader().then((file) => {
      const isExternal = file?.type === 'external';
      const url = isExternal ? file.external?.url : file?.file?.url;
      if (!url) throw new Error(`No usable media file for ${key}`);
      const notionExpiry = file?.file?.expiry_time ? Date.parse(file.file.expiry_time) : undefined;
      const value: ResolvedMedia = {
        url,
        expiresAt: notionExpiry ?? now + EXTERNAL_TTL,
        contentType: contentTypeFromUrl(url),
        lastFetchedAt: now,
      };
      this.cache.set(key, value);
      return value;
    }).finally(() => this.pending.delete(key));

    this.pending.set(key, request);
    return request;
  }

  async person(slug: string, kind: MediaKind) {
    const dataSourceId = process.env.NOTION_PEOPLE_DATA_SOURCE_ID ?? '';
    const propertyName = { avatar: 'Avatar', hero: 'HeroImage', card: 'CardImage' }[kind];
    return this.resolve(`people:${slug}:${kind}`, async () => {
      const pages = await queryDataSource(dataSourceId, {
        property: 'Slug', rich_text: { equals: slug },
      });
      return firstFile(pages[0], propertyName);
    });
  }

  async item(collection: 'timeline' | 'honors' | 'news', id: string) {
    const config = {
      timeline: [process.env.NOTION_TIMELINE_DATA_SOURCE_ID ?? '', 'Image'],
      honors: [process.env.NOTION_HONORS_DATA_SOURCE_ID ?? '', 'Image'],
      news: [process.env.NOTION_NEWS_DATA_SOURCE_ID ?? '', 'Image'],
    } as const;
    const [dataSourceId, propertyName] = config[collection];
    return this.resolve(`${collection}:${id}`, async () => {
      const pages = await queryDataSource(dataSourceId, {
        property: 'Id', rich_text: { equals: id },
      });
      return firstFile(pages[0], propertyName);
    });
  }
}

export const defaultSilhouette = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="人物图片暂不可用">
  <rect width="800" height="1000" fill="#101614"/>
  <circle cx="400" cy="330" r="145" fill="#68726c"/>
  <path d="M125 950c24-260 122-390 275-390s251 130 275 390" fill="#68726c"/>
</svg>`;
