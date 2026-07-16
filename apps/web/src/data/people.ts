import type { Person } from '@legend/shared';

const avatarPath = (slug: string) => `/images/people/${slug}/avatar.jpg`;
const person = (
  slug: string,
  nameZh: string,
  nameEn: string,
  category: Person['category'],
  nationality: string,
  status: Person['status'] = 'active',
): Person => ({
  id: slug,
  slug,
  nameZh,
  nameEn,
  nickname: '',
  category,
  nationality,
  birthDate: '1980-01-01',
  birthPlace: '',
  summary: `${nameZh}是享誉世界的传奇人物。`,
  biography: `${nameZh}以卓越成就、持久影响力和独特风格成为时代代表人物。`,
  avatarUrl: avatarPath(slug),
  coverUrl: '',
  status,
  featured: true,
  keywords: [nameZh, nameEn],
  views: 0,
});

export const fallbackPeople: Person[] = [
  {
    ...person('lionel-messi', '梅西', 'Lionel Messi', 'football', '阿根廷'),
    birthDate: '1987-06-24',
    birthPlace: '罗萨里奥',
    summary: '阿根廷足球运动员，世界杯冠军、八次金球奖得主，被广泛视为足球史上最杰出的球员之一。',
    biography: '梅西出生于阿根廷罗萨里奥，少年时期加入巴塞罗那青训体系。他凭借盘带、组织和得分能力赢得众多荣誉，并于2022年带领阿根廷国家队夺得世界杯。',
  },
  person('cristiano-ronaldo', 'C罗', 'Cristiano Ronaldo', 'football', '葡萄牙'),
  person('pele', '贝利', 'Pelé', 'football', '巴西', 'deceased'),
  person('diego-maradona', '马拉多纳', 'Diego Maradona', 'football', '阿根廷', 'deceased'),
  person('neymar', '内马尔', 'Neymar', 'football', '巴西'),
  person('kylian-mbappe', '姆巴佩', 'Kylian Mbappé', 'football', '法国'),
  person('stephen-chow', '周星驰', 'Stephen Chow', 'film', '中国香港'),
  {
    ...person('joker-xue', '薛之谦', 'Joker Xue', 'music', '中国'),
    birthDate: '1983-07-17',
    birthPlace: '上海',
    summary: '中国内地创作男歌手、音乐制作人，以《认真的雪》《演员》等作品广为人知。',
    biography: '薛之谦于2005年通过音乐选秀节目出道，长期参与词曲创作，并以鲜明的叙事型情歌和现场演出形成个人风格。',
  },
];

const curatedSlugs = fallbackPeople.map(({ slug }) => slug);

export async function getPeople() {
  try {
    const base = import.meta.env.PUBLIC_API_BASE_URL;
    if (!base) return fallbackPeople;
    const response = await fetch(`${base}/people`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('People API unavailable');
    const apiPeople = (await response.json()).data as Person[];
    const apiBySlug = new Map(apiPeople.map((item) => [item.slug, item]));
    return curatedSlugs.map((slug) => {
      const fallback = fallbackPeople.find((item) => item.slug === slug)!;
      const remote = apiBySlug.get(slug);
      return { ...(remote ?? fallback), avatarUrl: avatarPath(slug) };
    });
  } catch {
    return fallbackPeople;
  }
}
