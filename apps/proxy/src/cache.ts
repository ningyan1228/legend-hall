import { LRUCache } from 'lru-cache';
type Entry<T>={value:T;expiresAt:number};
const cache=new LRUCache<string,Entry<unknown>>({max:500});
const pending=new Map<string,Promise<unknown>>();
export async function cached<T>(key:string,ttl:number,loader:()=>Promise<T>):Promise<{value:T;cached:boolean;stale?:boolean}>{
  const old=cache.get(key) as Entry<T>|undefined;
  if(old && old.expiresAt>Date.now()) return {value:old.value,cached:true};
  try { let job=pending.get(key) as Promise<T>|undefined; if(!job){job=loader();pending.set(key,job)} const value=await job; cache.set(key,{value,expiresAt:Date.now()+ttl}); return {value,cached:false}; }
  catch(error){if(old)return {value:old.value,cached:true,stale:true};throw error} finally {pending.delete(key)}
}
