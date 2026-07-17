import { useMemo, useState } from 'react';
import { Grid3X3, Heart, List, Search } from 'lucide-react';
import type { Person } from '@legend/shared';

const categories = [['all', '全部'], ['football', '足球'], ['film', '影视'], ['music', '音乐']] as const;

export default function Explorer({ people, base, compact = false }: { people: Person[]; base: string; compact?: boolean }) {
  const basePath = base.endsWith('/') ? base : `${base}/`;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'gallery' | 'archive'>('gallery');
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('legend-favorites') || '[]').map((x: { slug: string }) => x.slug); }
    catch { return []; }
  });
  const list = useMemo(() => people.filter((item) =>
    (category === 'all' || item.category === category) &&
    [item.nameZh, item.nameEn, item.nationality].join(' ').toLowerCase().includes(query.toLowerCase())
  ), [query, category, people]);
  const toggle = (slug: string) => {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    setSaved(next);
    localStorage.setItem('legend-favorites', JSON.stringify(next.map((item) => ({ slug: item, savedAt: new Date().toISOString() }))));
  };
  const image = (item: Person) => /^https?:\/\//i.test(item.avatarUrl)
    ? item.avatarUrl
    : `${basePath}${item.avatarUrl.replace(/^\/+/, '')}`;

  return <section className={compact ? 'explorer compact' : 'explorer'}>
    <div className="archive-tools">
      <label className="archive-search"><Search size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SEARCH ARCHIVE / 搜索姓名或国家"/></label>
      <div className="archive-filters">{categories.map(([value, label]) => <button key={value} className={category === value ? 'active' : ''} onClick={() => setCategory(value)}>{label}</button>)}</div>
      {!compact && <div className="view-switch"><button aria-label="展廊模式" className={view === 'gallery' ? 'active' : ''} onClick={() => setView('gallery')}><Grid3X3 size={17}/> 展廊</button><button aria-label="档案模式" className={view === 'archive' ? 'active' : ''} onClick={() => setView('archive')}><List size={17}/> 档案</button></div>}
    </div>
    {view === 'gallery' || compact ? <div className="legend-gallery">{list.map((item, index) => <article key={item.slug} className={`legend-card card-${index % 7}`}>
      <a href={`${basePath}people/${item.slug}/`}><img src={image(item)} alt={`${item.nameZh}人物照片`} loading={index < 4 ? 'eager' : 'lazy'}/><div className="card-shade"/><div className="card-index">{String(index + 1).padStart(3, '0')}</div><div className="card-copy"><span>{item.nationality} / {item.category}</span><h3>{item.nameEn}</h3><p>{item.nameZh}</p><i>VIEW ARCHIVE →</i></div></a>
      <button className="heart" aria-label={`收藏${item.nameZh}`} onClick={() => toggle(item.slug)}><Heart fill={saved.includes(item.slug) ? 'currentColor' : 'none'}/></button>
    </article>)}</div> : <div className="archive-list">{list.map((item, index) => <a key={item.slug} href={`${basePath}people/${item.slug}/`}><b>{String(index + 1).padStart(3, '0')}</b><strong>{item.nameEn}</strong><span>{item.nameZh}</span><span>{item.nationality}</span><span>{item.category}</span><time>{item.birthDate.slice(0, 4)}</time><i>→</i></a>)}</div>}
    {!list.length && <p className="empty">没有找到匹配人物</p>}
  </section>;
}
