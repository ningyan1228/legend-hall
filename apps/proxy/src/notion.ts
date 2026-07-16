import { personSchema, type Person } from '@legend/shared';

const text=(p:any)=>p?.rich_text?.map((x:any)=>x.plain_text).join('')??'';
const title=(p:any)=>p?.title?.map((x:any)=>x.plain_text).join('')??'';
export function mapNotionPerson(page:any):Person { const p=page.properties??{}; return personSchema.parse({ id:page.id,slug:text(p.Slug),nameZh:text(p.NameZh)||title(p.Name),nameEn:text(p.NameEn),nickname:text(p.Nickname),category:p.Category?.select?.name??'football',nationality:p.Nationality?.select?.name??'',birthDate:p.BirthDate?.date?.start??'',deathDate:p.DeathDate?.date?.start??undefined,birthPlace:text(p.BirthPlace),summary:text(p.Summary),biography:text(p.Biography),avatarUrl:p.AvatarUrl?.url??'',coverUrl:p.CoverUrl?.url??'',status:p.Status?.select?.name??'active',featured:p.Featured?.checkbox??false,keywords:p.Keywords?.multi_select?.map((x:any)=>x.name)??[],views:p.Views?.number??0 }); }
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export async function queryPeople():Promise<Person[]>{
  const token=process.env.NOTION_TOKEN, dataSourceId=process.env.NOTION_PEOPLE_DATA_SOURCE_ID;
  if(!token||!dataSourceId) throw new Error('Notion configuration is incomplete');
  for(let attempt=0;attempt<4;attempt++) try {
    const response=await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Notion-Version':process.env.NOTION_VERSION??'2025-09-03','Content-Type':'application/json'},body:JSON.stringify({filter:{property:'Published',checkbox:{equals:true}}}),signal:AbortSignal.timeout(Number(process.env.REQUEST_TIMEOUT_MS??10000))});
    if(!response.ok){const error:any=new Error(`Notion request failed: ${response.status}`);error.status=response.status;error.retryAfter=response.headers.get('retry-after');throw error} const result:any=await response.json();
    return result.results.map(mapNotionPerson);
  } catch(e:any){if(e?.status!==429||attempt===3)throw e; await sleep(Number(e?.retryAfter??2)*1000*2**attempt)}
  return [];
}
