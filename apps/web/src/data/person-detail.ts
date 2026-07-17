import { apiUrl } from './media';

export type PersonDetailData = {
  career: any[];
  statistics: any[];
  honors: any[];
  timeline: any[];
};

export async function getPersonDetail(slug: string): Promise<PersonDetailData | null> {
  const url = apiUrl(`people/${slug}/detail`);
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return null;
    return (await response.json()).data as PersonDetailData;
  } catch {
    return null;
  }
}
