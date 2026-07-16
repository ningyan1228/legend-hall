import { z } from 'zod';

export const categorySchema = z.enum(['football', 'basketball', 'film', 'music']);
export const statusSchema = z.enum(['active', 'retired', 'deceased']);
export const personSchema = z.object({
  id: z.string(), slug: z.string(), nameZh: z.string(), nameEn: z.string(), nickname: z.string().default(''),
  category: categorySchema, nationality: z.string(), birthDate: z.string(), deathDate: z.string().optional(),
  birthPlace: z.string().default(''), summary: z.string(), biography: z.string(), avatarUrl: z.string(), coverUrl: z.string(),
  status: statusSchema, featured: z.boolean(), keywords: z.array(z.string()).default([]), views: z.number().default(0)
});
export const careerSchema = z.object({ id:z.string(), personSlug:z.string(), organization:z.string(), role:z.string(), startDate:z.string(), endDate:z.string().optional(), appearances:z.number().optional(), goals:z.number().optional(), assists:z.number().optional(), description:z.string() });
export const statisticSchema = z.object({ id:z.string(), personSlug:z.string(), season:z.string(), team:z.string(), competition:z.string(), appearances:z.number().default(0), goals:z.number().default(0), assists:z.number().default(0), extra:z.record(z.unknown()).default({}) });
export const honorSchema = z.object({ id:z.string(), personSlug:z.string(), year:z.number(), category:z.string(), organization:z.string(), count:z.number().default(1), description:z.string(), featured:z.boolean().default(false) });
export const timelineSchema = z.object({ id:z.string(), personSlug:z.string(), eventDate:z.string(), year:z.number(), eventType:z.string(), title:z.string(), description:z.string(), imageUrl:z.string().optional(), relatedUrl:z.string().optional() });
export const newsSchema = z.object({ id:z.string(), title:z.string(), summary:z.string(), source:z.string(), sourceUrl:z.string(), publishedAt:z.string(), imageUrl:z.string(), person:z.string(), isDemo:z.boolean(), verified:z.boolean() });
export const mediaSchema = z.object({ id:z.string(), personSlug:z.string(), mediaType:z.string(), mediaUrl:z.string(), thumbnailUrl:z.string(), source:z.string(), copyright:z.string(), photographer:z.string(), alt:z.string() });
export const relatedPersonSchema = z.object({ id:z.string(), personSlug:z.string(), relatedSlug:z.string(), relationType:z.string(), weight:z.number(), description:z.string() });
export type Person=z.infer<typeof personSchema>; export type CareerRecord=z.infer<typeof careerSchema>; export type Statistic=z.infer<typeof statisticSchema>; export type Honor=z.infer<typeof honorSchema>; export type TimelineEvent=z.infer<typeof timelineSchema>; export type NewsArticle=z.infer<typeof newsSchema>; export type MediaItem=z.infer<typeof mediaSchema>; export type RelatedPerson=z.infer<typeof relatedPersonSchema>;
export type ApiResponse<T> = { success:true; data:T; meta?:{page?:number;pageSize?:number;total?:number;cached:boolean;stale?:boolean}; message?:string } | { success:false; data:null; error:{code:string;message:string} };
