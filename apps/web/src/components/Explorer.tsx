import { useMemo, useState } from 'react';
import { Grid3X3, Heart, List, Search } from 'lucide-react';
import type { Person } from '@legend/shared';

const categories=[['all','全部'],['football','足球'],['basketball','篮球'],['film','影视'],['music','音乐']] as const;

export default function Explorer({people,base,compact=false}:{people:Person[];base:string;compact?:boolean}){
  const basePath=base.endsWith('/')?base:`${base}/`;
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [view,setView]=useState<'gallery'|'archive'>('gallery');
  const [saved,setSaved]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('legend-favorites')||'[]').map((x:{slug:string})=>x.slug)}catch{return[]}});
  const list=useMemo(()=>people.filter(person=>(category==='all'||person.category===category)&&[person.nameZh,person.nameEn,person.nationality].join(' ').toLowerCase().includes(query.toLowerCase())),[query,category,people]);
  const toggle=(slug:string)=>{const next=saved.includes(slug)?saved.filter(x=>x!==slug):[...saved,slug];setSaved(next);localStorage.setItem('legend-favorites',JSON.stringify(next.map(item=>({slug:item,savedAt:new Date().toISOString()}))))};
  const image=(person:Person)=>`${basePath}${person.avatarUrl.replace(/^\/+/, '')}`;
  return <section className={compact?'explorer compact':'explorer'}>
    <div className="archive-tools">
      <label className="archive-search"><Search size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="SEARCH ARCHIVE / 搜索姓名或国家"/></label>
      <div className="archive-filters">{categories.map(([value,label])=><button key={value} className={category===value?'active':''} onClick={()=>setCategory(value)}>{label}</button>)}</div>
      {!compact&&<div className="view-switch"><button aria-label="展廊模式" className={view==='gallery'?'active':''} onClick={()=>setView('gallery')}><Grid3X3 size={17}/> 展廊</button><button aria-label="档案模式" className={view==='archive'?'active':''} onClick={()=>setView('archive')}><List size={17}/> 档案</button></div>}
    </div>
    {view==='gallery'||compact?<div className="legend-gallery">{list.map((person,index)=><article key={person.slug} className={`legend-card card-${index%7}`}>
      <a href={`${basePath}people/${person.slug}/`}><img src={image(person)} alt={`${person.nameZh}人物照片`} loading={index<4?'eager':'lazy'}/><div className="card-shade"/><div className="card-index">{String(index+1).padStart(3,'0')}</div><div className="card-copy"><span>{person.nationality} / {person.category}</span><h3>{person.nameEn}</h3><p>{person.nameZh}</p><i>VIEW ARCHIVE →</i></div></a>
      <button className="heart" aria-label={`收藏${person.nameZh}`} onClick={()=>toggle(person.slug)}><Heart fill={saved.includes(person.slug)?'currentColor':'none'}/></button>
    </article>)}</div>:<div className="archive-list">{list.map((person,index)=><a key={person.slug} href={`${basePath}people/${person.slug}/`}><b>{String(index+1).padStart(3,'0')}</b><strong>{person.nameEn}</strong><span>{person.nameZh}</span><span>{person.nationality}</span><span>{person.category}</span><time>{person.birthDate.slice(0,4)}</time><i>→</i></a>)}</div>}
    {!list.length&&<p className="empty">没有找到匹配人物</p>}
  </section>
}
